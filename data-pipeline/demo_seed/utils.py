"""
Shared utilities for SAR data generation:
  - Perlin-like & multi-octave fractal noise via numpy
  - Organic dendritic river networks and fractal clusters (no rectangular blocks)
  - Realistic fault rupture InSAR fringes and glacier valley flow
  - Kerala geographic coastline, Vembanad Lake & Kuttanad polder models
  - Orbital swath alpha vignetting (NISAR ~11° inclination)
  - Colormaps & writers (GeoTIFF, WebP, Telemetry JSON, Time-series)
"""
import json
import math
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS


# ---------------------------------------------------------------------------
# Noise & Fractal Helpers
# ---------------------------------------------------------------------------

def _fade(t):
    return 6 * t**5 - 15 * t**4 + 10 * t**3


def perlin_noise(shape=(1024, 1024), scale=64, seed=42):
    """Generate 2-D Perlin-like noise in [0, 1] using numpy only."""
    rng = np.random.RandomState(seed)
    h, w = shape
    gy = int(math.ceil(h / scale)) + 2
    gx = int(math.ceil(w / scale)) + 2
    angles = rng.uniform(0, 2 * np.pi, (gy, gx))
    grad_x = np.cos(angles)
    grad_y = np.sin(angles)

    y_coords = np.linspace(0, (h - 1) / scale, h)
    x_coords = np.linspace(0, (w - 1) / scale, w)
    xv, yv = np.meshgrid(x_coords, y_coords)

    x0 = np.floor(xv).astype(int)
    y0 = np.floor(yv).astype(int)
    x1 = x0 + 1
    y1 = y0 + 1

    sx = _fade(xv - x0)
    sy = _fade(yv - y0)

    def dot_grid(iy, ix):
        return grad_x[iy, ix] * (xv - ix) + grad_y[iy, ix] * (yv - iy)

    n00 = dot_grid(y0, x0)
    n10 = dot_grid(y1, x0)
    n01 = dot_grid(y0, x1)
    n11 = dot_grid(y1, x1)

    ix0 = n00 + sx * (n01 - n00)
    ix1 = n10 + sx * (n11 - n10)
    val = ix0 + sy * (ix1 - ix0)

    val = (val - val.min()) / (val.max() - val.min() + 1e-10)
    return val


