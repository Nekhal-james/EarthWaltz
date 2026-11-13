# EarthWaltz Data Contract

This file defines the shared data format between the Python pipeline and the Next.js frontend.

## Study Areas

| id | name | subtitle | lat | lng | zoom | phenomenon | sensors | polarizations | frequencies | hometown |
|----|------|----------|-----|-----|------|------------|---------|---------------|-------------|----------|
| kerala | Kerala, India | Kuttanad Wetlands & Western Ghats | 9.5 | 76.5 | 10 | Wetland flooding, paddy cycles, landslide deformation | NISAR L-band GCOV, NISAR L-band GUNW | HH, HV, InSAR Phase | L-band (24cm) | true |
| amazon | Amazon Basin, Brazil | Tropical Deforestation & Flooding | -3.0 | -60.0 | 8 | Deforestation + biosphere flooding | NISAR L-band GCOV, SAOCOM L-band | HH, HV | L-band (24cm) | false |
| himalayas | Himalayas | Glacier Dynamics & Cryosphere | 28.0 | 86.7 | 9 | Glacier velocity / cryosphere movement | NISAR L-band GCOV, NISAR L-band GOFF | HH, HV, Offset Tracking | L-band (24cm) | false |
| turkey | Turkey / Nepal | Earthquake Ground Deformation | 37.5 | 37.0 | 8 | Earthquake InSAR ground deformation | NISAR L-band GUNW | InSAR Phase, Coherence | L-band (24cm) | false |
| punjab | Punjab, India | Dual-Frequency Crop & Soil Moisture | 30.8 | 75.5 | 9 | Agricultural soil moisture + crop cycles | NISAR L-band, ISRO S-band | HH, HV | L-band (24cm), S-band (9.3cm) | false |
| indonesia | Indonesia / Sumatra | Peatland Fires & Smoke Penetration | 0.5 | 102.0 | 8 | Peatland fires | RADARSAT C-band, NISAR L-band | HV, VV | L-band (24cm), C-band (5.6cm) | false |

## Directory Structure

```
public/data/
├── study-areas.json
├── kerala/
│   ├── hh_backscatter.webp          # Pre-colorized 1024x1024 RGBA
│   ├── hv_backscatter.webp
│   ├── insar_phase.webp             # Rainbow interferogram
│   ├── coherence.webp               # Grayscale
│   ├── optical_cloudy.webp          # Simulated cloudy optical
│   ├── hh_backscatter.tif           # Float32 GeoTIFF (dB)
│   ├── hv_backscatter.tif
│   ├── insar_phase.tif              # Float32 (radians)
│   ├── coherence.tif                # Float32 (0-1)
│   ├── telemetry_hh.json
│   ├── telemetry_hv.json
│   ├── telemetry_insar.json
│   ├── telemetry_coherence.json
│   └── timeseries.json
├── amazon/                          # Same structure + saocom_hh.webp etc.
├── himalayas/                       # Same structure + goff layers
├── turkey/                          # Primarily InSAR
├── punjab/                          # + sband_hh.webp, sband_hv.webp
└── indonesia/                       # + cband_hv.webp
```

## File Formats

### Pre-colorized Images (.webp)
- Resolution: 1024x1024 pixels
- Format: WebP, RGBA, lossless or quality 95
- Backscatter (HH/HV/VV): Cyan → Magenta → Yellow palette mapping dB range
- InSAR Phase: Rainbow HSV interferogram (0 to 2π)
- Coherence: Grayscale (black=0, white=1)
- Optical Cloudy: Simulated cloud-covered optical imagery

### Scientific GeoTIFFs (.tif)
- Resolution: 1024x1024
- Data type: Float32
- CRS: EPSG:4326
- Backscatter values: dB (typical range: -25 to +5)
- InSAR phase: radians (-π to π)
- Coherence: 0.0 to 1.0

### Telemetry JSON
```json
{
  "width": 1024,
  "height": 1024,
  "unit": "dB",
  "min": -25.0,
  "max": 5.0,
  "nodata": null,
  "bbox": [lon_min, lat_min, lon_max, lat_max],
  "data": [[row0_col0, row0_col1, ...], ...]
}
```
- Telemetry JSON `data` field contains the raw float values at reduced resolution (256x256 downsampled) for hover telemetry.
- Units: "dB" for backscatter, "rad" for phase, "coherence" for coherence.

### Time Series JSON
```json
{
  "dates": ["2025-01-15", "2025-02-15", ...],
  "series": {
    "hh_mean": [-12.3, -11.8, ...],
    "hv_mean": [-18.5, -17.2, ...],
    "coherence_mean": [0.72, 0.65, ...]
  },
  "units": {
    "hh_mean": "dB",
    "hv_mean": "dB",
    "coherence_mean": "coherence"
  }
}
```

### study-areas.json
```json
{
  "areas": [
    {
      "id": "kerala",
      "name": "Kerala, India",
      "subtitle": "Kuttanad Wetlands & Western Ghats",
      "lat": 9.5,
      "lng": 76.5,
      "zoom": 10,
      "bearing": 0,
      "pitch": 45,
      "phenomenon": "Wetland flooding, paddy cycles, landslide deformation",
      "description": "Kerala's Kuttanad region lies below sea level...",
      "sensors": ["NISAR L-band GCOV", "NISAR L-band GUNW"],
      "polarizations": ["HH", "HV", "InSAR Phase"],
      "frequencies": [{"band": "L-band", "wavelength_cm": 24}],
      "hometown": true,
      "layers": {
        "hh": {"image": "kerala/hh_backscatter.webp", "telemetry": "kerala/telemetry_hh.json", "label": "HH Backscatter", "unit": "dB"},
        "hv": {"image": "kerala/hv_backscatter.webp", "telemetry": "kerala/telemetry_hv.json", "label": "HV Backscatter", "unit": "dB"},
        "insar": {"image": "kerala/insar_phase.webp", "telemetry": "kerala/telemetry_insar.json", "label": "InSAR Phase", "unit": "rad"},
        "coherence": {"image": "kerala/coherence.webp", "telemetry": "kerala/telemetry_coherence.json", "label": "Coherence", "unit": "coherence"}
      },
      "optical_cloudy": "kerala/optical_cloudy.webp",
      "timeseries": "kerala/timeseries.json",
      "narrative": "Welcome to Kuttanad, one of the few places on Earth where farming happens below sea level..."
    }
  ]
}
```

