"""
Per-study-area demo-seed generators:
  - Kerala: Real Vembanad Lake, Kuttanad polders, and Western Ghats relief
  - Amazon: Sinuous Amazon/Rio Negro confluence & varzea canopy
  - Himalayas: Valley glaciers with GOFF flow vectors
  - Turkey: Strike-slip fault rupture with nested rainbow fringes
  - Punjab: Dual-frequency L-band & S-band organic crop mosaic
  - Indonesia: Organic peatland burn scars & RADARSAT C-band
"""
import os
from pathlib import Path
import numpy as np

from .utils import (
    generate_backscatter, generate_insar_phase, generate_coherence,
    generate_goff, generate_optical_cloudy, generate_kerala_geographic_masks,
    colormap_backscatter, colormap_phase, colormap_coherence, colormap_diverging,
    write_geotiff, write_webp, write_telemetry_json, write_timeseries_json,
    multi_octave_noise,
)

SHAPE = (1024, 1024)


def _ensure(d):
    os.makedirs(d, exist_ok=True)
    return Path(d)


# ----- Kerala (Study Area #1 - Hometown Anchor) -----------------------------

def generate_kerala(out_dir):
    print("  Generating Kerala (Vembanad Lake, Kuttanad Polders & Western Ghats)...")
    out = _ensure(out_dir / "kerala")
    # Geographic bounding box: Lon 76.25°E to 77.15°E, Lat 9.25°N to 10.05°N
    bbox = [76.25, 9.25, 77.15, 10.05]
    masks = generate_kerala_geographic_masks(SHAPE)

    rng = np.random.RandomState(100)

    # 1. HH Backscatter
    base_hh = multi_octave_noise(SHAPE, octaves=5, base_scale=130, seed=100) * 12.0 - 16.0
    # Add Western Ghats high-relief slopes
    base_hh += masks['ghats_terrain'] * 9.0
    # Kuttanad below-sea-level paddy clusters: intense double-bounce (-4 to -1 dB)
    base_hh[masks['kuttanad_polders']] = rng.uniform(-4.0, -1.0, masks['kuttanad_polders'].sum())
    # Vembanad Lake: dark specular open water (-25 to -21 dB)
    base_hh[masks['lake_mask']] = rng.uniform(-25.0, -21.0, masks['lake_mask'].sum())
    # Arabian Sea: deep specular ocean (-26 to -23 dB)
    base_hh[masks['ocean_mask']] = rng.uniform(-26.0, -23.0, masks['ocean_mask'].sum())

    hh = np.clip(base_hh + rng.standard_normal(SHAPE) * 1.0, -26.0, 5.0).astype(np.float32)

    rgba_hh = colormap_backscatter(hh)
    # Mask Arabian Sea to low alpha so coastal geometry is crystal-clear
    rgba_hh[masks['ocean_mask'], 3] = 40

    write_geotiff(out / "hh_backscatter.tif", hh, bbox)
    write_webp(out / "hh_backscatter.webp", rgba_hh)
    write_telemetry_json(out / "telemetry_hh.json", hh, "dB", bbox)

    # 2. HV Backscatter (Depolarization from canopy volume scattering)
    base_hv = multi_octave_noise(SHAPE, octaves=5, base_scale=130, seed=101) * 10.0 - 21.0
    # Dense Ghats forest canopy: -13 to -8 dB
    base_hv += masks['ghats_terrain'] * 7.0
    # Kuttanad polders: moderate vegetation canopy returns (-15 to -10 dB)
    base_hv[masks['kuttanad_polders']] = rng.uniform(-14.0, -9.0, masks['kuttanad_polders'].sum())
    # Water has near-zero depolarization (-30 to -26 dB)
    base_hv[masks['lake_mask']] = rng.uniform(-30.0, -25.0, masks['lake_mask'].sum())
    base_hv[masks['ocean_mask']] = rng.uniform(-30.0, -26.0, masks['ocean_mask'].sum())

    hv = np.clip(base_hv + rng.standard_normal(SHAPE) * 1.0, -30.0, 2.0).astype(np.float32)

    rgba_hv = colormap_backscatter(hv, vmin=-30, vmax=0)
    rgba_hv[masks['ocean_mask'], 3] = 40

    write_geotiff(out / "hv_backscatter.tif", hv, bbox)
    write_webp(out / "hv_backscatter.webp", rgba_hv)
    write_telemetry_json(out / "telemetry_hv.json", hv, "dB", bbox)

    # 3. InSAR Phase (Subtle monsoon subsidence in polders + slow slope creep in Ghats)
    phase = generate_insar_phase(SHAPE, seed=102, mode='subsidence')
    # Phase decorrelation on open water
    phase[masks['ocean_mask']] = rng.uniform(-np.pi, np.pi, masks['ocean_mask'].sum())
    phase[masks['lake_mask']] = rng.uniform(-np.pi, np.pi, masks['lake_mask'].sum())

    rgba_phase = colormap_phase(phase)
    rgba_phase[masks['ocean_mask'], 3] = 30

    write_geotiff(out / "insar_phase.tif", phase, bbox)
    write_webp(out / "insar_phase.webp", rgba_phase)
    write_telemetry_json(out / "telemetry_insar.json", phase, "rad", bbox)

    # 4. Coherence
    coh = generate_coherence(SHAPE, seed=103, area_type='kerala')
    rgba_coh = colormap_coherence(coh)
    rgba_coh[masks['ocean_mask'], 3] = 40

    write_geotiff(out / "coherence.tif", coh, bbox)
    write_webp(out / "coherence.webp", rgba_coh)
    write_telemetry_json(out / "telemetry_coherence.json", coh, "coherence", bbox)

    # 5. Optical cloudy comparison image
    opt = generate_optical_cloudy(SHAPE, seed=104)
    write_webp(out / "optical_cloudy.webp", opt)

    write_timeseries_json(out / "timeseries.json", seed=105)
    print("  ✓ Kerala done")