def multi_octave_noise(shape=(1024, 1024), octaves=5, base_scale=160, seed=42):
    """Sum multiple octaves of Perlin noise for rich fractal terrain textures."""
    result = np.zeros(shape, dtype=np.float64)
    amplitude = 1.0
    total_amp = 0.0
    for i in range(octaves):
        sc = max(base_scale // (2 ** i), 4)
        result += amplitude * perlin_noise(shape, scale=sc, seed=seed + i * 29)
        total_amp += amplitude
        amplitude *= 0.52
    return result / total_amp


def gaussian_blur(arr, radius=4):
    """Gaussian blur a 2-D array using Pillow."""
    normalized = np.clip((arr - arr.min()) / (arr.max() - arr.min() + 1e-10), 0, 1)
    img = Image.fromarray((normalized * 255).astype(np.uint8), mode='L')
    img = img.filter(ImageFilter.GaussianBlur(radius=radius))
    res = np.asarray(img).astype(np.float64) / 255.0
    return res * (arr.max() - arr.min()) + arr.min()


# ---------------------------------------------------------------------------
# Orbital Swath Vignette / Feathered Edge Mask (NISAR ~11° inclination)
# ---------------------------------------------------------------------------

def apply_orbital_swath_mask(rgba, angle_deg=11.0, margin_x=0.06, margin_y=0.04, feather=45):
    """
    Apply a realistic feathered satellite orbital swath mask tilted at `angle_deg`.
    Edges smoothly taper to alpha=0 so the SAR raster blends into the globe basemap.
    """
    h, w, _ = rgba.shape
    rad = math.radians(angle_deg)
    cos_a, sin_a = math.cos(rad), math.sin(rad)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    cx, cy = w / 2.0, h / 2.0

    # Rotated coordinates relative to center
    dx = xx - cx
    dy = yy - cy
    x_rot = dx * cos_a - dy * sin_a
    y_rot = dx * sin_a + dy * cos_a

    swath_half_w = (w / 2.0) * (1.0 - margin_x * 2)
    swath_half_h = (h / 2.0) * (1.0 - margin_y * 2)

    dist_x = swath_half_w - np.abs(x_rot)
    dist_y = swath_half_h - np.abs(y_rot)
    dist = np.minimum(dist_x, dist_y)

    alpha_mask = np.zeros((h, w), dtype=np.float64)
    inside = dist >= feather
    alpha_mask[inside] = 1.0

    edge = (dist > 0) & (dist < feather)
    t = dist[edge] / float(feather)
    # Smoothstep cosine fade
    alpha_mask[edge] = 0.5 * (1.0 - np.cos(np.pi * t))

    # Apply to existing alpha channel
    existing_alpha = rgba[..., 3].astype(np.float64) / 255.0
    combined_alpha = np.clip(existing_alpha * alpha_mask * 255.0, 0, 255).astype(np.uint8)

    out = rgba.copy()
    out[..., 3] = combined_alpha
    return out


# ---------------------------------------------------------------------------
# Organic Feature Generators (Zero rectangular block patches!)
# ---------------------------------------------------------------------------

def make_organic_cluster_mask(shape=(1024, 1024), seed=42, threshold=0.62, scale=70):
    """Generate natural organic patch clusters using fractal noise and thresholding."""
    noise = multi_octave_noise(shape, octaves=4, base_scale=scale, seed=seed)
    mask = noise > threshold
    return mask


def make_dendritic_river(shape=(1024, 1024), seed=42, main_direction='vertical'):
    """Generate a sinuous river with dendritic curved branches."""
    rng = np.random.RandomState(seed)
    h, w = shape
    mask = np.zeros(shape, dtype=bool)

    if main_direction == 'vertical':
        x_center = w * 0.45 + rng.uniform(-40, 40)
        amp = rng.uniform(80, 140)
        freq = rng.uniform(2.5, 4.0)
        width_base = rng.randint(10, 18)

        for y in range(h):
            meander = math.sin(2 * math.pi * freq * (y / h)) * amp + math.sin(4 * math.pi * (y / h)) * (amp * 0.3)
            cx = int(x_center + meander)
            w_here = max(4, int(width_base + 6 * math.sin(math.pi * y / h)))
            x0 = max(0, cx - w_here)
            x1 = min(w - 1, cx + w_here)
            mask[y, x0:x1] = True

        # Add 3 curved tributaries
        for t_idx in range(3):
            y_start = rng.randint(int(h * 0.2), int(h * 0.8))
            x_start = int(x_center + math.sin(2 * math.pi * freq * (y_start / h)) * amp)
            direction = 1 if rng.rand() > 0.5 else -1
            length = rng.randint(180, 320)
            cur_x = x_start
            cur_y = y_start
            for step in range(length):
                cur_x += direction * (rng.uniform(0.6, 1.4) + 0.3 * math.sin(step / 15.0))
                cur_y += rng.uniform(-0.5, 0.5)
                ix, iy = int(cur_x), int(cur_y)
                if 0 <= ix < w and 0 <= iy < h:
                    tw = max(2, int(6 * (1.0 - step / length)))
                    mask[max(0, iy - tw):min(h, iy + tw), max(0, ix - tw):min(w, ix + tw)] = True
    else:
        # Horizontal river
        y_center = h * 0.5
        amp = rng.uniform(60, 110)
        for x in range(w):
            meander = math.sin(2 * math.pi * 3.0 * (x / w)) * amp
            cy = int(y_center + meander)
            w_here = max(6, int(12 + 4 * math.sin(math.pi * x / w)))
            y0 = max(0, cy - w_here)
            y1 = min(h - 1, cy + w_here)
            mask[y0:y1, x] = True

    return mask


# ---------------------------------------------------------------------------
# High-Fidelity Kerala Geographic Model
# ---------------------------------------------------------------------------

def generate_kerala_geographic_masks(shape=(1024, 1024)):
    """
    Accurately maps the real Vembanad Lake, Kuttanad below-sea-level polders,
    Arabian Sea coastline, and Western Ghats relief across:
    Lon: 76.25°E to 77.15°E (west -> east)
    Lat: 9.25°N to 10.05°N  (south -> north, top row = 10.05°N, bottom row = 9.25°N)
    """
    h, w = shape
    # Coordinate grids
    lons = np.linspace(76.25, 77.15, w)
    lats = np.linspace(10.05, 9.25, h)  # row 0 is North (10.05)
    lon_grid, lat_grid = np.meshgrid(lons, lats)

    # 1. Arabian Sea Coastline
    # Real coastline: passes near Alappuzha (76.33°E, 9.49°N) to Kochi (76.27°E, 9.93°N)
    # Coast lon as function of lat
    coast_lon = 76.27 + (10.05 - lat_grid) * 0.12 - 0.03 * np.sin((lat_grid - 9.25) * 8.0)
    ocean_mask = lon_grid < coast_lon

    # 2. Vembanad Lake
    # Elongated brackish lagoon extending from Alappuzha (~9.49°N, 76.34°E) northwards through Kumarakom to Kochi (~9.97°N, 76.28°E)
    lake_center_lon = 76.34 - (lat_grid - 9.40) * 0.13 + 0.015 * np.sin((lat_grid - 9.40) * 12.0)
    lake_half_width = 0.018 + 0.012 * np.sin((lat_grid - 9.40) * 5.0)
    lake_half_width = np.clip(lake_half_width, 0.006, 0.032)

    in_lake_lat = (lat_grid >= 9.42) & (lat_grid <= 9.98)
    lake_mask = in_lake_lat & (np.abs(lon_grid - lake_center_lon) < lake_half_width) & (~ocean_mask)

    # 3. Kuttanad Below-Sea-Level Polder Belt
    # Lies to the south and east of Vembanad Lake (Lat: 9.30°N to 9.62°N, Lon: 76.36°E to 76.62°E)
    in_kuttanad_box = (lat_grid >= 9.30) & (lat_grid <= 9.62) & (lon_grid >= 76.36) & (lon_grid <= 76.62)
    # Organic fractal parcel clusters
    polder_noise = multi_octave_noise(shape, octaves=4, base_scale=45, seed=108)
    kuttanad_polders = in_kuttanad_box & (polder_noise > 0.42) & (~lake_mask) & (~ocean_mask)

    # 4. Western Ghats Mountain Slopes (Eastern section, lon > 76.65)
    ghats_dist = np.clip((lon_grid - 76.65) / 0.40, 0, 1)
    ghats_terrain = multi_octave_noise(shape, octaves=6, base_scale=120, seed=109) * ghats_dist

    return {
        'ocean_mask': ocean_mask,
        'lake_mask': lake_mask,
        'kuttanad_polders': kuttanad_polders,
        'ghats_terrain': ghats_terrain,
        'ghats_dist': ghats_dist,
        'lon_grid': lon_grid,
        'lat_grid': lat_grid,
    }


# ---------------------------------------------------------------------------
# Backscatter generation (Organic, Realistic SAR Physics)
# ---------------------------------------------------------------------------

def generate_backscatter(shape=(1024, 1024), pol='HH', seed=42, area_type='general'):
    """
    Generate authentic SAR backscatter (in dB) using organic fractal distributions.
    Zero sharp axis-aligned rectangles.
    """
    rng = np.random.RandomState(seed)
    base = multi_octave_noise(shape, octaves=5, base_scale=140, seed=seed)

    if pol.upper() in ('HH', 'VV'):
        db = base * 18.0 - 16.0  # -16 to +2 dB baseline
    else:  # HV
        db = base * 14.0 - 21.0  # -21 to -7 dB baseline (depolarization)

    if area_type == 'amazon':
        # Dense tropical rainforest canopy + sinuous rivers
        river = make_dendritic_river(shape, seed=seed + 1, main_direction='vertical')
        river2 = make_dendritic_river(shape, seed=seed + 5, main_direction='horizontal')
        all_water = river | river2

        # Varzea flooded forest along river banks (double bounce)
        water_dilated = gaussian_blur(all_water.astype(float), radius=6) > 0.15
        varzea = water_dilated & (~all_water)

        if pol.upper() in ('HH', 'VV'):
            db[all_water] = rng.uniform(-25.0, -21.0, all_water.sum())
            db[varzea] = np.clip(db[varzea] + 6.0, -8.0, 3.0)  # Double-bounce
        else:
            db[all_water] = rng.uniform(-30.0, -26.0, all_water.sum())
            db[varzea] = np.clip(db[varzea] + 3.0, -14.0, -6.0)

    elif area_type == 'punjab':
        # Organic agricultural parcel mosaic (Voronoi/Perlin parcel boundaries, not rectangles)
        parcel_noise = multi_octave_noise(shape, octaves=4, base_scale=40, seed=seed + 3)
        fields_high_moisture = parcel_noise > 0.58
        fields_dry = parcel_noise < 0.35

        canal = make_dendritic_river(shape, seed=seed + 7, main_direction='vertical')
        if pol.upper() in ('HH', 'VV'):
            db[fields_high_moisture] = np.clip(db[fields_high_moisture] + 5.5, -9.0, 2.0)
            db[fields_dry] = np.clip(db[fields_dry] - 4.0, -22.0, -14.0)
            db[canal] = rng.uniform(-24.0, -20.0, canal.sum())
        else:
            db[fields_high_moisture] = np.clip(db[fields_high_moisture] + 3.0, -15.0, -7.0)
            db[fields_dry] = np.clip(db[fields_dry] - 3.0, -25.0, -17.0)
            db[canal] = rng.uniform(-28.0, -24.0, canal.sum())

    elif area_type == 'indonesia':
        # Organic peatland fire burn scars (irregular perimeter)
        scar_noise = multi_octave_noise(shape, octaves=4, base_scale=75, seed=seed + 2)
        burn_scars = scar_noise > 0.60
        if pol.upper() in ('HH', 'VV'):
            db[burn_scars] = np.clip(db[burn_scars] - 6.0, -24.0, -16.0)
        else:
            # Significant loss of volume scattering in burn scars
            db[burn_scars] = np.clip(db[burn_scars] - 8.5, -28.0, -18.0)

    else:
        # General organic natural landscape
        river = make_dendritic_river(shape, seed=seed + 1)
        db[river] = rng.uniform(-25.0, -20.0, river.sum())

    # Add realistic multi-look SAR speckle
    speckle = rng.standard_normal(shape) * 1.2
    db = np.clip(db + speckle, -26.0, 5.0).astype(np.float32)

    # Multi-look smoothing
    db_norm = (db + 26.0) / 31.0
    db_norm = gaussian_blur(db_norm, radius=2)
    db = (db_norm * 31.0 - 26.0).astype(np.float32)

    return db


# ---------------------------------------------------------------------------
# InSAR Phase (Realistic Fault Rupture Shear & Glacial Flow)
# ---------------------------------------------------------------------------

def generate_insar_phase(shape=(1024, 1024), seed=42, mode='earthquake'):
    """
    Generate InSAR phase in radians [-π, π].
    'earthquake' -> Organic strike-slip fault with shear discontinuity and elliptical fringes.
    'subsidence' -> Smooth regional subsidence gradient.
    """
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)

    if mode == 'earthquake':
        # Fault trace running diagonally (~35°) across Kahramanmaraş / fault zone
        cx, cy = w * 0.5, h * 0.5
        rot_angle = math.radians(35.0)
        # Distance along fault and perpendicular to fault
        x_fault = (xx - cx) * math.cos(rot_angle) + (yy - cy) * math.sin(rot_angle)
        y_perp = -(xx - cx) * math.sin(rot_angle) + (yy - cy) * math.cos(rot_angle)

        # Gentle curve along fault line
        fault_curve = 25.0 * np.sin(x_fault / 140.0)
        dist_to_fault = y_perp - fault_curve

        # Strike-slip shear deformation: opposite signs on either side of the fault
        slip = 7.0 * np.sign(dist_to_fault) * np.exp(-np.abs(dist_to_fault) / 160.0) * np.exp(-(x_fault / 280.0) ** 2)

        # Nested elliptical fringes radiating outward
        r_ellipse = np.sqrt((x_fault / 2.0) ** 2 + y_perp ** 2)
        concentric = 4.0 * np.sin(r_ellipse / 32.0)

        phase_raw = slip * np.pi + concentric
    else:
        # Gentle regional subsidence
        phase_raw = (yy / h - 0.5) * 2.5 * np.pi + 0.4 * np.sin(xx / w * np.pi * 3.5)

    # Wrap to [-π, π]
    phase = np.arctan2(np.sin(phase_raw), np.cos(phase_raw))

    # Add realistic spatial decorrelation
    low_coh = multi_octave_noise(shape, octaves=3, base_scale=90, seed=seed + 1) > 0.65
    noise = np.random.RandomState(seed).standard_normal(shape) * 0.8
    phase[low_coh] += noise[low_coh]
    phase = np.arctan2(np.sin(phase), np.cos(phase)).astype(np.float32)

    return phase


