'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import { useStudyAreas } from '@/hooks/useStudyAreas';
import type { StudyArea, BasemapStyle } from '@/types';

const GlobeWrapper = dynamic(() => import('@/components/Globe/GlobeWrapper'), { ssr: false });
const Header = dynamic(() => import('@/components/Header/Header'), { ssr: false });
const InspectorSidebar = dynamic(() => import('@/components/InspectorSidebar/InspectorSidebar'), { ssr: false });
const BottomDock = dynamic(() => import('@/components/BottomDock/BottomDock'), { ssr: false });
const CursorHUD = dynamic(() => import('@/components/CursorHUD/CursorHUD'), { ssr: false });
const SplitSlider = dynamic(() => import('@/components/SplitSlider/SplitSlider'), { ssr: false });
const PhysicsExplainer = dynamic(() => import('@/components/PhysicsExplainer/PhysicsExplainer'), { ssr: false });
const MissionResourcesModal = dynamic(() => import('@/components/MissionResourcesModal/MissionResourcesModal'), { ssr: false });

export default function HomePage() {
  const { areas, activeArea, setActiveArea, loading } = useStudyAreas();
  const [activeLayerKey, setActiveLayerKey] = useState<string>('hh');
  const [basemap, setBasemap] = useState<BasemapStyle>('esri-satellite');
  const [sarOpacity, setSarOpacity] = useState<number>(0.85);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [ancillaryVisible, setAncillaryVisible] = useState<string[]>([]);

  // Modals & Tour States
  const [showSlider, setShowSlider] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  // 1-Click Study Area Switcher: Auto-selects phenomenon signature layer
  const handleAreaChange = useCallback(
    (area: StudyArea) => {
      setActiveArea(area);
      const signatureLayer =
        area.default_layer && area.layers[area.default_layer]
          ? area.default_layer
          : Object.keys(area.layers)[0] || 'hh';
      setActiveLayerKey(signatureLayer);
    },
    [setActiveArea]
  );

  // Guided Tour 8-second interval runner
  useEffect(() => {
    if (!isTourPlaying || areas.length === 0) return;

    const interval = setInterval(() => {
      setTourIndex((prev) => {
        const next = (prev + 1) % areas.length;
        handleAreaChange(areas[next]);
        return next;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isTourPlaying, areas, handleAreaChange]);

  const handleToggleTour = useCallback(() => {
    setIsTourPlaying((prev) => {
      const next = !prev;
      if (next && areas.length > 0) {
        setTourIndex(0);
        handleAreaChange(areas[0]);
      }
      return next;
    });
  }, [areas, handleAreaChange]);

  const activeLayer = activeArea.layers[activeLayerKey] || Object.values(activeArea.layers)[0];

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#090A0F]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#222736] border-t-[#F59E0B] rounded-full animate-spin" />
          <p className="font-mono text-xs text-[#8A94A6]">Initializing EarthWaltz Observatory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090A0F] text-[#F1F5F9] overflow-hidden select-none">
      {/* ZONE 1: TOP COMMAND BAR */}
      <Header
        areas={areas}
        activeArea={activeArea}
        onAreaChange={handleAreaChange}
        onToggleSlider={() => setShowSlider((p) => !p)}
        showSlider={showSlider}
        onToggleExplainer={() => setShowExplainer((p) => !p)}
        showExplainer={showExplainer}
        onToggleResources={() => setShowResources((p) => !p)}
        showResources={showResources}
        isTourPlaying={isTourPlaying}
        onToggleTour={handleToggleTour}
        tourIndex={tourIndex}
        tourTotal={areas.length}
        basemap={basemap}
        onBasemapChange={setBasemap}
        opacity={sarOpacity}
        onOpacityChange={setSarOpacity}
      />

      {/* WORKSPACE: DOCKED LEFT INSPECTOR + MAP CANVAS */}
      <div className="relative flex-1 flex w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* ZONE 2: LEFT DOCKED INSPECTOR SIDEBAR */}
        <InspectorSidebar
          area={activeArea}
          activeLayerKey={activeLayerKey}
          onSelectLayer={setActiveLayerKey}
          ancillaryVisible={ancillaryVisible}
          onToggleAncillary={(layerId) =>
            setAncillaryVisible((prev) =>
              prev.includes(layerId) ? prev.filter((l) => l !== layerId) : [...prev, layerId]
            )
          }
        />

        {/* MAP CANVAS VIEWPORT */}
        <div className="relative flex-1 h-full overflow-hidden">
          <GlobeWrapper
            areas={areas}
            activeArea={activeArea}
            activeLayer={activeLayer}
            onAreaClick={handleAreaChange}
            ancillaryVisible={ancillaryVisible}
            onCursorMove={setCursorCoords}
            basemap={basemap}
            opacity={sarOpacity}
          />

          {/* ZONE 4: COMPACT CURSOR HUD (Top-Right of Map) */}
          <CursorHUD
            activeLayer={activeLayer}
            area={activeArea}
            cursorCoords={cursorCoords}
          />

          {/* ZONE 3: BOTTOM HUD DOCK (Colorbar Legend + Timeline Scrubber) */}
          <BottomDock
            activeLayer={activeLayer}
            timeseriesPath={activeArea.timeseries}
          />
        </div>
      </div>

      {/* OVERLAY MODALS */}
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
    </div>
  );
}
