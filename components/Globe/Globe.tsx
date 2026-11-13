'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { StudyArea, LayerInfo, BasemapStyle } from '@/types';

const GIBS_TRUECOLOR_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'gibs-modis': {
      type: 'raster',
      tiles: [
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      ],
      tileSize: 256,
      attribution: '© NASA EOSDIS GIBS',
      maxzoom: 9,
    },
  },
  layers: [
    {
      id: 'gibs-modis-layer',
      type: 'raster',
      source: 'gibs-modis',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

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
  },
  layers: [
    {
      id: 'esri-imagery-layer',
      type: 'raster',
      source: 'esri-world-imagery',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const BASEMAPS: Record<BasemapStyle, { style: string | maplibregl.StyleSpecification; label: string }> = {
  'dark-matter': {
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    label: 'Dark Matter (SAR Focus)',
  },
  'gibs-truecolor': {
    style: GIBS_TRUECOLOR_STYLE,
    label: 'NASA GIBS True-Color',
  },
  'esri-satellite': {
    style: ESRI_SATELLITE_STYLE,
    label: 'High-Res Satellite',
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
  flyTo: { lat: number; lng: number; zoom: number; bearing: number; pitch: number } | null;
  onAreaClick: (area: StudyArea) => void;
  ancillaryVisible: string[];
  onCursorMove?: (coords: { lat: number; lng: number } | null) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
}

export default function Globe({
  areas,
  activeArea,
  activeLayer,
  flyTo,
  onAreaClick,
  ancillaryVisible,
  onCursorMove,
  opacity: parentOpacity,
  onOpacityChange,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [basemap, setBasemap] = useState<BasemapStyle>('dark-matter');
  const [showBasemapPicker, setShowBasemapPicker] = useState(false);
  const [localOpacity, setLocalOpacity] = useState(parentOpacity ?? 0.85);

  const opacity = parentOpacity ?? localOpacity;

  const handleOpacitySlider = (val: number) => {
    setLocalOpacity(val);
    onOpacityChange?.(val);
    if (mapRef.current && mapRef.current.getLayer('sar-overlay-layer')) {
      mapRef.current.setPaintProperty('sar-overlay-layer', 'raster-opacity', val);
    }
  };

  // Helper to attach or refresh SAR image raster and glowing bounding box
  const renderSarOverlay = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Clean up existing overlay layers & sources if present
    if (map.getLayer('sar-overlay-layer')) map.removeLayer('sar-overlay-layer');
    if (map.getSource('sar-overlay')) map.removeSource('sar-overlay');
    if (map.getLayer('sar-bbox-outline')) map.removeLayer('sar-bbox-outline');
    if (map.getLayer('sar-bbox-glow')) map.removeLayer('sar-bbox-glow');
    if (map.getLayer('sar-bbox-fill')) map.removeLayer('sar-bbox-fill');
    if (map.getSource('sar-bbox')) map.removeSource('sar-bbox');

    if (!activeLayer) return;

    // Use exact geographic bounding box from study area metadata
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
          'raster-fade-duration': 250,
        },
      });

      // Bounding box feature
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

      // Subtle fill
      map.addLayer({
        id: 'sar-bbox-fill',
        type: 'fill',
        source: 'sar-bbox',
        paint: {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.05,
        },
      });

      // Outer glow
      map.addLayer({
        id: 'sar-bbox-glow',
        type: 'line',
        source: 'sar-bbox',
        paint: {
          'line-color': '#f59e0b',
          'line-width': 5,
          'line-opacity': 0.35,
          'line-blur': 3,
        },
      });

      // Crisp neon dashed outline
      map.addLayer({
        id: 'sar-bbox-outline',
        type: 'line',
        source: 'sar-bbox',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 2,
          'line-dasharray': [4, 2],
        },
      });
    } catch (err) {
      console.warn('MapLibre overlay render error:', err);
    }
  }, [activeArea, activeLayer, opacity]);

  // Initialize MapLibre Map with 3D Globe projection
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAPS[basemap].style,
      center: [activeArea.lng, activeArea.lat],
      zoom: activeArea.zoom,
      pitch: activeArea.pitch,
      bearing: activeArea.bearing,
      projection: { type: 'globe' },
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      renderSarOverlay();
    });

    map.on('style.load', () => {
      renderSarOverlay();
    });

    map.on('mousemove', (e) => {
      if (onCursorMove) {
        onCursorMove({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });

    map.on('mouseout', () => {
      if (onCursorMove) {
        onCursorMove(null);
      }
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update SAR raster whenever activeArea, activeLayer, or opacity changes
  useEffect(() => {
    renderSarOverlay();
  }, [renderSarOverlay]);

  // Update markers on study area changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    areas.forEach((area) => {
      const el = document.createElement('div');
      el.className = 'pulse-marker';
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = area.hometown ? '#d946ef' : '#f59e0b';
      el.style.position = 'relative';
      el.style.cursor = 'pointer';
      el.style.boxShadow = area.hometown
        ? '0 0 15px rgba(217, 70, 239, 0.8)'
        : '0 0 12px rgba(245, 158, 11, 0.8)';
      el.title = `${area.name} — ${area.phenomenon}`;

      if (area.id === activeArea.id) {
        el.style.width = '22px';
        el.style.height = '22px';
        el.style.border = '3px solid #ffffff';
      }

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

  // Camera Fly-To on selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;

    map.flyTo({
      center: [flyTo.lng, flyTo.lat],
      zoom: flyTo.zoom,
      pitch: flyTo.pitch,
      bearing: flyTo.bearing,
      duration: 2200,
      essential: true,
    });
  }, [flyTo]);

  // Basemap switcher
  const handleBasemapChange = useCallback((style: BasemapStyle) => {
    setBasemap(style);
    setShowBasemapPicker(false);
    if (mapRef.current) {
      mapRef.current.setStyle(BASEMAPS[style].style);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0">
      {/* Basemap Picker & Opacity Slider Toolbar */}
      <div className="absolute top-16 right-3 z-10 flex flex-col items-end gap-2">
        {/* Basemap Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowBasemapPicker((p) => !p)}
            className="flex items-center gap-1.5 bg-[#111827]/90 backdrop-blur-md border border-[#374151] rounded-lg px-2.5 py-1.5 text-xs text-[#9ca3af] hover:text-[#f59e0b] shadow-lg transition-colors"
            title="Switch basemap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="font-mono text-[11px] text-gray-200">{BASEMAPS[basemap].label}</span>
          </button>

          {showBasemapPicker && (
            <div className="absolute right-0 mt-1 bg-[#111827]/95 backdrop-blur-md border border-[#374151] rounded-lg overflow-hidden shadow-2xl z-30 min-w-[130px]">
              {(Object.keys(BASEMAPS) as BasemapStyle[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleBasemapChange(key)}
                  className={`block w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
                    basemap === key
                      ? 'bg-[#f59e0b]/20 text-[#f59e0b] font-bold'
                      : 'text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#f9fafb]'
                  }`}
                >
                  {BASEMAPS[key].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SAR Opacity Slider Pill */}
        <div className="flex items-center gap-2 bg-[#111827]/90 backdrop-blur-md border border-[#374151] rounded-lg px-2.5 py-1.5 shadow-lg">
          <span className="text-[10px] font-mono text-gray-400">SAR Opacity</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => handleOpacitySlider(parseFloat(e.target.value))}
            className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
          />
          <span className="text-[10px] font-mono font-bold text-[#f59e0b] w-7 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