# ---------------------------------------------------------------------------
# Coherence Generation
# ---------------------------------------------------------------------------

def generate_coherence(shape=(1024, 1024), seed=42, area_type='general'):
    """Generate realistic SAR interferometric coherence (0.0 to 1.0)."""
    base = multi_octave_noise(shape, octaves=4, base_scale=110, seed=seed)
    coh = base * 0.45 + 0.35  # Baseline 0.35 to 0.80

    if area_type == 'kerala':
        masks = generate_kerala_geographic_masks(shape)
        coh[masks['ocean_mask']] = np.random.RandomState(seed).uniform(0.01, 0.08, masks['ocean_mask'].sum())
        coh[masks['lake_mask']] = np.random.RandomState(seed + 1).uniform(0.02, 0.12, masks['lake_mask'].sum())
        coh[masks['kuttanad_polders']] = np.random.RandomState(seed + 2).uniform(0.55, 0.85, masks['kuttanad_polders'].sum())
    else:
        # River decorrelation
        river = make_dendritic_river(shape, seed=seed + 1)
        coh[river] = np.random.RandomState(seed).uniform(0.02, 0.12, river.sum())

    coh = np.clip(coh, 0.0, 1.0).astype(np.float32)
    return coh


# ---------------------------------------------------------------------------
# GOFF (Ground Offset Displacement) for Glaciers
# ---------------------------------------------------------------------------

