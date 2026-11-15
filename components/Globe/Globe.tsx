'use client';

import { useRef, useEffect, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { StudyArea, LayerInfo, BasemapStyle } from '@/types';
import { ANCILLARY_DATA_BY_AREA } from './AncillaryData';

// Bottom Map (Radar): Esri World Imagery darkened with topographic contrast
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
      paint: {
        'raster-brightness-max': 0.82,
        'raster-contrast': 0.25,
      },
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

// Top Map (Optical): Bright True-Color optical satellite imagery + live NASA GIBS Cloud WMTS layer
const OPTICAL_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-optical-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri, Maxar',
      maxzoom: 19,
    },
    'nasa-gibs-clouds': {
      type: 'raster',
      tiles: [
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2025-08-12/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      ],
      tileSize: 256,
      attribution: '© NASA EOSDIS GIBS',
      maxzoom: 8,
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
      id: 'esri-optical-imagery-layer',
      type: 'raster',
      source: 'esri-optical-imagery',
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: 'nasa-gibs-cloud-layer',
      type: 'raster',
      source: 'nasa-gibs-clouds',
      minzoom: 0,
      maxzoom: 22,
      layout: {
        visibility: 'none',
      },
      paint: {
        'raster-opacity': 0,
      },
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

// Additional Basemaps for Workbench Mode
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

const GIBS_TRUECOLOR_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'gibs-viirs': {
      type: 'raster',
      tiles: [
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2025-08-12/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      ],
      tileSize: 256,
      attribution: '© NASA EOSDIS GIBS',
      maxzoom: 8,
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
  isTimelinePlaying?: boolean;
  curtainPosition?: number;
  mode?: 'story' | 'instrument';
  showOpticalSplit?: boolean;
  showClouds?: boolean;
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
  isTimelinePlaying = false,
  curtainPosition = 38,
  mode = 'story',
  showOpticalSplit = false,
  showClouds = false,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const radarContainerRef = useRef<HTMLDivElement>(null);
  const opticalContainerRef = useRef<HTMLDivElement>(null);

  const radarMapRef = useRef<maplibregl.Map | null>(null);
  const opticalMapRef = useRef<maplibregl.Map | null>(null);
  const isSyncingRef = useRef<boolean>(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const isLoadedRef = useRef(false);

  // Helper to extract 4-point bounding box coordinates for raster image overlays
  const getBboxCoordinates = (area: StudyArea): [[number, number], [number, number], [number, number], [number, number]] => {
    const bbox = area.bbox || [
      area.lng - 0.45,
      area.lat - 0.40,
      area.lng + 0.45,
      area.lat + 0.40,
    ];
    const [west, south, east, north] = bbox;
    return [
      [west, north], // Top-Left
      [east, north], // Top-Right
      [east, south], // Bottom-Right
      [west, south], // Bottom-Left
    ];
  };

  // Bidirectional camera synchronization using isSyncing lock and jumpTo
  const syncCamera = useCallback((source: maplibregl.Map, target: maplibregl.Map) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    target.jumpTo({
      center: source.getCenter(),
      zoom: source.getZoom(),
      bearing: source.getBearing(),
      pitch: source.getPitch(),
    });
    isSyncingRef.current = false;
  }, []);

  // Frame lock to active area center at zoom 10.0, pitch 18, bearing 0
  const fitAreaBounds = useCallback((area: StudyArea, duration = 1100) => {
    const radarMap = radarMapRef.current;
    if (!radarMap) return;

    radarMap.flyTo({
      center: [area.lng, area.lat],
      zoom: 10.0,
      pitch: 18,
      bearing: 0,
      duration: duration,
      essential: true,
    });
  }, []);

  // Render Ancillary Context Overlays on radarMap (Settlements, Agriculture, Infrastructure)
  const renderAncillaryLayers = useCallback(() => {
    const map = radarMapRef.current;
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
          'line-color': '#111210',
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
          'line-color': '#10B981',
          'line-width': 2.5,
          'line-opacity': 0.95,
        },
      });
    }

    // 3. Human Settlements (Halo, Circles & Labels)
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
          'circle-color': '#10B981',
          'circle-opacity': 0.28,
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
          'circle-color': '#10B981',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#F3F2EE',
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
          'text-color': '#F3F2EE',
          'text-halo-color': '#111210',
          'text-halo-width': 2,
        },
      });
    }
  }, [activeArea.id, ancillaryVisible]);

  // Render active SAR Overlay onto radarMapRef (Bottom Map)
  const renderRadarOverlays = useCallback(() => {
    const map = radarMapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const layerObj =
      activeLayer ||
      (activeArea.default_layer && activeArea.layers[activeArea.default_layer]) ||
      Object.values(activeArea.layers)[0];

    if (!layerObj) return;

    const coordinates = getBboxCoordinates(activeArea);
    const imagePath = `/data/${layerObj.image}`;
    const targetOpacity = Math.max(0.85, opacity);

    try {
      const existingSource = map.getSource('sar-overlay') as maplibregl.ImageSource | undefined;
      if (existingSource) {
        existingSource.setCoordinates(coordinates);
        existingSource.updateImage({ url: imagePath, coordinates });
        if (map.getLayer('sar-overlay-layer')) {
          map.setPaintProperty('sar-overlay-layer', 'raster-opacity', targetOpacity);
        }
      } else {
        map.addSource('sar-overlay', {
          type: 'image',
          url: imagePath,
          coordinates: coordinates,
        });

        // Insert before ancillary layers so context vectors render on top
        const beforeLayer = map.getLayer('ancillary-agriculture-fill') ? 'ancillary-agriculture-fill' : undefined;
        map.addLayer(
          {
            id: 'sar-overlay-layer',
            type: 'raster',
            source: 'sar-overlay',
            paint: {
              'raster-opacity': targetOpacity,
              'raster-fade-duration': 150,
              'raster-resampling': 'linear',
              'raster-contrast': 0.12,
              'raster-brightness-min': 0.04,
            },
          },
          beforeLayer
        );
      }

      renderAncillaryLayers();
    } catch {
      /* silent fallback, never console.error */
    }
  }, [activeArea, activeLayer, opacity, renderAncillaryLayers]);

  // Render optical cloud deck onto opticalMapRef (Top Map)
  // CRITICAL: sar-overlay is NEVER added to opticalMapRef
  const renderOpticalOverlays = useCallback(() => {
    const map = opticalMapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (!activeArea.optical_cloudy) return;

    const coordinates = getBboxCoordinates(activeArea);
    const cloudImagePath = `/data/${activeArea.optical_cloudy}`;
    const targetOpacity = showClouds ? 0.85 : 0;
    const targetVisibility = showClouds ? 'visible' : 'none';

    try {
      const existingCloudSource = map.getSource('optical-cloud-deck') as maplibregl.ImageSource | undefined;
      if (existingCloudSource) {
        existingCloudSource.setCoordinates(coordinates);
        existingCloudSource.updateImage({ url: cloudImagePath, coordinates });
        if (map.getLayer('optical-cloud-deck-layer')) {
          map.setPaintProperty('optical-cloud-deck-layer', 'raster-opacity', targetOpacity);
          map.setLayoutProperty('optical-cloud-deck-layer', 'visibility', targetVisibility);
        }
      } else {
        map.addSource('optical-cloud-deck', {
          type: 'image',
          url: cloudImagePath,
          coordinates: coordinates,
        });

        // Insert below reference labels so labels stay readable
        const beforeRef = map.getLayer('esri-reference-layer') ? 'esri-reference-layer' : undefined;
        map.addLayer(
          {
            id: 'optical-cloud-deck-layer',
            type: 'raster',
            source: 'optical-cloud-deck',
            layout: {
              visibility: targetVisibility,
            },
            paint: {
              'raster-opacity': targetOpacity,
              'raster-resampling': 'linear',
              'raster-fade-duration': 150,
            },
          },
          beforeRef
        );
      }
    } catch {
      /* silent fallback, never console.error */
    }
  }, [activeArea, showClouds]);

  // Dynamically modulate cloud layers on showClouds toggle
  useEffect(() => {
    const map = opticalMapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const gibsOpacity = showClouds ? 0.55 : 0;
    const deckOpacity = showClouds ? 0.85 : 0;
    const targetVisibility = showClouds ? 'visible' : 'none';

    if (map.getLayer('nasa-gibs-cloud-layer')) {
      map.setPaintProperty('nasa-gibs-cloud-layer', 'raster-opacity', gibsOpacity);
      map.setLayoutProperty('nasa-gibs-cloud-layer', 'visibility', targetVisibility);
    }

    if (map.getLayer('optical-cloud-deck-layer')) {
      map.setPaintProperty('optical-cloud-deck-layer', 'raster-opacity', deckOpacity);
      map.setLayoutProperty('optical-cloud-deck-layer', 'visibility', targetVisibility);
    }
  }, [showClouds]);

  // High-resolution dual-layer snapshot export combining radar and optical maps with curtain divider
  const exportSnapshot = useCallback(() => {
    const radarMap = radarMapRef.current;
    const opticalMap = opticalMapRef.current;
    if (!radarMap) return;

    const radarCanvas = radarMap.getCanvas();
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = radarCanvas.width;
    exportCanvas.height = radarCanvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw bottom radar map
    ctx.drawImage(radarCanvas, 0, 0);

    // 2. In story mode, composite top optical map clipped by curtain position if optical split is active
    if (mode === 'story' && opticalMap && showOpticalSplit) {
      const opticalCanvas = opticalMap.getCanvas();
      const splitX = Math.round(((curtainPosition ?? 38) / 100) * exportCanvas.width);

      if (splitX > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, exportCanvas.height);
        ctx.clip();
        ctx.drawImage(opticalCanvas, 0, 0);
        ctx.restore();

        // 2px Cobalt divider line
        ctx.strokeStyle = '#0047AB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, exportCanvas.height);
        ctx.stroke();
      }
    }

    // 3. Swiss Cartographic metadata banner
    const pad = 24;
    const bannerW = 440;
    const bannerH = 104;
    const bannerX = pad;
    const bannerY = pad;

    // Alabaster Vellum background card with Survey Rule border
    ctx.fillStyle = 'rgba(246, 245, 240, 0.96)';
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
    ctx.strokeStyle = '#D0CEC4';
    ctx.lineWidth = 1;
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

    // International Cobalt accent rule
    ctx.fillStyle = '#0047AB';
    ctx.fillRect(bannerX, bannerY, bannerW, 3);

    // Header brand
    ctx.fillStyle = '#0047AB';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('EarthWaltz Observatory · NASA-ISRO NISAR', bannerX + 14, bannerY + 22);

    // Region title
    ctx.fillStyle = '#121417';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(activeArea.name, bannerX + 14, bannerY + 44);

    // Phenomenon & Layer details
    ctx.fillStyle = '#52525B';
    ctx.font = '11px sans-serif';
    ctx.fillText(
      `${activeArea.phenomenon} · ${activeLayer?.label || 'SAR'} (${activeLayer?.unit || 'dB'}) [${selectedBand}]`,
      bannerX + 14,
      bannerY + 66
    );

    // Granule ID & Sensor provenance
    ctx.fillStyle = '#71717A';
    ctx.font = '10px monospace';
    ctx.fillText(
      `Sensor: ${activeArea.provenance?.platform || 'NISAR L-Band'} | ID: ${activeArea.provenance?.granule_id || 'ALPSRP278380480'}`,
      bannerX + 14,
      bannerY + 88
    );

    const filename = `EarthWaltz_${activeArea.id}_${activeLayer?.label || 'SAR'}_${new Date().toISOString().slice(0, 10)}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();

    onSnapshotExported?.(filename);
  }, [activeArea, activeLayer, selectedBand, mode, curtainPosition, showOpticalSplit, onSnapshotExported]);

  // Trigger snapshot export from props
  useEffect(() => {
    if (captureTrigger > 0) {
      exportSnapshot();
    }
  }, [captureTrigger, exportSnapshot]);

  // Initialize Dual MapLibre GL JS instances
  useEffect(() => {
    if (!radarContainerRef.current || !opticalContainerRef.current) return;

    const initialCenter: [number, number] = [
      activeArea?.lng ?? 76.65,
      activeArea?.lat ?? 9.65,
    ];
    const initialZoom = activeArea?.zoom ?? 10.0;

    // 1. Bottom Radar Map
    const radarMap = new maplibregl.Map({
      container: radarContainerRef.current,
      style: BASEMAPS[basemap]?.style || ESRI_SATELLITE_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      pitch: 18,
      bearing: 0,
      minZoom: 6,
      attributionControl: false,
      renderWorldCopies: false,
      preserveDrawingBuffer: true,
    });

    radarMap.on('error', () => {
      /* silent fallback for tile network errors, never console.error */
    });

    radarMap.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    radarMap.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: 'EarthWaltz · NASA EOSDIS · ISRO' }),
      'bottom-right'
    );

    // 2. Top Optical Map
    const opticalMap = new maplibregl.Map({
      container: opticalContainerRef.current,
      style: OPTICAL_MAP_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      pitch: 18,
      bearing: 0,
      minZoom: 6,
      attributionControl: false,
      renderWorldCopies: false,
      preserveDrawingBuffer: true,
    });

    opticalMap.on('error', () => {
      /* silent fallback for tile network errors, never console.error */
    });

    // Bidirectional camera synchronization
    radarMap.on('move', () => {
      if (opticalMapRef.current) {
        syncCamera(radarMap, opticalMapRef.current);
      }
    });

    opticalMap.on('move', () => {
      if (radarMapRef.current) {
        syncCamera(opticalMap, radarMapRef.current);
      }
    });

    // Telemetry cursor tracking on both maps
    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      onCursorMove?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    const handleMouseOut = () => {
      onCursorMove?.(null);
    };

    radarMap.on('mousemove', handleMouseMove);
    radarMap.on('mouseout', handleMouseOut);
    opticalMap.on('mousemove', handleMouseMove);
    opticalMap.on('mouseout', handleMouseOut);

    radarMap.on('load', () => {
      isLoadedRef.current = true;
      renderRadarOverlays();
    });
    radarMap.on('style.load', () => {
      renderRadarOverlays();
    });

    opticalMap.on('load', () => {
      renderOpticalOverlays();
    });
    opticalMap.on('style.load', () => {
      renderOpticalOverlays();
    });

    radarMapRef.current = radarMap;
    opticalMapRef.current = opticalMap;

    const resizeObserver = new ResizeObserver(() => {
      radarMap.resize();
      opticalMap.resize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      radarMap.remove();
      opticalMap.remove();
      radarMapRef.current = null;
      opticalMapRef.current = null;
      isLoadedRef.current = false;
    };
  }, []);

  // React to basemap switch on bottom radar map
  useEffect(() => {
    const radarMap = radarMapRef.current;
    if (!radarMap) return;
    const styleSpec = BASEMAPS[basemap]?.style || ESRI_SATELLITE_STYLE;
    radarMap.setStyle(styleSpec);
  }, [basemap]);

  // React to opacity updates
  useEffect(() => {
    const radarMap = radarMapRef.current;
    if (!radarMap || !radarMap.isStyleLoaded()) return;
    if (radarMap.getLayer('sar-overlay-layer')) {
      radarMap.setPaintProperty('sar-overlay-layer', 'raster-opacity', opacity);
    }
  }, [opacity]);

  // React to active study area or layer changes: re-render overlay & fly camera
  useEffect(() => {
    renderRadarOverlays();
    renderOpticalOverlays();
    fitAreaBounds(activeArea);

    const radarMap = radarMapRef.current;
    if (radarMap) {
      radarMap.once('moveend', () => {
        renderRadarOverlays();
        renderOpticalOverlays();
      });
    }
  }, [activeArea, activeLayer, fitAreaBounds, renderRadarOverlays, renderOpticalOverlays]);

  // 12-Step Orbital Waltz Camera Choreography on timeline play
  useEffect(() => {
    if (!isTimelinePlaying || timelineIndex === undefined) return;
    const radarMap = radarMapRef.current;
    if (!radarMap || !radarMap.isStyleLoaded()) return;

    const bbox = activeArea.bbox || [
      activeArea.lng - 0.45,
      activeArea.lat - 0.40,
      activeArea.lng + 0.45,
      activeArea.lat + 0.40,
    ];
    const [west, south, east, north] = bbox;
    const centerLng = (west + east) / 2;
    const centerLat = (south + north) / 2;
    const spanLng = east - west;
    const spanLat = north - south;

    // Choreography requirement:
    // Step 0: zoom 10.0, pitch 18, bearing 0
    // Steps 2-7: smoothly zoom into primary change zones (zoom: 10.0 -> 11.4, pitch: 18 -> 42)
    // Steps 8-11: zoom out to swath overview (zoom: 9.9, pitch: 10)
    const CHOREOGRAPHY = [
      { zoom: 10.0, pitch: 18, bearing: 0, dLngFactor: 0, dLatFactor: 0 },         // Step 0: Initial frame lock
      { zoom: 10.2, pitch: 22, bearing: 2, dLngFactor: 0.02, dLatFactor: -0.01 },  // Step 1: Smooth start
      { zoom: 10.5, pitch: 28, bearing: 5, dLngFactor: 0.04, dLatFactor: 0.03 },   // Step 2: Inward glide
      { zoom: 10.8, pitch: 32, bearing: -3, dLngFactor: -0.03, dLatFactor: 0.04 }, // Step 3: Change quadrant focus
      { zoom: 11.1, pitch: 37, bearing: -8, dLngFactor: -0.06, dLatFactor: -0.02 },// Step 4: Approaching primary anomaly
      { zoom: 11.4, pitch: 42, bearing: -5, dLngFactor: -0.04, dLatFactor: -0.05 },// Step 5: Peak close-up on change zone
      { zoom: 11.3, pitch: 40, bearing: 3, dLngFactor: 0.01, dLatFactor: 0.01 },   // Step 6: Sustained inspection
      { zoom: 10.8, pitch: 34, bearing: 6, dLngFactor: 0.05, dLatFactor: 0.04 },   // Step 7: Transition boundary
      { zoom: 10.4, pitch: 24, bearing: 4, dLngFactor: 0.02, dLatFactor: -0.02 },  // Step 8: Pulling back
      { zoom: 10.1, pitch: 18, bearing: -2, dLngFactor: -0.02, dLatFactor: 0.01 }, // Step 9: Expanding field of view
      { zoom: 10.0, pitch: 14, bearing: -1, dLngFactor: -0.01, dLatFactor: 0 },    // Step 10: Wide orbital framing
      { zoom: 9.9, pitch: 10, bearing: 0, dLngFactor: 0, dLatFactor: 0 },          // Step 11: Swath overview
    ];

    const stepIdx = (timelineIndex >= 0 ? timelineIndex : 0) % 12;
    const choreo = CHOREOGRAPHY[stepIdx];
    const targetCenter: [number, number] = [
      centerLng + choreo.dLngFactor * spanLng,
      centerLat + choreo.dLatFactor * spanLat,
    ];

    radarMap.easeTo({
      center: targetCenter,
      zoom: choreo.zoom,
      pitch: choreo.pitch,
      bearing: choreo.bearing,
      duration: 950,
      essential: true,
    });
  }, [isTimelinePlaying, timelineIndex, activeArea]);

  // React to ancillary layer visibility toggles
  useEffect(() => {
    const map = radarMapRef.current;
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

  // Study area pin markers on bottom radar map
  useEffect(() => {
    const map = radarMapRef.current;
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
              ? 'bg-[#0047AB] ring-4 ring-[#0047AB]/30'
              : 'bg-[#121417] border border-[#D0CEC4] group-hover:border-[#0047AB]'
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

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      {/* Bottom Map: Hardware-Accelerated Radar MapLibre Instance (100% width/height) */}
      <div ref={radarContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Map: Hardware-Accelerated Optical MapLibre Instance Stacked with CSS clipPath */}
      <div
        ref={opticalContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          position: 'absolute',
          inset: 0,
          clipPath:
            mode === 'story' && showOpticalSplit
              ? `inset(0 ${100 - curtainPosition}% 0 0)`
              : 'inset(0 100% 0 0)',
          pointerEvents: mode === 'story' && showOpticalSplit ? 'auto' : 'none',
          opacity: mode === 'story' && showOpticalSplit ? 1 : 0,
          transition: 'opacity 180ms ease',
        }}
      />
    </div>
  );
}
