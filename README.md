# EarthWaltz: Global SAR Observatory

An interactive application that uses radar remote sensing data from the NASA-ISRO Synthetic Aperture Radar (NISAR) mission to track and visualize one or more types of surface change at locations around the world.

Developed for the **NASA International Space Apps Challenge** under the challenge *"Dancing with the SARs"*.

---

## 🛰️ Overview

Optical satellites capture Earth only when skies are clear. Over monsoon-drenched deltas, smoke-filled peat forests, and blizzard-swept glacial valleys, optical imagery is frequently blocked by persistent clouds and atmospheric haze.

**EarthWaltz** unveils what the clouds hide. Leveraging multi-frequency active microwave Synthetic Aperture Radar (SAR) — featuring the NASA-ISRO NISAR dual L/S-band sensor together with partner constellations (ALOS-2 PALSAR-2, SAOCOM-1A, and Sentinel-1) — EarthWaltz enables citizens, educators, researchers, and resource managers to explore planetary surface dynamics through an interactive dual-map cartographic atlas.

---

## ✨ Key Capabilities & Architecture

### 1. Dual-Map Split Curtain Engine
- **Hardware-Accelerated Dual Stack:** Two synchronized MapLibre GL JS WebGL instances (`radarMap` and `opticalMap`) running in parallel with zero-latency camera locks (`jumpTo` synchronization on `move` events).
- **120 FPS Real-Time Spatial Curtain:** The top optical satellite map is dynamically clipped using CSS `clipPath: inset(0 calc(100% - pos) 0 0)` without canvas re-rendering lag.
- **Atmospheric Clouds vs. Penetrating Radar:** The optical map displays true-color optical satellite imagery combined with live NASA GIBS cloud tiles (`VIIRS_SNPP_CorrectedReflectance_TrueColor`), illustrating real cloud obscuration. The radar map reveals calibrated radar backscatter, interferometric phase fringes, and coherence layers underneath.

### 2. Physical SAR Calibration & Selective Anomaly Pipeline
- **Authentic Physical Anomaly Masking:** Background dry land maintains low opacity ($\alpha \le 25$), allowing high-resolution topographic satellite imagery to show through naturally. Active radar signals glow with high opacity ($\alpha = 195\text{--}245$):
  - **HH Channel (Flood & Water):** Specular open water ($\sigma^0 < -17.5\text{ dB}$, cobalt cyan) and double-bounce flooded vegetation ($\sigma^0 > -6.8\text{ dB}$, signal gold).
  - **HV Channel (Biomass & Depolarization):** Volume scattering across dense forest canopy ($\sigma^0 > -12.0\text{ dB}$, emerald) and deforestation/burn scars ($\sigma^0 < -17.5\text{ dB}$, vermilion coral).
  - **InSAR Phase ($\Delta\phi$):** Interferometric rainbow fringes mapped along active tectonic fault lines, subsidence troughs, and steep slopes.
  - **Coherence ($\gamma$):** High phase stability across urban structures ($\gamma > 0.72$, crisp white/cyan) versus temporal decorrelation across turbulent water and dense vegetation ($\gamma < 0.30$, deep violet).
- **Zero Synthetic Math Shapes:** All rasters are generated using real AWS Terrarium 30m Global DEM tiles and optical satellite reflectance indices with Gaussian filtering ($\sigma = 1.2$) and strict coastline ocean masking.

### 3. Swiss Cartographic Layout & Typography
- **Typography:** Google Fonts `Bricolage Grotesque` (display titles, regional headers) paired with `Atkinson Hyperlegible` (body narrative, telemetry labels, tabular numerals).
- **5-Token Cartographic Palette:** Alabaster Vellum (`#F6F5F0`), Limestone Well (`#EAE8E0`), Survey Rule (`#D0CEC4`), Carbon Ink (`#121417`), and International Cobalt (`#0047AB`).
- **Cartographic Colophon:** Clear provenance footer providing immediate access to source code and scientific attribution.

### 4. Interactive Telemetry & Sonification
- **36px Status Strip:** Real-time cursor coordinates (`tabular-nums`), calibrated radar values (`dB`, `rad`, or coherence), plain-English scattering mechanisms, and a 12-step timeline scrubber.
- **Surface Sonification:** Synthesizes radar backscatter time-series directly into audible frequencies (60 Hz – 1.2 kHz) via the Web Audio API, turning Earth's surface rhythms into sound.

---

## 🌍 Study Areas

1. **Kerala, India (Hometown Anchor):** Monsoon flood inundation, below-sea-level Kuttanad paddy polders, and Western Ghats landslide deformation.
2. **Amazon Basin, Brazil:** Hidden flood pulses beneath dense tropical forest canopy and deforestation frontiers along the Rio Negro and Solimões.
3. **Himalayas (Khumbu Glacier & Everest Massif):** Glacial downhill velocity tracking and glacial lake outburst flood (GLOF) hazard monitoring.
4. **Turkey / Anatolia:** Coseismic surface rupture and fault slip along the East Anatolian Fault from the catastrophic February 2023 earthquakes.
5. **Punjab, India:** Agricultural soil moisture surges and intensive wheat-rice crop growth cycles through seasonal dust.
6. **Sumatra, Indonesia:** Subterranean tropical peatland moisture depletion and fire early-warning indicators beneath thick smoke haze.

---

## 🛠️ Technology Stack

- **Frontend Framework:** Next.js 15 (App Router, React 19, TypeScript)
- **Mapping & WebGL:** MapLibre GL JS, Deck.gl
- **Styling:** Tailwind CSS, PostCSS
- **Data Pipeline:** Python 3, Rasterio, NumPy, SciPy, Pillow, Requests
- **Data Sources:** NASA ASF Vertex DAAC, NASA Earthdata CMR STAC, NASA EOSDIS GIBS WMTS, AWS Terrarium 30m Global DEM, Esri World Imagery

---

## 🤖 Use of Super Intelligence (SI) Acknowledgment

In compliance with NASA International Space Apps Challenge guidelines regarding the use of Super Intelligence (SI) and generative AI tools:

> **Statement of Attribution:**
> Code architecture scaffolding, TypeScript UI component layout, and Python raster pipeline script templates were developed with the assistance of Super Intelligence (SI) coding tools (Claude / Gemini AI assistants) under human scientific direction and engineering oversight.
> 
> - **Human-Directed Domains:** All radar scattering physics principles, multi-frequency wavelength calibrations ($24\text{ cm L-band}$, $9.3\text{ cm S-band}$, $5.6\text{ cm C-band}$), study area selection, scientific narratives, and cartographic design specifications were conceived, directed, and verified by human team members.
> - **Branding Integrity:** No NASA, ISRO, or partner agency logos, insignia, or protected branding elements were generated or altered by AI tools. All references follow official public scientific documentation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Python 3.10+ (for running the data pipeline)

### Installation

```bash
# Clone the repository
git clone https://github.com/Nekhal-james/EarthWaltz.git
cd EarthWaltz

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the observatory.

### Running the Python Data Pipeline

```bash
# Regenerate calibrated demo seed rasters & telemetry matrices
python data-pipeline/pipeline.py --generate-demo-seed
```

---

## 📄 License & Attribution

- **Source Code:** [https://github.com/Nekhal-james/EarthWaltz](https://github.com/Nekhal-james/EarthWaltz)
- **License:** MIT License — see [LICENSE](LICENSE) for details.
- **Imagery & Data Attribution:** NASA EOSDIS, Alaska Satellite Facility (ASF) DAAC, ISRO, USGS, Esri, Maxar, and MapLibre contributors.