def generate_goff(shape=(1024, 1024), direction='range', seed=42):
    """
    Generate glacier displacement map (in meters) with downhill curving valley flow.
    """
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)

    # 3 dendritic glacier flow paths
    disp = np.zeros(shape, dtype=np.float64)
    rng = np.random.RandomState(seed)

    for g in range(3):
        gx_start = w * (0.25 + 0.25 * g)
        gy_start = h * 0.15
        curve = rng.uniform(40, 90)
        # Sinuous valley axis
        valley_x = gx_start + curve * np.sin(yy / 120.0 + g)
        dist_to_valley = np.abs(xx - valley_x)
        valley_width = 35.0 + 15.0 * (yy / h)

        # Flow velocity peaks in center of channel, decreases toward lateral moraines
        in_glacier = (dist_to_valley < valley_width) & (yy >= gy_start) & (yy <= h * 0.85)
        lateral_factor = np.cos((dist_to_valley[in_glacier] / valley_width[in_glacier]) * (np.pi / 2.0))
        # Accelerates in middle reach
        flow_speed = 1.8 * lateral_factor * np.sin((yy[in_glacier] - gy_start) / (h * 0.7) * np.pi)
        disp[in_glacier] = np.maximum(disp[in_glacier], flow_speed)

    if direction == 'azimuth':
        disp = disp * 0.7 + rng.standard_normal(shape) * 0.05
    else:
        disp = disp + rng.standard_normal(shape) * 0.05

    return disp.astype(np.float32)


