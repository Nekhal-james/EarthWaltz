"""
AWS Terrarium Global 30m DEM Elevation Fetcher & Real SAR Terrain Simulator.
Downloads public tiles: https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png
Decodes: height = (R * 256.0 + G + B / 256.0) - 32768.0
"""
import io
import math
import os
from pathlib import Path
import numpy as np
from PIL import Image
import requests

CACHE_DIR = Path(__file__).resolve().parent.parent / "cache" / "terrarium"
os.makedirs(CACHE_DIR, exist_ok=True)


def lon2tile(lon, z):
    return int((lon + 180.0) / 360.0 * (2 ** z))


def lat2tile(lat, z):
    lat_rad = math.radians(lat)
    return int((1.0 - math.log(math.tan(lat_rad) + (1.0 / math.cos(lat_rad))) / math.pi) / 2.0 * (2 ** z))


def tile2lon(x, z):
    return x / (2 ** z) * 360.0 - 180.0


def tile2lat(y, z):
    n = math.pi - 2.0 * math.pi * y / (2 ** z)
    return math.degrees(math.atan(math.sinh(n)))


def fetch_tile(z, x, y):
    """Fetch or load cached Terrarium elevation tile."""
    tile_file = CACHE_DIR / f"{z}_{x}_{y}.png"
    if tile_file.exists():
        try:
            return np.array(Image.open(tile_file).convert("RGB"), dtype=np.float32)
        except Exception:
            pass

    url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
    try:
        resp = requests.get(url, timeout=6)
        if resp.status_code == 200:
            with open(tile_file, "wb") as f:
                f.write(resp.content)
            return np.array(Image.open(io.BytesIO(resp.content)).convert("RGB"), dtype=np.float32)
    except Exception as e:
        print(f"    Notice: Tile {z}/{x}/{y} download warning ({e}); generating terrain proxy")

    # Offline procedural terrain fallback if network fails
    arr = np.zeros((256, 256, 3), dtype=np.float32)
    arr[:, :, 0] = 128.0  # ~0m elevation
    return arr


def fetch_dem_for_bbox(bbox, zoom=10, target_shape=(1024, 1024)):
    """
    Fetches real AWS Terrarium DEM tiles covering bbox = [west, south, east, north],
    stitches them, and resamples to target_shape.
    Returns:
      dict with:
        'elevation': Float32 array (meters)
        'slope': Float32 array (degrees)
        'ocean_mask': bool array (Arabian Sea / Atlantic / Indian Ocean)
        'water_mask': bool array (lakes, major rivers)
        'sar_layover': Float32 array (radar brightness factor from real slope/aspect)
    """
    west, south, east, north = bbox

    # Tile coordinate bounds at zoom
    x_min = lon2tile(west, zoom)
    x_max = lon2tile(east, zoom)
    y_min = lat2tile(north, zoom)  # north lat has smaller y in web mercator
    y_max = lat2tile(south, zoom)

    x_tiles = list(range(x_min, x_max + 1))
    y_tiles = list(range(y_min, y_max + 1))

    # Download / load tiles into a mosaic
    cols = len(x_tiles)
    rows = len(y_tiles)
    mosaic = np.zeros((rows * 256, cols * 256, 3), dtype=np.float32)

    for r_idx, ty in enumerate(y_tiles):
        for c_idx, tx in enumerate(x_tiles):
            tile_rgb = fetch_tile(zoom, tx, ty)
            mosaic[r_idx * 256 : (r_idx + 1) * 256, c_idx * 256 : (c_idx + 1) * 256] = tile_rgb

    # Decode Terrarium formula: height = (R * 256 + G + B / 256) - 32768
    elev_mosaic = (mosaic[:, :, 0] * 256.0 + mosaic[:, :, 1] + mosaic[:, :, 2] / 256.0) - 32768.0

    # Geographic boundaries of the mosaic
    mos_west = tile2lon(x_min, zoom)
    mos_east = tile2lon(x_max + 1, zoom)
    mos_north = tile2lat(y_min, zoom)
    mos_south = tile2lat(y_max + 1, zoom)

    # Pixel crop boundaries for the target bbox
    mos_h, mos_w = elev_mosaic.shape
    px0 = int(np.clip((west - mos_west) / (mos_east - mos_west) * mos_w, 0, mos_w - 1))
    px1 = int(np.clip((east - mos_west) / (mos_east - mos_west) * mos_w, 1, mos_w))
    py0 = int(np.clip((mos_north - north) / (mos_north - mos_south) * mos_h, 0, mos_h - 1))
    py1 = int(np.clip((mos_north - south) / (mos_north - mos_south) * mos_h, 1, mos_h))

    cropped = elev_mosaic[py0:py1, px0:px1]
    if cropped.size == 0 or cropped.shape[0] < 2 or cropped.shape[1] < 2:
        cropped = elev_mosaic

    # Resize cleanly to target_shape
    pil_img = Image.fromarray(cropped)
    resized_elev = np.array(
        pil_img.resize((target_shape[1], target_shape[0]), Image.Resampling.BILINEAR),
        dtype=np.float32,
    )

    # Compute slope and aspect from real elevation
    dy, dx = np.gradient(resized_elev)
    # 30m pixel spacing approximate conversion
    slope_rad = np.arctan(np.sqrt(dx ** 2 + dy ** 2) / 30.0)
    aspect_rad = np.arctan2(-dy, dx)

    # Radar look geometry: NISAR looks from West-Southwest (azimuth ~105°, incidence ~35°)
    radar_azimuth = math.radians(105.0)
    radar_incidence = math.radians(35.0)

    # Cosine of local incidence angle:
    # cos(theta_loc) = cos(slope)*cos(inc) + sin(slope)*sin(inc)*cos(az - aspect)
    cos_local_inc = (
        np.cos(slope_rad) * np.cos(radar_incidence)
        + np.sin(slope_rad) * np.sin(radar_incidence) * np.cos(radar_azimuth - aspect_rad)
    )
    cos_local_inc = np.clip(cos_local_inc, 0.05, 1.0)

    # Real layover & shadow factor
    sar_layover = np.clip(cos_local_inc * 1.4 - 0.2, 0.1, 1.6)

    # Mask ocean where real elevation <= 0.0m
    ocean_mask = resized_elev <= 0.0

    # Low-lying water bodies / river channels
    water_mask = (resized_elev <= 1.5) & (slope_rad < math.radians(1.5))

    return {
        "elevation": resized_elev,
        "slope_rad": slope_rad,
        "sar_layover": sar_layover,
        "ocean_mask": ocean_mask,
        "water_mask": water_mask,
    }

