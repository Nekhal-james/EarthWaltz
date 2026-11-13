'use client';

import { useRef, useEffect, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { StudyArea, LayerInfo, BasemapStyle } from '@/types';

// NASA VIIRS SNPP True-Color full historical composite (zero orbital gaps/zebra stripes)
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
    'carto-labels': {
      type: 'raster',
      tiles: ['https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© CartoDB',
      maxzoom: 20,
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
      id: 'carto-labels-layer',
      type: 'raster',
      source: 'carto-labels',
      minzoom: 0,
      maxzoom: 22,
      paint: { 'raster-opacity': 0.8 },
    },
  ],
};

// Esri World Imagery blended with dark reference labels (crisp, zero orbital gaps)
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
    'carto-labels': {
      type: 'raster',
      tiles: ['https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© CartoDB',
      maxzoom: 20,
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
      id: 'carto-labels-layer',
      type: 'raster',
      source: 'carto-labels',
      minzoom: 0,
      maxzoom: 22,
      paint: { 'raster-opacity': 0.8 },
    },
  ],
};

export const BASEMAPS: Record<BasemapStyle, { style: string | maplibregl.StyleSpecification; label: string }> = {
  'esri-satellite': {
    style: ESRI_SATELLITE_STYLE,
    label: 'Satellite',
  },
  'dark-matter': {
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    label: 'Dark Matter',
  },
  'gibs-truecolor': {
    style: GIBS_TRUECOLOR_STYLE,
    label: 'NASA VIIRS',
  },
  positron: {
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
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
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const isLoadedRef = useRef(false);

  // Critical Zoom & Viewport Alignment: Fit bounds with left inspector sidebar padding
  const fitAreaBounds = useCallback((area: StudyArea, duration = 1400) => {
    const map = mapRef.current;
    if (!map) return;

    const bbox = area.bbox || [
      area.lng - 0.5,
      area.lat - 0.5,
      area.lng + 0.5,
      area.lat + 0.5,
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
      }
    );
  }, []);

  // Render native MapLibre image raster and hairline boundary outline
  const renderSarOverlay = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('sar-overlay-layer')) map.removeLayer('sar-overlay-layer');
    if (map.getSource('sar-overlay')) map.removeSource('sar-overlay');
    if (map.getLayer('sar-bbox-outline')) map.removeLayer('sar-bbox-outline');
    if (map.getSource('sar-bbox')) map.removeSource('sar-bbox');

    if (!activeLayer) return;

    const bbox = activeArea.bbox || [
      activeArea.lng - 0.5,
      activeArea.lat - 0.5,
      activeArea.lng + 0.5,
      activeArea.lat + 0.5,
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

      map.addLayer({
        id: 'sar-overlay-layer',
        type: 'raster',
        source: 'sar-overlay',
        paint: {
          'raster-opacity': opacity,
          'raster-fade-duration': 200,
        },
      });

      // Hairline boundary polygon
      const bboxFeature: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [west, north],
              [east, north],
              [east, south],
              [west, south],
              [west, north],
            ],
          ],
        },
      };

      map.addSource('sar-bbox', {
        type: 'geojson',
        data: bboxFeature,
      });

      map.addLayer({
        id: 'sar-bbox-outline',
        type: 'line',
        source: 'sar-bbox',
        paint: {
          'line-color': '#F59E0B',
          'line-width': 1.5,
          'line-opacity': 0.8,
        },
      });
    } catch (err) {
      console.warn('MapLibre overlay render warning:', err);
    }
  }, [activeArea, activeLayer, opacity]);

  // Export high-resolution annotated snapshot
  const exportSnapshot = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    try {
      const mapCanvas = map.getCanvas();
      const width = mapCanvas.width;
      const height = mapCanvas.height;

      const offscreen = document.createElement('canvas');
      const footerHeight = 64;
      offscreen.width = width;
      offscreen.height = height + footerHeight;

      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      // Draw active map canvas
      ctx.drawImage(mapCanvas, 0, 0);

      // Draw aerospace instrument telemetry footer
      ctx.fillStyle = '#090A0F';
      ctx.fillRect(0, height, width, footerHeight);

      // Hairline accent border
      ctx.fillStyle = '#222736';
      ctx.fillRect(0, height, width, 1);

      // Accent amber marker
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(20, height + 16, 4, 32);

      // Title & region info
      ctx.fillStyle = '#F1F5F9';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`EARTHWALTZ: GLOBAL SAR OBSERVATORY · ${activeArea.name.toUpperCase()}`, 34, height + 28);

      ctx.fillStyle = '#8A94A6';
      ctx.font = '11px monospace';
      const layerText = activeLayer ? `${activeLayer.label} (${activeLayer.unit})` : 'Calibrated SAR Backscatter';
      const granuleText = activeArea.provenance?.granule_id || 'ALAV2A278633410';
      const platformText = activeArea.provenance?.platform || 'NISAR L-Band (24 cm)';
      ctx.fillText(`CHANNEL: ${layerText} | GRANULE: ${granuleText} | SENSOR: ${platformText}`, 34, height + 46);

      // Right-aligned metadata
      ctx.textAlign = 'right';
      ctx.fillStyle = '#F59E0B';
      ctx.font = '11px monospace';
      ctx.fillText(`UTC: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`, width - 20, height + 28);

      ctx.fillStyle = '#8A94A6';
      ctx.fillText('NASA / ISRO SPACE APPS CHALLENGE 2026', width - 20, height + 46);

      // Generate PNG and trigger download
      offscreen.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanName = activeArea.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const filename = `EarthWaltz_${cleanName}_${Date.now()}.png`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onSnapshotExported?.(filename);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating snapshot:', err);
    }
  }, [activeArea, activeLayer, onSnapshotExported]);

  // Trigger snapshot when captureTrigger changes
  useEffect(() => {
    if (captureTrigger > 0) {
      exportSnapshot();
    }
  }, [captureTrigger, exportSnapshot]);

  // Initialize MapLibre Map with preserveDrawingBuffer: true for clean snapshot export
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAPS[basemap].style,
      renderWorldCopies: false,
      preserveDrawingBuffer: true,
      center: [activeArea.lng, activeArea.lat],
      zoom: activeArea.zoom || 9,
      pitch: 0,
      bearing: 0,
      projection: { type: 'globe' },
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      isLoadedRef.current = true;
      renderSarOverlay();
      fitAreaBounds(activeArea, 0);
    });

    map.on('style.load', () => {
      renderSarOverlay();
    });

    map.on('mousemove', (e) => {
      onCursorMove?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    map.on('mouseout', () => {
      onCursorMove?.(null);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      isLoadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update basemap style
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) return;
    map.setStyle(BASEMAPS[basemap].style);
  }, [basemap]);

  // Update SAR raster whenever activeArea, activeLayer, or opacity changes
  useEffect(() => {
    renderSarOverlay();
  }, [renderSarOverlay]);

  // Update dynamic raster opacity directly on the MapLibre layer without rebuilding source
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.getLayer('sar-overlay-layer')) {
      map.setPaintProperty('sar-overlay-layer', 'raster-opacity', opacity);
    }
  }, [opacity]);

  // Fly/Fit camera bounds when active area changes
  useEffect(() => {
    if (isLoadedRef.current) {
      fitAreaBounds(activeArea, 1400);
    }
  }, [activeArea, fitAreaBounds]);

  // Render minimal, clean geographic markers for other study areas
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    areas.forEach((area) => {
      const el = document.createElement('div');
      el.className = 'group cursor-pointer flex items-center justify-center';
      el.style.width = '14px';
      el.style.height = '14px';

      const dot = document.createElement('div');
      const isCurrent = area.id === activeArea.id;
      dot.className = `w-2.5 h-2.5 rounded-full transition-transform ${
        isCurrent
          ? 'bg-[#F59E0B] ring-2 ring-[#F59E0B]/40 scale-125'
          : 'bg-[#8A94A6] hover:bg-[#F1F5F9] hover:scale-110'
      }`;
      el.appendChild(dot);

      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        onAreaClick(area);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([area.lng, area.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [areas, activeArea, onAreaClick]);

  return <div ref={containerRef} className="w-full h-full absolute inset-0" />;
}