# ---------------------------------------------------------------------------
# Colormaps (Pure NumPy, Scientifically Calibrated)
# ---------------------------------------------------------------------------

def colormap_hh(data_db, vmin=-24.0, vmax=0.0):
    """
    HH Backscatter: Scientific Selective Anomaly Masking
    - Specular open water and flood (< -17.5 dB): deep cobalt-cyan #0284C7 ([2, 132, 199]) to #38BDF8 ([56, 189, 248]), alpha = 215.0
    - Double-bounce flooded crops, submerged polders, urban (> -6.8 dB): signal gold #F59E0B ([245, 158, 11]) to #FEF08A ([254, 240, 138]), alpha = 240.0
    - Normal mid-range dry land (-17.5 <= dB <= -6.8): transparent alpha = 18.0 (<= 25)
    - Alpha clipped to [0, 245]
    """
    norm = np.clip((data_db - vmin) / (vmax - vmin), 0.0, 1.0)
    h, w = norm.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    c_water = np.array([2, 132, 199], dtype=np.float64)       # Deep Cobalt-Cyan #0284C7 (-24 dB)
    c_water_high = np.array([56, 189, 248], dtype=np.float64) # Light Cyan #38BDF8 (-17.5 dB)
    c_land = np.array([30, 41, 59], dtype=np.float64)         # Translucent Slate #1E293B (-12 dB)
    c_amber = np.array([245, 158, 11], dtype=np.float64)      # Signal Gold #F59E0B (-6.8 dB)
    c_gold = np.array([254, 240, 138], dtype=np.float64)      # Pale Gold #FEF08A (0 dB)

    t1 = (-17.5 - vmin) / (vmax - vmin)
    t_mid = (-12.0 - vmin) / (vmax - vmin)
    t2 = (-6.8 - vmin) / (vmax - vmin)

    m0 = norm < t1
    m1 = (norm >= t1) & (norm < t_mid)
    m2 = (norm >= t_mid) & (norm < t2)
    m3 = norm >= t2

    t0_interp = norm[m0] / t1
    t1_interp = (norm[m1] - t1) / (t_mid - t1)
    t2_interp = (norm[m2] - t_mid) / (t2 - t_mid)
    t3_interp = (norm[m3] - t2) / (1.0 - t2)

    for c in range(3):
        rgba[..., c][m0] = ((1.0 - t0_interp) * c_water[c] + t0_interp * c_water_high[c]).astype(np.uint8)
        rgba[..., c][m1] = ((1.0 - t1_interp) * c_water_high[c] + t1_interp * c_land[c]).astype(np.uint8)
        rgba[..., c][m2] = ((1.0 - t2_interp) * c_land[c] + t2_interp * c_amber[c]).astype(np.uint8)
        rgba[..., c][m3] = ((1.0 - t3_interp) * c_amber[c] + t3_interp * c_gold[c]).astype(np.uint8)

    # SELECTIVE ANOMALY ALPHA MASKING
    # Normal mid-range dry land: -17.5 <= dB <= -6.8, transparent alpha = 18.0 (must be <= 25)
    alpha = np.full((h, w), 18.0, dtype=np.float64)

    # Specular open water and flood (< -17.5 dB): alpha = 215.0
    water_mask = data_db < -17.5
    alpha[water_mask] = 215.0

    # Double-bounce flooded crops, submerged polders, urban (> -6.8 dB): alpha = 240.0
    bounce_mask = data_db > -6.8
    alpha[bounce_mask] = 240.0

    rgba[..., 3] = np.clip(alpha, 0, 245).astype(np.uint8)
    return rgba


