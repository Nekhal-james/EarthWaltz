'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { useStudyAreas } from '@/hooks/useStudyAreas';
import type { StudyArea } from '@/types';

const GlobeWrapper = dynamic(() => import('@/components/Globe/GlobeWrapper'), { ssr: false });
const Header = dynamic(() => import('@/components/Header/Header'), { ssr: false });
const SplitSlider = dynamic(() => import('@/components/SplitSlider/SplitSlider'), { ssr: false });
const PolarizationToggle = dynamic(() => import('@/components/PolarizationToggle/PolarizationToggle'), { ssr: false });
const TimelinePanel = dynamic(() => import('@/components/TimelinePanel/TimelinePanel'), { ssr: false });
const ColorbarLegend = dynamic(() => import('@/components/ColorbarLegend/ColorbarLegend'), { ssr: false });
const PhysicsExplainer = dynamic(() => import('@/components/PhysicsExplainer/PhysicsExplainer'), { ssr: false });
const SonificationEngine = dynamic(() => import('@/components/SonificationEngine/SonificationEngine'), { ssr: false });
const AncillaryLayers = dynamic(() => import('@/components/AncillaryLayers/AncillaryLayers'), { ssr: false });
const WaltzTour = dynamic(() => import('@/components/WaltzTour/WaltzTour'), { ssr: false });
const TelemetryOverlay = dynamic(() => import('@/components/TelemetryOverlay/TelemetryOverlay'), { ssr: false });
const StudyAreaCard = dynamic(() => import('@/components/StudyAreaCard/StudyAreaCard'), { ssr: false });
const MissionResourcesModal = dynamic(() => import('@/components/MissionResourcesModal/MissionResourcesModal'), { ssr: false });

export default function HomePage() {
  const { areas, activeArea, setActiveArea, loading } = useStudyAreas();
  const [activeLayerKey, setActiveLayerKey] = useState<string>('hh');
  const [showExplainer, setShowExplainer] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [ancillaryVisible, setAncillaryVisible] = useState<string[]>([]);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sarOpacity, setSarOpacity] = useState<number>(0.85);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number; bearing: number; pitch: number } | null>(null);

  const handleAreaChange = useCallback((area: StudyArea) => {
    setActiveArea(area);
    // Auto-select signature layer per study area (Kerala -> HH, Amazon -> HV, Turkey -> InSAR, etc.)
    const signatureLayer = area.default_layer && area.layers[area.default_layer]
      ? area.default_layer
      : Object.keys(area.layers)[0] || 'hh';
    setActiveLayerKey(signatureLayer);
    setFlyTo({ lat: area.lat, lng: area.lng, zoom: area.zoom, bearing: area.bearing, pitch: area.pitch });
  }, [setActiveArea]);

  const activeLayer = activeArea.layers[activeLayerKey] || Object.values(activeArea.layers)[0];

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f59e0b] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#f59e0b] font-[family-name:var(--font-space-grotesk)] text-xl">Loading EarthWaltz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="globe-container">
      <Header
        areas={areas}
        activeArea={activeArea}
        onAreaChange={handleAreaChange}
        onToggleExplainer={() => setShowExplainer((p) => !p)}
        onToggleSlider={() => setShowSlider((p) => !p)}
        onToggleResources={() => setShowResources((p) => !p)}
      />

      <GlobeWrapper
        areas={areas}
        activeArea={activeArea}
        activeLayer={activeLayer}
        flyTo={flyTo}
        onAreaClick={handleAreaChange}
        ancillaryVisible={ancillaryVisible}
        onCursorMove={setCursorCoords}
        opacity={sarOpacity}
        onOpacityChange={setSarOpacity}
      />

      <StudyAreaCard area={activeArea} />

      <PolarizationToggle
        area={activeArea}
        activeKey={activeLayerKey}
        onSelect={setActiveLayerKey}
      />

      {/* Scientific Colorbar Legend docked right above Timeline */}
      <ColorbarLegend activeLayer={activeLayer} />

      <TimelinePanel timeseriesPath={activeArea.timeseries} />

      <TelemetryOverlay
        activeLayer={activeLayer}
        area={activeArea}
        cursorCoords={cursorCoords}
      />

      {showSlider && (
        <SplitSlider
          sarImagePath={activeLayer ? `/data/${activeLayer.image}` : null}
          opticalPath={`/data/${activeArea.optical_cloudy}`}
          onClose={() => setShowSlider(false)}
        />
      )}

      {showExplainer && (
        <PhysicsExplainer
          area={activeArea}
          onClose={() => setShowExplainer(false)}
        />
      )}

      {showResources && (
        <MissionResourcesModal
          activeArea={activeArea}
          onClose={() => setShowResources(false)}
        />
      )}

      <div className="absolute bottom-24 right-4 flex flex-col gap-2 z-20">
        <SonificationEngine timeseriesPath={activeArea.timeseries} />
        <WaltzTour
          areas={areas}
          onFlyTo={(area) => {
            handleAreaChange(area);
          }}
        />
        <AncillaryLayers
          visible={ancillaryVisible}
          onToggle={(layer) =>
            setAncillaryVisible((prev) =>
              prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
            )
          }
        />
      </div>
    </div>
  );
}
