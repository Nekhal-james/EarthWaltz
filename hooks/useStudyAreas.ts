'use client';

import { useState, useEffect } from 'react';
import type { StudyArea, StudyAreasData } from '@/types';

const FALLBACK_AREAS: StudyArea[] = [
  {
    id: 'kerala',
    name: 'Kerala, India',
    subtitle: 'Kuttanad Wetlands & Western Ghats',
    lat: 9.65,
    lng: 76.65,
    zoom: 10.0,
    bearing: 0,
    pitch: 18,
    bbox: [76.25, 9.25, 77.05, 10.05],
    default_layer: 'hh',
    phenomenon: 'Wetland flooding, paddy cycles, landslide deformation',
    description: "Kerala's Kuttanad region lies below sea level, making it uniquely vulnerable to flooding. SAR reveals the dynamic interplay between paddy cultivation, monsoon floods, and landslide-prone Western Ghats slopes.",
    sensors: ['NISAR L-band GCOV', 'NISAR L-band GUNW'],
    polarizations: ['HH', 'HV', 'InSAR Phase'],
    frequencies: [
      { band: 'L-band', wavelength_cm: 24 },
      { band: 'S-band', wavelength_cm: 9.3 },
      { band: 'C-band', wavelength_cm: 5.6 },
    ],
    hometown: true,
    layers: {
      hh: { image: 'kerala/hh_backscatter.webp', telemetry: 'kerala/telemetry_hh.json', label: 'HH Backscatter', unit: 'dB' },
      hv: { image: 'kerala/hv_backscatter.webp', telemetry: 'kerala/telemetry_hv.json', label: 'HV Backscatter', unit: 'dB' },
      insar: { image: 'kerala/insar_phase.webp', telemetry: 'kerala/telemetry_insar.json', label: 'InSAR Phase', unit: 'rad' },
      coherence: { image: 'kerala/coherence.webp', telemetry: 'kerala/telemetry_coherence.json', label: 'Coherence', unit: 'coherence' },
    },
    optical_cloudy: 'kerala/optical_cloudy.webp',
    timeseries: 'kerala/timeseries.json',
    narrative: 'Welcome to Kuttanad, one of the few places on Earth where farming happens below sea level. Here, SAR reveals what clouds hide — the rhythm of monsoon floods reshaping paddy fields each season.',
  },
  {
    id: 'amazon',
    name: 'Amazon Basin, Brazil',
    subtitle: 'Tropical Deforestation & Flooding',
    lat: -3.05,
    lng: -60.00,
    zoom: 10.0,
    bearing: 0,
    pitch: 18,
    bbox: [-60.45, -3.45, -59.55, -2.65],
    default_layer: 'hv',
    phenomenon: 'Deforestation + biosphere flooding',
    description: 'The Amazon rainforest, the lungs of the Earth, faces relentless deforestation pressure. L-band SAR penetrates the canopy to reveal the hidden extent of flooding beneath the forest floor.',
    sensors: ['NISAR L-band GCOV', 'SAOCOM L-band'],
    polarizations: ['HH', 'HV'],
    frequencies: [
      { band: 'L-band', wavelength_cm: 24 },
      { band: 'S-band', wavelength_cm: 9.3 },
      { band: 'C-band', wavelength_cm: 5.6 },
    ],
    hometown: false,
    layers: {
      hh: { image: 'amazon/hh_backscatter.webp', telemetry: 'amazon/telemetry_hh.json', label: 'HH Backscatter', unit: 'dB' },
      hv: { image: 'amazon/hv_backscatter.webp', telemetry: 'amazon/telemetry_hv.json', label: 'HV Backscatter', unit: 'dB' },
      insar: { image: 'amazon/insar_phase.webp', telemetry: 'amazon/telemetry_insar.json', label: 'InSAR Phase', unit: 'rad' },
      coherence: { image: 'amazon/coherence.webp', telemetry: 'amazon/telemetry_coherence.json', label: 'Coherence', unit: 'coherence' },
    },
    optical_cloudy: 'amazon/optical_cloudy.webp',
    timeseries: 'amazon/timeseries.json',
    narrative: 'Beneath perpetual cloud cover, the Amazon hides its secrets. L-band radar sees through the canopy, revealing the seasonal flood pulse that transforms the forest floor into a vast inland sea.',
  },
  {
    id: 'himalayas',
    name: 'Himalayas',
    subtitle: 'Glacier Dynamics & Cryosphere',
    lat: 27.98,
    lng: 86.90,
    zoom: 10.0,
    bearing: 0,
    pitch: 18,
    bbox: [86.50, 27.60, 87.30, 28.35],
    default_layer: 'hh',
    phenomenon: 'Glacier velocity / cryosphere movement',
    description: 'The Himalayan glaciers are the water towers of Asia, feeding rivers that sustain billions. SAR offset tracking measures glacier flow velocities with centimeter precision.',
    sensors: ['NISAR L-band GCOV', 'NISAR L-band GOFF'],
    polarizations: ['HH', 'HV', 'Offset Tracking'],
    frequencies: [
      { band: 'L-band', wavelength_cm: 24 },
      { band: 'S-band', wavelength_cm: 9.3 },
      { band: 'C-band', wavelength_cm: 5.6 },
    ],
    hometown: false,
    layers: {
      hh: { image: 'himalayas/hh_backscatter.webp', telemetry: 'himalayas/telemetry_hh.json', label: 'HH Backscatter', unit: 'dB' },
      hv: { image: 'himalayas/hv_backscatter.webp', telemetry: 'himalayas/telemetry_hv.json', label: 'HV Backscatter', unit: 'dB' },
      insar: { image: 'himalayas/insar_phase.webp', telemetry: 'himalayas/telemetry_insar.json', label: 'InSAR Phase', unit: 'rad' },
      coherence: { image: 'himalayas/coherence.webp', telemetry: 'himalayas/telemetry_coherence.json', label: 'Coherence', unit: 'coherence' },
    },
    optical_cloudy: 'himalayas/optical_cloudy.webp',
    timeseries: 'himalayas/timeseries.json',
    narrative: "Standing atop the world's highest peaks, glaciers flow in slow motion. NISAR's radar eyes track their centimeter-by-centimeter journey, revealing how climate change accelerates this ancient waltz.",
  },
  {
    id: 'turkey',
    name: 'Turkey / Anatolia',
    subtitle: 'Earthquake Ground Deformation',
    lat: 37.55,
    lng: 37.00,
    zoom: 10.0,
    bearing: 0,
    pitch: 18,
    bbox: [36.55, 37.15, 37.45, 37.95],
    default_layer: 'insar',
    phenomenon: 'Earthquake InSAR ground deformation',
    description: 'InSAR interferometry captures the invisible scars of earthquakes — ground deformation measured in centimeters. Each fringe in the interferogram represents one half-wavelength of surface displacement.',
    sensors: ['NISAR L-band GUNW'],
    polarizations: ['InSAR Phase', 'Coherence'],
    frequencies: [
      { band: 'L-band', wavelength_cm: 24 },
      { band: 'S-band', wavelength_cm: 9.3 },
      { band: 'C-band', wavelength_cm: 5.6 },
    ],
    hometown: false,
    layers: {
      hh: { image: 'turkey/hh_backscatter.webp', telemetry: 'turkey/telemetry_hh.json', label: 'HH Backscatter', unit: 'dB' },
      hv: { image: 'turkey/hv_backscatter.webp', telemetry: 'turkey/telemetry_hv.json', label: 'HV Backscatter', unit: 'dB' },
      insar: { image: 'turkey/insar_phase.webp', telemetry: 'turkey/telemetry_insar.json', label: 'InSAR Phase', unit: 'rad' },
      coherence: { image: 'turkey/coherence.webp', telemetry: 'turkey/telemetry_coherence.json', label: 'Coherence', unit: 'coherence' },
    },
    optical_cloudy: 'turkey/optical_cloudy.webp',
    timeseries: 'turkey/timeseries.json',
    narrative: 'When the Earth shakes, the damage is visible. But the invisible ground deformation — measured in centimeters by InSAR — tells the full story of how tectonic forces reshape the landscape.',
  },
  {
    id: 'punjab',
    name: 'Punjab, India',
    subtitle: 'Dual-Frequency Crop & Soil Moisture',
    lat: 30.90,
    lng: 75.45,
    zoom: 10.0,
    bearing: 0,
    pitch: 18,
    bbox: [75.00, 30.50, 75.90, 31.30],
    default_layer: 'hh',
    phenomenon: 'Agricultural soil moisture + crop cycles',
    description: "Punjab's breadbasket reveals its secrets in dual-frequency SAR. L-band penetrates crops to sense soil moisture, while S-band responds to leaf structure — together they map the agricultural heartbeat.",
    sensors: ['NISAR L-band', 'ISRO S-band'],
    polarizations: ['HH', 'HV'],
    frequencies: [
      { band: 'L-band', wavelength_cm: 24 },
      { band: 'S-band', wavelength_cm: 9.3 },
      { band: 'C-band', wavelength_cm: 5.6 },
    ],
    hometown: false,
    layers: {
      hh: { image: 'punjab/hh_backscatter.webp', telemetry: 'punjab/telemetry_hh.json', label: 'HH Backscatter', unit: 'dB' },
      hv: { image: 'punjab/hv_backscatter.webp', telemetry: 'punjab/telemetry_hv.json', label: 'HV Backscatter', unit: 'dB' },
      insar: { image: 'punjab/insar_phase.webp', telemetry: 'punjab/telemetry_insar.json', label: 'InSAR Phase', unit: 'rad' },
      coherence: { image: 'punjab/coherence.webp', telemetry: 'punjab/telemetry_coherence.json', label: 'Coherence', unit: 'coherence' },
    },
    optical_cloudy: 'punjab/optical_cloudy.webp',
    timeseries: 'punjab/timeseries.json',
    narrative: 'In the golden fields of Punjab, two radar frequencies dance together: L-band probes the soil moisture beneath, while S-band reads the canopy above. Together they tell the story of every harvest.',
  },
  {
    id: 'indonesia',
    name: 'Indonesia / Sumatra',
    subtitle: 'Peatland Fires & Smoke Penetration',
    lat: -0.20,
    lng: 102.20,
    zoom: 10.0,
    bearing: 0,
    pitch: 18,
    bbox: [101.80, -0.60, 102.60, 0.20],
    default_layer: 'hv',
    phenomenon: 'Peatland fires',
    description: 'When peatlands burn, thick smoke blankets Sumatra for months. Optical satellites are blinded, but SAR cuts through the haze, mapping burn scars and moisture changes in the smoldering peat.',
    sensors: ['RADARSAT C-band', 'NISAR L-band'],
    polarizations: ['HV', 'VV'],
    frequencies: [
      { band: 'L-band', wavelength_cm: 24 },
      { band: 'S-band', wavelength_cm: 9.3 },
      { band: 'C-band', wavelength_cm: 5.6 },
    ],
    hometown: false,
    layers: {
      hh: { image: 'indonesia/hh_backscatter.webp', telemetry: 'indonesia/telemetry_hh.json', label: 'HH Backscatter', unit: 'dB' },
      hv: { image: 'indonesia/hv_backscatter.webp', telemetry: 'indonesia/telemetry_hv.json', label: 'HV Backscatter', unit: 'dB' },
      insar: { image: 'indonesia/insar_phase.webp', telemetry: 'indonesia/telemetry_insar.json', label: 'InSAR Phase', unit: 'rad' },
      coherence: { image: 'indonesia/coherence.webp', telemetry: 'indonesia/telemetry_coherence.json', label: 'Coherence', unit: 'coherence' },
    },
    optical_cloudy: 'indonesia/optical_cloudy.webp',
    timeseries: 'indonesia/timeseries.json',
    narrative: 'Smoke so thick it grounds flights and closes schools — but radar sees through it all. In Sumatra\'s peatlands, SAR reveals the hidden scars of fires that burn underground for months.',
  },
];

export function useStudyAreas() {
  const [areas, setAreas] = useState<StudyArea[]>(FALLBACK_AREAS);
  const [activeArea, setActiveArea] = useState<StudyArea>(FALLBACK_AREAS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadStudyAreas = async () => {
      try {
        const res = await fetch('/data/study-areas.json');
        if (!res.ok) return;
        const data = (await res.json()) as StudyAreasData;
        if (!cancelled && data.areas?.length) {
          setAreas(data.areas);
          setActiveArea(data.areas[0]);
        }
      } catch {
        /* silent fallback, never console.error */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStudyAreas();
    return () => {
      cancelled = true;
    };
  }, []);

  return { areas, activeArea, setActiveArea, loading };
}