def colormap_hv(data_db, vmin=-24.0, vmax=-9.0, water_mask=None):
    """
    HV Biomass & Forest Canopy / Deforestation Colormap:
    - Dense high-biomass canopy (> -12.0 dB): vivid canopy emerald #10B981 ([16, 185, 129]), alpha = 195.0
    - Deforested clear-cuts, logging scars, burn scars on land (< -17.5 dB outside rivers): vermilion-coral #E11D48 ([225, 29, 72]), alpha = 230.0
    - Moderate vegetation (-17.5 <= dB <= -12.0): alpha = 20.0
    - Water in HV: alpha = 15.0
    - Alpha clipped to [0, 235]
    """
    norm = np.clip((data_db - vmin) / (vmax - vmin), 0.0, 1.0)
    h, w = norm.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    c_deforest = np.array([225, 29, 72], dtype=np.float64)   # Vermilion-Coral #E11D48 (< -17.5 dB)
    c_cleared = np.array([251, 146, 60], dtype=np.float64)   # Orange #FB923C (-16 dB)
    c_mid = np.array([52, 115, 87], dtype=np.float64)        # Muted Forest #347357 (-14 dB)
    c_canopy = np.array([16, 185, 129], dtype=np.float64)    # Vivid Canopy Emerald #10B981 (> -12 dB)
    c_water = np.array([30, 41, 59], dtype=np.float64)       # Dark Slate for water

    t_loss = (-17.5 - vmin) / (vmax - vmin)
    t_mid = (-14.5 - vmin) / (vmax - vmin)
    t_canopy = (-12.0 - vmin) / (vmax - vmin)

    m0 = norm < t_loss
    m1 = (norm >= t_loss) & (norm < t_mid)
    m2 = (norm >= t_mid) & (norm < t_canopy)
    m3 = norm >= t_canopy

    t1_interp = (norm[m1] - t_loss) / (t_mid - t_loss)
    t2_interp = (norm[m2] - t_mid) / (t_canopy - t_mid)

    for c in range(3):
        rgba[..., c][m0] = int(c_deforest[c])
        rgba[..., c][m1] = ((1.0 - t1_interp) * c_cleared[c] + t1_interp * c_mid[c]).astype(np.uint8)
        rgba[..., c][m2] = ((1.0 - t2_interp) * c_mid[c] + t2_interp * c_canopy[c]).astype(np.uint8)
        rgba[..., c][m3] = int(c_canopy[c])

    # Moderate vegetation (-17.5 <= dB <= -12.0): alpha = 20.0
    alpha = np.full((h, w), 20.0, dtype=np.float64)

    # Dense high-biomass canopy (> -12.0 dB): alpha = 195.0
    canopy_mask = data_db > -12.0
    alpha[canopy_mask] = 195.0

    # Deforested clear-cuts, logging scars, burn scars on land (< -17.5 dB outside rivers/water): alpha = 230.0
    loss_mask = data_db < -17.5
    if water_mask is not None:
        loss_mask = loss_mask & (~water_mask)
    alpha[loss_mask] = 230.0

    # Water in HV: alpha = 15.0
    if water_mask is not None:
        for c in range(3):
            rgba[..., c][water_mask] = int(c_water[c])
        alpha[water_mask] = 15.0

    rgba[..., 3] = np.clip(alpha, 0, 235).astype(np.uint8)
    return rgba


def colormap_backscatter(data_db, vmin=-24.0, vmax=0.0):
    """Backwards-compatible alias for HH backscatter."""
    return colormap_hh(data_db, vmin=vmin, vmax=vmax)


def colormap_phase(data_rad, coherence=None, deformation_mask=None):
    """
    Interferogram rainbow colormap for InSAR phase [-π, π].
    When coherence is provided, low-coherence regions (< 0.38) have natural
    decorrelation speckle noise blended in so fringes look authentic.
    When deformation_mask is provided, active deformation zones render with alpha = 220,
    while stable flat plains fade to alpha = 15.
    """
    wrapped = np.arctan2(np.sin(data_rad), np.cos(data_rad))
    norm = np.clip((wrapped + np.pi) / (2.0 * np.pi), 0.0, 1.0)
    h = norm * 6.0
    i = np.floor(h).astype(int) % 6
    f = h - np.floor(h)

    out = np.zeros(data_rad.shape + (4,), dtype=np.uint8)
    v = np.full(data_rad.shape, 255, dtype=np.uint8)
    p = np.zeros(data_rad.shape, dtype=np.uint8)
    q = (255 * (1.0 - f)).astype(np.uint8)
    t = (255 * f).astype(np.uint8)

    for idx, (r, g, b) in enumerate([
        (v, t, p), (q, v, p), (p, v, t),
        (p, q, v), (t, p, v), (v, p, q),
    ]):
        mask = i == idx
        out[mask, 0] = r[mask]
        out[mask, 1] = g[mask]
        out[mask, 2] = b[mask]

    # Blend natural decorrelation speckle in low-coherence areas
    if coherence is not None:
        low_coh = coherence < 0.38
        if np.any(low_coh):
            speckle = np.random.RandomState(42).randint(30, 220, size=(low_coh.sum(), 3), dtype=np.uint8)
            t_blend = np.clip((0.38 - coherence[low_coh]) / 0.28, 0.0, 1.0)[:, None]
            out[low_coh, :3] = (
                (1.0 - t_blend) * out[low_coh, :3] + t_blend * speckle
            ).astype(np.uint8)

    # SELECTIVE ANOMALY ALPHA MASKING
    if deformation_mask is not None:
        def_norm = np.clip(deformation_mask.astype(np.float64), 0.0, 1.0)
        alpha = 15.0 + def_norm * (220.0 - 15.0)
    else:
        # Default fallback if mask is omitted: fade stable plains to 15, highlight fringes
        grad_y, grad_x = np.gradient(data_rad)
        grad = np.sqrt(grad_y**2 + grad_x**2)
        act = np.clip((grad - 0.05) / 0.35, 0.0, 1.0)
        alpha = 15.0 + act * (220.0 - 15.0)

    out[..., 3] = np.clip(alpha, 15, 220).astype(np.uint8)
    return out


