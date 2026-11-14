'use client';

import { useRef, useEffect, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { StudyArea, LayerInfo, BasemapStyle } from '@/types';
import { ANCILLARY_DATA_BY_AREA } from './AncillaryData';

// Esri World Imagery + Esri Reference Boundaries (Zero watermark, zero API key required)
const ESRI_SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-world-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri, Maxar, Earthstar Geographics',
      maxzoom: 19,
    },
    'esri-reference': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri-imagery-layer',
      type: 'raster',
      source: 'esri-world-imagery',
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: 'esri-reference-layer',
      type: 'raster',
      source: 'esri-reference',
      minzoom: 0,
      maxzoom: 22,
      paint: { 'raster-opacity': 0.85 },
    },
  ],
};

// Esri Dark Gray Canvas Base + Reference (Zero watermark, zero API key required)
const ESRI_DARK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-dark-base': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri, HERE, Garmin',
      maxzoom: 16,
    },
    'esri-dark-reference': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri',
      maxzoom: 16,
    },
  },
  layers: [
    {
      id: 'esri-dark-base-layer',
      type: 'raster',
      source: 'esri-dark-base',
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: 'esri-dark-ref-layer',
      type: 'raster',
      source: 'esri-dark-reference',
      minzoom: 0,
      maxzoom: 22,
      paint: { 'raster-opacity': 0.8 },
    },
  ],
};

// NASA VIIRS SNPP True-Color composite + Esri Reference (Zero orbital zebra stripes)
const GIBS_TRUECOLOR_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'gibs-viirs': {
      type: 'raster',
      tiles: [
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2025-09-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      ],
      tileSize: 256,
      attribution: '© NASA EOSDIS GIBS',
      maxzoom: 9,
    },
    'esri-reference': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'gibs-viirs-layer',
      type: 'raster',
      source: 'gibs-viirs',
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: 'esri-reference-layer',
      type: 'raster',
      source: 'esri-reference',
      minzoom: 0,
      maxzoom: 22,
      paint: { 'raster-opacity': 0.8 },
    },
  ],
};

// Esri Light Gray Canvas Base + Reference (Zero watermark, zero API key required)
const ESRI_LIGHT_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-light-base': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri, HERE, Garmin',
      maxzoom: 16,
    },
    'esri-light-reference': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri',
      maxzoom: 16,
    },
  },
  layers: [
    {
      id: 'esri-light-base-layer',
      type: 'raster',
      source: 'esri-light-base',
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: 'esri-light-ref-layer',
      type: 'raster',
      source: 'esri-light-reference',
      minzoom: 0,
      maxzoom: 22,
      paint: { 'raster-opacity': 0.8 },
    },
  ],
};

export const BASEMAPS: Record<BasemapStyle, { style: maplibregl.StyleSpecification; label: string }> = {
  'esri-satellite': {
    style: ESRI_SATELLITE_STYLE,
    label: 'Satellite',
  },
  'dark-matter': {
    style: ESRI_DARK_STYLE,
    label: 'Dark Matter',
  },
  'gibs-truecolor': {
    style: GIBS_TRUECOLOR_STYLE,
    label: 'NASA VIIRS',
  },
  positron: {
    style: ESRI_LIGHT_STYLE,
    label: 'Positron',
  },
};

interface GlobeProps {
  areas: StudyArea[];
  activeArea: StudyArea;
  activeLayer: LayerInfo | null;
  onAreaClick: (area: StudyArea) => void;
  ancillaryVisible: string[];
  onCursorMove?: (coords: { lat: number; lng: number } | null) => void;
  basemap?: BasemapStyle;
  opacity?: number;
  captureTrigger?: number;
  onSnapshotExported?: (filename: string) => void;
  timelineIndex?: number;
  selectedBand?: string;
}