# ----- Amazon Basin ---------------------------------------------------------

def generate_amazon(out_dir):
    print("  Generating Amazon (Rio Negro / Amazon Confluence & Varzea Canopy)...")
    out = _ensure(out_dir / "amazon")
    bbox = [-61.0, -4.0, -59.0, -2.0]

    hh = generate_backscatter(SHAPE, pol='HH', seed=200, area_type='amazon')
    write_geotiff(out / "hh_backscatter.tif", hh, bbox)
    write_webp(out / "hh_backscatter.webp", colormap_backscatter(hh))
    write_telemetry_json(out / "telemetry_hh.json", hh, "dB", bbox)

    # Signature layer: HV Backscatter (Biomass volume scattering)
    hv = generate_backscatter(SHAPE, pol='HV', seed=201, area_type='amazon')
    write_geotiff(out / "hv_backscatter.tif", hv, bbox)
    write_webp(out / "hv_backscatter.webp", colormap_backscatter(hv))
    write_telemetry_json(out / "telemetry_hv.json", hv, "dB", bbox)

    phase = generate_insar_phase(SHAPE, seed=202, mode='subsidence')
    write_geotiff(out / "insar_phase.tif", phase, bbox)
    write_webp(out / "insar_phase.webp", colormap_phase(phase))
    write_telemetry_json(out / "telemetry_insar.json", phase, "rad", bbox)

    coh = generate_coherence(SHAPE, seed=203, area_type='amazon')
    write_geotiff(out / "coherence.tif", coh, bbox)
    write_webp(out / "coherence.webp", colormap_coherence(coh))
    write_telemetry_json(out / "telemetry_coherence.json", coh, "coherence", bbox)

    # CONAE SAOCOM L-band layers
    saocom_hh = generate_backscatter(SHAPE, pol='HH', seed=204, area_type='amazon')
    write_geotiff(out / "saocom_hh.tif", saocom_hh, bbox)
    write_webp(out / "saocom_hh.webp", colormap_backscatter(saocom_hh))
    write_telemetry_json(out / "telemetry_saocom_hh.json", saocom_hh, "dB", bbox)

    saocom_hv = generate_backscatter(SHAPE, pol='HV', seed=205, area_type='amazon')
    write_geotiff(out / "saocom_hv.tif", saocom_hv, bbox)
    write_webp(out / "saocom_hv.webp", colormap_backscatter(saocom_hv))
    write_telemetry_json(out / "telemetry_saocom_hv.json", saocom_hv, "dB", bbox)

    opt = generate_optical_cloudy(SHAPE, seed=206)
    write_webp(out / "optical_cloudy.webp", opt)

    write_timeseries_json(out / "timeseries.json", seed=207,
                          extra_series={"saocom_hh_mean": [-11.5] * 12, "saocom_hv_mean": [-17.2] * 12})
    print("  ✓ Amazon done")


# ----- Himalayas ------------------------------------------------------------