def colormap_coherence(data_coh):
    """
    Calibrated Coherence Colormap:
    - High coherence built-up urban footprints (> 0.72): crisp white/cyan (#CFFAFE to #FFFFFF), alpha = 225.0
    - Low-coherence decorrelated zones (< 0.30): deep violet #4C1D95 ([76, 29, 149]), alpha = 160.0
    - Mid-range (0.30 <= gamma <= 0.72): alpha = 25.0
    - Alpha clipped to [0, 230]
    """
    norm = np.clip(data_coh, 0.0, 1.0)
    h, w = norm.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    c_violet = np.array([76, 29, 149], dtype=np.float64)   # Deep Violet #4C1D95 (< 0.30)
    c_gray = np.array([75, 85, 99], dtype=np.float64)       # Mid Gray #4B5563 (0.30 to 0.72)
    c_cyan = np.array([207, 250, 254], dtype=np.float64)   # Crisp Cyan #CFFAFE (0.72)
    c_white = np.array([255, 255, 255], dtype=np.float64)  # Pure White #FFFFFF (1.00)

    m_low = norm < 0.30
    m_mid = (norm >= 0.30) & (norm <= 0.72)
    m_high = norm > 0.72

    t_low = norm[m_low] / 0.30
    t_mid = (norm[m_mid] - 0.30) / (0.72 - 0.30)
    t_high = (norm[m_high] - 0.72) / (1.0 - 0.72)

    for c in range(3):
        rgba[..., c][m_low] = ((1.0 - t_low) * c_violet[c] + t_low * c_gray[c]).astype(np.uint8)
        rgba[..., c][m_mid] = ((1.0 - t_mid) * c_gray[c] + t_mid * c_cyan[c]).astype(np.uint8)
        rgba[..., c][m_high] = ((1.0 - t_high) * c_cyan[c] + t_high * c_white[c]).astype(np.uint8)

    # Selective alpha masking
    alpha = np.full((h, w), 25.0, dtype=np.float64) # Mid-range: 0.30 <= gamma <= 0.72 -> alpha = 25.0
    alpha[m_low] = 160.0                            # Low-coherence: < 0.30 -> alpha = 160.0
    alpha[m_high] = 225.0                           # High-coherence: > 0.72 -> alpha = 225.0

    rgba[..., 3] = np.clip(alpha, 0, 230).astype(np.uint8)
    return rgba


def colormap_diverging(data, vmin=-2.0, vmax=2.0):
    """
    Blue -> White -> Red diverging colormap for GOFF displacement.
    Active flow: alpha = 220; stable near-zero: alpha = 15.
    """
    mid = 0.0
    rng = max(abs(vmax - mid), abs(vmin - mid), 1e-10)
    norm = np.clip((data - mid) / rng, -1.0, 1.0)

    blue = np.array([37, 99, 235], dtype=np.float64)
    white = np.array([248, 250, 252], dtype=np.float64)
    red = np.array([239, 68, 68], dtype=np.float64)

    neg = norm < 0
    t_neg = (norm[neg] + 1.0)
    t_pos = norm[~neg]

    rgba = np.zeros(data.shape + (4,), dtype=np.uint8)
    for c in range(3):
        rgba[..., c][neg] = ((1.0 - t_neg) * blue[c] + t_neg * white[c]).astype(np.uint8)
        rgba[..., c][~neg] = ((1.0 - t_pos) * white[c] + t_pos * red[c]).astype(np.uint8)

    flow_mag = np.abs(data)
    alpha = np.full(data.shape, 15.0, dtype=np.float64)
    active = flow_mag > 0.08
    alpha[active] = 220.0
    rgba[..., 3] = np.clip(alpha, 15, 220).astype(np.uint8)
    return rgba