export default function Globe({
  areas,
  activeArea,
  activeLayer,
  onAreaClick,
  ancillaryVisible,
  onCursorMove,
  basemap = 'esri-satellite',
  opacity = 0.85,
  captureTrigger = 0,
  onSnapshotExported,
  timelineIndex = 0,
  selectedBand = 'L-Band',
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const isLoadedRef = useRef(false);

  // Cached base image element for offscreen dynamic canvas frame modulation
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport alignment: Fit bounds tightly around ~90km x 90km swath (zoom level 9.0 - 10.5)
  const fitAreaBounds = useCallback((area: StudyArea, duration = 1400) => {
    const map = mapRef.current;
    if (!map) return;

    const bbox = area.bbox || [
      area.lng - 0.45,
      area.lat - 0.40,
      area.lng + 0.45,
      area.lat + 0.40,
    ];
    const [west, south, east, north] = bbox;

    map.fitBounds(
      [
        [west, south],
        [east, north],
      ],
      {
        padding: { top: 80, bottom: 120, left: 380, right: 60 },
        duration: duration,
        essential: true,
        maxZoom: 11,
        minZoom: 8.8,
      }
    );
  }, []);

  // Modulate SAR raster pixel data on timeline step or frequency band changes
  const updateModulatedRaster = useCallback((stepIndex: number, band: string) => {
    const map = mapRef.current;
    const img = baseImageRef.current;
    if (!map || !map.isStyleLoaded() || !img) return;

    const source = map.getSource('sar-overlay') as maplibregl.ImageSource | undefined;
    if (!source) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = offscreenCanvasRef.current;
    const w = img.naturalWidth || img.width || 512;
    const h = img.naturalHeight || img.height || 512;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, w, h);

    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const areaId = activeArea.id;

      if (areaId === 'kerala' || areaId === 'kerala_floods') {
        // Monsoon flood surge in steps 3-8 over Kuttanad / Vembanad wetland depression
        const floodFactor =
          stepIndex >= 3 && stepIndex <= 8
            ? Math.sin(((stepIndex - 3) / 5) * Math.PI) * 0.75
            : 0;

        if (floodFactor > 0.05) {
          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a === 0) continue;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;

            // Low-lying land inundated by water suffers strong specular absorption (darkens)
            if (brightness < 145) {
              const att = 1.0 - floodFactor * (1.0 - brightness / 145);
              data[i] = Math.max(10, Math.round(r * att));
              data[i + 1] = Math.max(15, Math.round(g * att));
              data[i + 2] = Math.max(30, Math.round(b * att * 0.85 + 24 * floodFactor));
            }
          }
        }
      } else if (areaId === 'turkey' || areaId === 'turkey_earthquake') {
        // InSAR fringe phase rotation along the East Anatolian Fault line
        const phaseShift = ((stepIndex % 12) / 12) * Math.PI * 2;
        const sinP = Math.sin(phaseShift);
        const cosP = Math.cos(phaseShift);
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, Math.max(0, Math.round(r * (0.8 + 0.2 * cosP) + g * (0.2 * sinP))));
          data[i + 1] = Math.min(255, Math.max(0, Math.round(g * (0.8 + 0.2 * cosP) + b * (0.2 * sinP))));
          data[i + 2] = Math.min(255, Math.max(0, Math.round(b * (0.8 + 0.2 * cosP) + r * (0.2 * sinP))));
        }
      } else if (areaId === 'amazon' || areaId === 'amazon_deforestation') {
        // Deforestation expansion: patches transition from high volume scattering to clearcut
        const deforestProg = stepIndex / 11;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) continue;
          const px = (i / 4) % w;
          const py = Math.floor(i / 4 / w);
          const patchHash = Math.abs(Math.sin(px * 12.9898 + py * 78.233) * 43758.5453);
          const patchVal = patchHash - Math.floor(patchHash);
          if (patchVal < deforestProg * 0.22) {
            data[i] = Math.round(data[i] * 0.72);
            data[i + 1] = Math.round(data[i + 1] * 0.68);
            data[i + 2] = Math.round(data[i + 2] * 0.72);
          }
        }
      } else {
        // Seasonal phenology oscillation
        const mod = 1.0 + Math.sin((stepIndex / 12) * Math.PI * 2) * 0.12;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) continue;
          data[i] = Math.min(255, Math.round(data[i] * mod));
          data[i + 1] = Math.min(255, Math.round(data[i + 1] * mod));
          data[i + 2] = Math.min(255, Math.round(data[i + 2] * mod));
        }
      }

      // Frequency Wavelength Scattering adjustments:
      // S-band (9.3cm) and C-band (5.6cm) have shorter wavelengths -> higher surface roughness response
      if (band === 'S-Band') {
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) continue;
          data[i] = Math.min(255, Math.round(data[i] * 1.08));
          data[i + 1] = Math.min(255, Math.round(data[i + 1] * 1.04));
        }
      } else if (band === 'C-Band') {
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) continue;
          data[i + 1] = Math.min(255, Math.round(data[i + 1] * 1.10));
          data[i + 2] = Math.min(255, Math.round(data[i + 2] * 1.14));
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL('image/webp', 0.85);
      source.updateImage({ url: dataUrl });
    } catch (err) {
      console.warn('Canvas modulation update error:', err);
    }
  }, [activeArea.id]);

  // Render Ancillary Context Overlays (Human Settlements, Agriculture, Infrastructure)
  const renderAncillaryLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const data = ANCILLARY_DATA_BY_AREA[activeArea.id] || ANCILLARY_DATA_BY_AREA.kerala;

    // 1. Agriculture Fill & Line
    if (map.getSource('ancillary-agriculture-src')) {
      (map.getSource('ancillary-agriculture-src') as maplibregl.GeoJSONSource).setData(data.agriculture);
    } else {
      map.addSource('ancillary-agriculture-src', {
        type: 'geojson',
        data: data.agriculture,
      });
      map.addLayer({
        id: 'ancillary-agriculture-fill',
        type: 'fill',
        source: 'ancillary-agriculture-src',
        layout: {
          visibility: ancillaryVisible.includes('agriculture') ? 'visible' : 'none',
        },
        paint: {
          'fill-color': '#10B981',
          'fill-opacity': 0.22,
        },
      });
      map.addLayer({
        id: 'ancillary-agriculture-line',
        type: 'line',
        source: 'ancillary-agriculture-src',
        layout: {
          visibility: ancillaryVisible.includes('agriculture') ? 'visible' : 'none',
        },
        paint: {
          'line-color': '#10B981',
          'line-width': 1.8,
          'line-dasharray': [3, 2],
        },
      });
    }

    // 2. Infrastructure Corridor Lines
    if (map.getSource('ancillary-infrastructure-src')) {
      (map.getSource('ancillary-infrastructure-src') as maplibregl.GeoJSONSource).setData(data.infrastructure);
    } else {
      map.addSource('ancillary-infrastructure-src', {
        type: 'geojson',
        data: data.infrastructure,
      });
      map.addLayer({
        id: 'ancillary-infrastructure-casing',
        type: 'line',
        source: 'ancillary-infrastructure-src',
        layout: {
          visibility: ancillaryVisible.includes('infrastructure') ? 'visible' : 'none',
        },
        paint: {
          'line-color': '#090A0F',
          'line-width': 4.5,
          'line-opacity': 0.85,
        },
      });
      map.addLayer({
        id: 'ancillary-infrastructure-line',
        type: 'line',
        source: 'ancillary-infrastructure-src',
        layout: {
          visibility: ancillaryVisible.includes('infrastructure') ? 'visible' : 'none',
        },
        paint: {
          'line-color': '#06B6D4',
          'line-width': 2.5,
          'line-opacity': 0.95,
        },
      });
    }

    // 3. Human Settlements (Glowing Circles & Labels)
    if (map.getSource('ancillary-population-src')) {
      (map.getSource('ancillary-population-src') as maplibregl.GeoJSONSource).setData(data.population);
    } else {
      map.addSource('ancillary-population-src', {
        type: 'geojson',
        data: data.population,
      });
      map.addLayer({
        id: 'ancillary-population-halo',
        type: 'circle',
        source: 'ancillary-population-src',
        layout: {
          visibility: ancillaryVisible.includes('population') ? 'visible' : 'none',
        },
        paint: {
          'circle-radius': 9,
          'circle-color': '#F59E0B',
          'circle-opacity': 0.35,
        },
      });
      map.addLayer({
        id: 'ancillary-population-circles',
        type: 'circle',
        source: 'ancillary-population-src',
        layout: {
          visibility: ancillaryVisible.includes('population') ? 'visible' : 'none',
        },
        paint: {
          'circle-radius': 4.5,
          'circle-color': '#EF4444',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#F1F5F9',
        },
      });
      map.addLayer({
        id: 'ancillary-population-labels',
        type: 'symbol',
        source: 'ancillary-population-src',
        layout: {
          visibility: ancillaryVisible.includes('population') ? 'visible' : 'none',
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#F1F5F9',
          'text-halo-color': '#090A0F',
          'text-halo-width': 2,
        },
      });
    }
  }, [activeArea.id, ancillaryVisible]);

  // Render native MapLibre image raster (organic, zero bounding-box border)
  const renderSarOverlay = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('sar-overlay-layer')) map.removeLayer('sar-overlay-layer');
    if (map.getSource('sar-overlay')) map.removeSource('sar-overlay');

    if (!activeLayer) return;

    const bbox = activeArea.bbox || [
      activeArea.lng - 0.45,
      activeArea.lat - 0.40,
      activeArea.lng + 0.45,
      activeArea.lat + 0.40,
    ];
    const [west, south, east, north] = bbox;

    const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
      [west, north], // Top-Left
      [east, north], // Top-Right
      [east, south], // Bottom-Right
      [west, south], // Bottom-Left
    ];

    const imagePath = `/data/${activeLayer.image}`;

    try {
      map.addSource('sar-overlay', {
        type: 'image',
        url: imagePath,
        coordinates: coordinates,
      });

      // Insert raster layer before ancillary layers so context overlays render cleanly on top
      map.addLayer(
        {
          id: 'sar-overlay-layer',
          type: 'raster',
          source: 'sar-overlay',
          paint: {
            'raster-opacity': opacity,
            'raster-fade-duration': 200,
          },
        },
        map.getLayer('ancillary-agriculture-fill') ? 'ancillary-agriculture-fill' : undefined
      );

      // Cache base image for smooth timeline modulation
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imagePath;
      img.onload = () => {
        baseImageRef.current = img;
        updateModulatedRaster(timelineIndex, selectedBand);
      };

      // Ensure ancillary context layers are active and rendered on top
      renderAncillaryLayers();
    } catch (err) {
      console.warn('MapLibre overlay render warning:', err);
    }
  }, [activeArea, activeLayer, opacity, timelineIndex, selectedBand, updateModulatedRaster, renderAncillaryLayers]);

  // Update modulated raster when timeline index or frequency band changes
  useEffect(() => {
    if (baseImageRef.current) {
      updateModulatedRaster(timelineIndex, selectedBand);
    }
  }, [timelineIndex, selectedBand, updateModulatedRaster]);

  // React to ancillary layer visibility toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const agVis = ancillaryVisible.includes('agriculture') ? 'visible' : 'none';
    const infVis = ancillaryVisible.includes('infrastructure') ? 'visible' : 'none';
    const popVis = ancillaryVisible.includes('population') ? 'visible' : 'none';

    if (map.getLayer('ancillary-agriculture-fill')) map.setLayoutProperty('ancillary-agriculture-fill', 'visibility', agVis);
    if (map.getLayer('ancillary-agriculture-line')) map.setLayoutProperty('ancillary-agriculture-line', 'visibility', agVis);
    if (map.getLayer('ancillary-infrastructure-casing')) map.setLayoutProperty('ancillary-infrastructure-casing', 'visibility', infVis);
    if (map.getLayer('ancillary-infrastructure-line')) map.setLayoutProperty('ancillary-infrastructure-line', 'visibility', infVis);
    if (map.getLayer('ancillary-population-halo')) map.setLayoutProperty('ancillary-population-halo', 'visibility', popVis);
    if (map.getLayer('ancillary-population-circles')) map.setLayoutProperty('ancillary-population-circles', 'visibility', popVis);
    if (map.getLayer('ancillary-population-labels')) map.setLayoutProperty('ancillary-population-labels', 'visibility', popVis);
  }, [ancillaryVisible]);

  // Export high-resolution annotated snapshot
  const exportSnapshot = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const mapCanvas = map.getCanvas();
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = mapCanvas.width;
    exportCanvas.height = mapCanvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(mapCanvas, 0, 0);

    const pad = 24;
    ctx.fillStyle = 'rgba(9, 10, 15, 0.90)';
    ctx.strokeStyle = '#222736';
    ctx.lineWidth = 1;

    const bannerW = 420;
    const bannerH = 100;
    const bannerX = pad;
    const bannerY = pad;

    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('EARTHWALTZ OBSERVATORY · NASA SPACE APPS 2026', bannerX + 14, bannerY + 24);

    ctx.fillStyle = '#F1F5F9';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(activeArea.name, bannerX + 14, bannerY + 46);

    ctx.fillStyle = '#8A94A6';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(
      `${activeArea.phenomenon} · Layer: ${activeLayer?.label || 'SAR'} (${activeLayer?.unit || 'dB'}) [${selectedBand}]`,
      bannerX + 14,
      bannerY + 66
    );

    ctx.fillStyle = '#8A94A6';
    ctx.font = '9px monospace';
    ctx.fillText(
      `Sensor: ${activeArea.provenance?.platform || 'NISAR L-Band'} | ID: ${activeArea.provenance?.granule_id || 'ALAV2A278633410'}`,
      bannerX + 14,
      bannerY + 86
    );

    const filename = `EarthWaltz_${activeArea.id}_${activeLayer?.label || 'SAR'}_${new Date().toISOString().slice(0, 10)}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();

    onSnapshotExported?.(filename);
  }, [activeArea, activeLayer, selectedBand, onSnapshotExported]);

  // Trigger snapshot export from props
  useEffect(() => {
    if (captureTrigger > 0) {
      exportSnapshot();
    }
  }, [captureTrigger, exportSnapshot]);

  // Initialize MapLibre Map instance
  useEffect(() => {
    if (!containerRef.current) return;

    const initialBbox = activeArea.bbox || [
      activeArea.lng - 0.45,
      activeArea.lat - 0.40,
      activeArea.lng + 0.45,
      activeArea.lat + 0.40,
    ];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAPS[basemap]?.style || ESRI_SATELLITE_STYLE,
      bounds: [
        [initialBbox[0], initialBbox[1]],
        [initialBbox[2], initialBbox[3]],
      ],
      fitBoundsOptions: {
        padding: { top: 80, bottom: 120, left: 380, right: 60 },
        duration: 0,
        maxZoom: 11,
        minZoom: 8.8,
      },
      attributionControl: false,
      renderWorldCopies: false,
      preserveDrawingBuffer: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: 'EarthWaltz · NASA EOSDIS · ISRO' }),
      'bottom-right'
    );

    map.on('mousemove', (e) => {
      onCursorMove?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    map.on('mouseout', () => {
      onCursorMove?.(null);
    });

    map.on('load', () => {
      isLoadedRef.current = true;
      renderSarOverlay();
    });

    map.on('style.load', () => {
      renderSarOverlay();
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      isLoadedRef.current = false;
    };
  }, []);

  // React to basemap style switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const styleSpec = BASEMAPS[basemap]?.style || ESRI_SATELLITE_STYLE;
    map.setStyle(styleSpec);
  }, [basemap]);

  // React to opacity updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (map.getLayer('sar-overlay-layer')) {
      map.setPaintProperty('sar-overlay-layer', 'raster-opacity', opacity);
    }
  }, [opacity]);

  // React to active study area or layer changes: re-render overlay & fly camera
  useEffect(() => {
    renderSarOverlay();
    fitAreaBounds(activeArea);
  }, [activeArea, activeLayer, fitAreaBounds, renderSarOverlay]);

  // Update study area map pin markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    areas.forEach((area) => {
      const isSelected = area.id === activeArea.id;

      const el = document.createElement('div');
      el.className = 'group cursor-pointer select-none';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-3.5 h-3.5 rounded-full ${
            isSelected
              ? 'bg-[#F59E0B] ring-4 ring-[#F59E0B]/30'
              : 'bg-[#12151E] border border-[#222736] group-hover:border-[#F59E0B]'
          } transition-all"></div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onAreaClick(area);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([area.lng, area.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [areas, activeArea.id, onAreaClick]);

  return <div ref={containerRef} className="w-full h-full relative" />;
}