def generate_himalayas(out_dir):
    print("  Generating Himalayas (Valley Glaciers & GOFF Displacement Vectors)...")
    out = _ensure(out_dir / "himalayas")
    bbox = [85.7, 27.0, 87.7, 29.0]

    hh = generate_backscatter(SHAPE, pol='HH', seed=300, area_type='himalayas')
    write_geotiff(out / "hh_backscatter.tif", hh, bbox)
    write_webp(out / "hh_backscatter.webp", colormap_backscatter(hh))
    write_telemetry_json(out / "telemetry_hh.json", hh, "dB", bbox)

    hv = generate_backscatter(SHAPE, pol='HV', seed=301, area_type='himalayas')
    write_geotiff(out / "hv_backscatter.tif", hv, bbox)
    write_webp(out / "hv_backscatter.webp", colormap_backscatter(hv))
    write_telemetry_json(out / "telemetry_hv.json", hv, "dB", bbox)

    phase = generate_insar_phase(SHAPE, seed=302, mode='earthquake')
    write_geotiff(out / "insar_phase.tif", phase, bbox)
    write_webp(out / "insar_phase.webp", colormap_phase(phase))
    write_telemetry_json(out / "telemetry_insar.json", phase, "rad", bbox)

    coh = generate_coherence(SHAPE, seed=303, area_type='himalayas')
    write_geotiff(out / "coherence.tif", coh, bbox)
    write_webp(out / "coherence.webp", colormap_coherence(coh))
    write_telemetry_json(out / "telemetry_coherence.json", coh, "coherence", bbox)

    # Signature layer: GOFF Range & Azimuth displacement
    goff_range = generate_goff(SHAPE, direction='range', seed=304)
    write_geotiff(out / "goff_range.tif", goff_range, bbox)
    write_webp(out / "goff_range.webp", colormap_diverging(goff_range, vmin=-2.0, vmax=2.0))
    write_telemetry_json(out / "telemetry_goff_range.json", goff_range, "m", bbox)

    goff_azimuth = generate_goff(SHAPE, direction='azimuth', seed=305)
    write_geotiff(out / "goff_azimuth.tif", goff_azimuth, bbox)
    write_webp(out / "goff_azimuth.webp", colormap_diverging(goff_azimuth, vmin=-2.0, vmax=2.0))
    write_telemetry_json(out / "telemetry_goff_azimuth.json", goff_azimuth, "m", bbox)

    opt = generate_optical_cloudy(SHAPE, seed=306)
    write_webp(out / "optical_cloudy.webp", opt)

    write_timeseries_json(out / "timeseries.json", seed=307,
                          extra_series={"goff_velocity_mean": [0.85] * 12})
    print("  ✓ Himalayas done")


# ----- Turkey / Nepal (Earthquake Fault Rupture) ----------------------------

def generate_turkey(out_dir):
    print("  Generating Turkey (Fault Rupture & Rainbow InSAR Fringes)...")
    out = _ensure(out_dir / "turkey")
    bbox = [36.0, 36.5, 38.0, 38.5]

    hh = generate_backscatter(SHAPE, pol='HH', seed=400, area_type='turkey')
    write_geotiff(out / "hh_backscatter.tif", hh, bbox)
    write_webp(out / "hh_backscatter.webp", colormap_backscatter(hh))
    write_telemetry_json(out / "telemetry_hh.json", hh, "dB", bbox)

    hv = generate_backscatter(SHAPE, pol='HV', seed=401, area_type='turkey')
    write_geotiff(out / "hv_backscatter.tif", hv, bbox)
    write_webp(out / "hv_backscatter.webp", colormap_backscatter(hv))
    write_telemetry_json(out / "telemetry_hv.json", hv, "dB", bbox)

    # Signature layer: InSAR Phase (Strike-slip shear discontinuity + rainbow fringes)
    phase = generate_insar_phase(SHAPE, seed=402, mode='earthquake')
    write_geotiff(out / "insar_phase.tif", phase, bbox)
    write_webp(out / "insar_phase.webp", colormap_phase(phase))
    write_telemetry_json(out / "telemetry_insar.json", phase, "rad", bbox)

    coh = generate_coherence(SHAPE, seed=403, area_type='turkey')
    write_geotiff(out / "coherence.tif", coh, bbox)
    write_webp(out / "coherence.webp", colormap_coherence(coh))
    write_telemetry_json(out / "telemetry_coherence.json", coh, "coherence", bbox)

    opt = generate_optical_cloudy(SHAPE, seed=404)
    write_webp(out / "optical_cloudy.webp", opt)

    write_timeseries_json(out / "timeseries.json", seed=405)
    print("  ✓ Turkey done")


# ----- Punjab (Dual-Frequency Agriculture) ----------------------------------