def generate_optical_cloudy(shape=(1024, 1024), seed=42, area_type='general', **kwargs):
    """Simulate cloudy optical RGB image with realistic white cloud banks."""
    h, w = shape
    rng = np.random.RandomState(seed)

    # Base terrain
    elev = multi_octave_noise(shape, octaves=4, base_scale=120, seed=seed)
    base_r = (20 + elev * 45).astype(np.float64)
    base_g = (45 + elev * 65).astype(np.float64)
    base_b = (15 + elev * 30).astype(np.float64)

    # Cloud patches
    cloud_noise = multi_octave_noise(shape, octaves=4, base_scale=160, seed=seed + 1)
    cloud = np.clip((cloud_noise - 0.40) / 0.45, 0.0, 1.0)
    cloud = gaussian_blur(cloud, radius=6)

    r = np.clip(base_r * (1.0 - cloud) + cloud * 240, 0, 255).astype(np.uint8)
    g = np.clip(base_g * (1.0 - cloud) + cloud * 245, 0, 255).astype(np.uint8)
    b = np.clip(base_b * (1.0 - cloud) + cloud * 255, 0, 255).astype(np.uint8)
    a = np.full(shape, 255, dtype=np.uint8)

    return np.stack([r, g, b, a], axis=-1)


# ---------------------------------------------------------------------------
# Writers (GeoTIFF, WebP with Swath Alpha, Telemetry JSON, Time-series)
# ---------------------------------------------------------------------------

def write_geotiff(path, data, bbox, nodata=-9999.0):
    """Write Float32 GeoTIFF with EPSG:4326 and bounding box."""
    path = str(path)
    h, w = data.shape
    transform = from_bounds(bbox[0], bbox[1], bbox[2], bbox[3], w, h)
    with rasterio.open(
        path, 'w', driver='GTiff', height=h, width=w,
        count=1, dtype='float32', crs=CRS.from_epsg(4326),
        transform=transform, nodata=nodata,
    ) as dst:
        dst.write(data.astype(np.float32), 1)


def write_webp(path, rgba_array, apply_swath=True):
    """Save RGBA uint8 array as WebP with feathered orbital swath vignette."""
    if apply_swath:
        rgba_array = apply_orbital_swath_mask(rgba_array, angle_deg=11.0, margin_x=0.05, margin_y=0.03, feather=40)
    img = Image.fromarray(rgba_array, mode='RGBA')
    img.save(str(path), 'WEBP', quality=95)


def write_telemetry_json(path, data, unit, bbox):
    """Downsample to 256x256 and write precision telemetry JSON."""
    h, w = data.shape
    bh, bw = h // 256, w // 256
    ds = data[:256 * bh, :256 * bw].reshape(256, bh, 256, bw).mean(axis=(1, 3))
    obj = {
        "width": 1024,
        "height": 1024,
        "unit": unit,
        "min": round(float(np.nanmin(data)), 2),
        "max": round(float(np.nanmax(data)), 2),
        "nodata": None,
        "bbox": [round(float(x), 6) for x in bbox],
        "data": [[round(float(v), 2) for v in row] for row in ds],
    }
    with open(str(path), 'w') as f:
        json.dump(obj, f)


def write_timeseries_json(path, seed=42, extra_series=None):
    """Generate 12-month synthetic time series JSON or write pre-computed dict."""
    if isinstance(seed, dict):
        with open(str(path), 'w') as f:
            json.dump(seed, f, indent=2)
        return

    rng = np.random.RandomState(seed)
    dates = [f"2025-{m:02d}-15" for m in range(1, 13)]

    months = np.arange(12)
    hh_base = -12 + 3 * np.sin(2 * np.pi * months / 12)
    hv_base = -18 + 2 * np.sin(2 * np.pi * months / 12 + 0.5)
    coh_base = 0.6 + 0.15 * np.cos(2 * np.pi * months / 12)

    hh = hh_base + rng.standard_normal(12) * 0.5
    hv = hv_base + rng.standard_normal(12) * 0.4
    coh = np.clip(coh_base + rng.standard_normal(12) * 0.05, 0, 1)

    series = {
        "hh_mean": [round(float(v), 2) for v in hh],
        "hv_mean": [round(float(v), 2) for v in hv],
        "coherence_mean": [round(float(v), 2) for v in coh],
    }
    units = {
        "hh_mean": "dB",
        "hv_mean": "dB",
        "coherence_mean": "coherence",
    }
    if extra_series:
        for key, vals in extra_series.items():
            series[key] = [round(float(v), 2) for v in vals]
            units[key] = "dB"

    obj = {"dates": dates, "series": series, "units": units}
    with open(str(path), 'w') as f:
        json.dump(obj, f)


def bbox_for_area(lat, lng, half_deg=0.5):
    """Return [lon_min, lat_min, lon_max, lat_max] centered on (lat, lng)."""
    return [lng - half_deg, lat - half_deg, lng + half_deg, lat + half_deg]