def generate_punjab(out_dir):
    print("  Generating Punjab (Dual L+S Band Crop Moisture Mosaic)...")
    out = _ensure(out_dir / "punjab")
    bbox = [74.5, 29.8, 76.5, 31.8]

    hh = generate_backscatter(SHAPE, pol='HH', seed=500, area_type='punjab')
    write_geotiff(out / "hh_backscatter.tif", hh, bbox)
    write_webp(out / "hh_backscatter.webp", colormap_backscatter(hh))
    write_telemetry_json(out / "telemetry_hh.json", hh, "dB", bbox)

    hv = generate_backscatter(SHAPE, pol='HV', seed=501, area_type='punjab')
    write_geotiff(out / "hv_backscatter.tif", hv, bbox)
    write_webp(out / "hv_backscatter.webp", colormap_backscatter(hv))
    write_telemetry_json(out / "telemetry_hv.json", hv, "dB", bbox)

    phase = generate_insar_phase(SHAPE, seed=502, mode='subsidence')
    write_geotiff(out / "insar_phase.tif", phase, bbox)
    write_webp(out / "insar_phase.webp", colormap_phase(phase))
    write_telemetry_json(out / "telemetry_insar.json", phase, "rad", bbox)

    coh = generate_coherence(SHAPE, seed=503, area_type='punjab')
    write_geotiff(out / "coherence.tif", coh, bbox)
    write_webp(out / "coherence.webp", colormap_coherence(coh))
    write_telemetry_json(out / "telemetry_coherence.json", coh, "coherence", bbox)

    # Signature layer: ISRO S-band (9.3 cm wavelength — canopy structure sensitive)
    sband_hh = generate_backscatter(SHAPE, pol='HH', seed=504, area_type='punjab')
    write_geotiff(out / "sband_hh.tif", sband_hh, bbox)
    write_webp(out / "sband_hh.webp", colormap_backscatter(sband_hh))
    write_telemetry_json(out / "telemetry_sband_hh.json", sband_hh, "dB", bbox)

    sband_hv = generate_backscatter(SHAPE, pol='HV', seed=505, area_type='punjab')
    write_geotiff(out / "sband_hv.tif", sband_hv, bbox)
    write_webp(out / "sband_hv.webp", colormap_backscatter(sband_hv))
    write_telemetry_json(out / "telemetry_sband_hv.json", sband_hv, "dB", bbox)

    opt = generate_optical_cloudy(SHAPE, seed=506)
    write_webp(out / "optical_cloudy.webp", opt)

    write_timeseries_json(out / "timeseries.json", seed=507,
                          extra_series={"sband_hh_mean": [-10.8] * 12, "sband_hv_mean": [-16.5] * 12})
    print("  ✓ Punjab done")


# ----- Indonesia (Peatland Fires & Smoke Penetration) -----------------------

def generate_indonesia(out_dir):
    print("  Generating Indonesia (Peatland Burn Scars & RADARSAT C-Band)...")
    out = _ensure(out_dir / "indonesia")
    bbox = [101.0, -0.5, 103.0, 1.5]

    hh = generate_backscatter(SHAPE, pol='HH', seed=600, area_type='indonesia')
    write_geotiff(out / "hh_backscatter.tif", hh, bbox)
    write_webp(out / "hh_backscatter.webp", colormap_backscatter(hh))
    write_telemetry_json(out / "telemetry_hh.json", hh, "dB", bbox)

    hv = generate_backscatter(SHAPE, pol='HV', seed=601, area_type='indonesia')
    write_geotiff(out / "hv_backscatter.tif", hv, bbox)
    write_webp(out / "hv_backscatter.webp", colormap_backscatter(hv))
    write_telemetry_json(out / "telemetry_hv.json", hv, "dB", bbox)

    phase = generate_insar_phase(SHAPE, seed=602, mode='subsidence')
    write_geotiff(out / "insar_phase.tif", phase, bbox)
    write_webp(out / "insar_phase.webp", colormap_phase(phase))
    write_telemetry_json(out / "telemetry_insar.json", phase, "rad", bbox)

    coh = generate_coherence(SHAPE, seed=603, area_type='indonesia')
    write_geotiff(out / "coherence.tif", coh, bbox)
    write_webp(out / "coherence.webp", colormap_coherence(coh))
    write_telemetry_json(out / "telemetry_coherence.json", coh, "coherence", bbox)

    # Signature layer: RADARSAT C-band (5.6 cm — surface burn scar sensitivity)
    cband_hv = generate_backscatter(SHAPE, pol='HV', seed=604, area_type='indonesia')
    write_geotiff(out / "cband_hv.tif", cband_hv, bbox)
    write_webp(out / "cband_hv.webp", colormap_backscatter(cband_hv))
    write_telemetry_json(out / "telemetry_cband_hv.json", cband_hv, "dB", bbox)

    cband_vv = generate_backscatter(SHAPE, pol='VV', seed=605, area_type='indonesia')
    write_geotiff(out / "cband_vv.tif", cband_vv, bbox)
    write_webp(out / "cband_vv.webp", colormap_backscatter(cband_vv))
    write_telemetry_json(out / "telemetry_cband_vv.json", cband_vv, "dB", bbox)

    opt = generate_optical_cloudy(SHAPE, seed=606)
    write_webp(out / "optical_cloudy.webp", opt)

    write_timeseries_json(out / "timeseries.json", seed=607,
                          extra_series={"cband_hv_mean": [-18.9] * 12, "cband_vv_mean": [-14.2] * 12})
    print("  ✓ Indonesia done")
