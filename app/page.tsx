'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useStudyAreas } from '@/hooks/useStudyAreas';
import { useSonification } from '@/hooks/useSonification';
import { useTimeSeries } from '@/hooks/useTimeSeries';
import type { StudyArea, BasemapStyle, AppMode } from '@/types';

import Header from '@/components/Header/Header';
import StoryJournal from '@/components/StoryMode/StoryJournal';
import StorySplitCurtain from '@/components/StoryMode/StorySplitCurtain';
import StoryStatusStrip from '@/components/StoryMode/StoryStatusStrip';

const GlobeWrapper = dynamic(() => import('@/components/Globe/GlobeWrapper'), { ssr: false });
const InspectorSidebar = dynamic(() => import('@/components/InspectorSidebar/InspectorSidebar'), { ssr: false });
const BottomDock = dynamic(() => import('@/components/BottomDock/BottomDock'), { ssr: false });
const CursorHUD = dynamic(() => import('@/components/CursorHUD/CursorHUD'), { ssr: false });
const SplitSlider = dynamic(() => import('@/components/SplitSlider/SplitSlider'), { ssr: false });
const PhysicsExplainer = dynamic(() => import('@/components/PhysicsExplainer/PhysicsExplainer'), { ssr: false });
const MissionResourcesModal = dynamic(() => import('@/components/MissionResourcesModal/MissionResourcesModal'), { ssr: false });

export default function HomePage() {
  const { areas, activeArea, setActiveArea, loading } = useStudyAreas();

  // Mode: 'story' (Overview) is DEFAULT ON LOAD, 'instrument' is Workbench
  const [mode, setMode] = useState<AppMode>('story');

  // Shared unified state between Overview ('story') and Workbench ('instrument')
  const [activeLayerKey, setActiveLayerKey] = useState<string>('hh');
  const [selectedBand, setSelectedBand] = useState<string>('L-Band');
  const [curtainPosition, setCurtainPosition] = useState<number>(38); // Default 38%
  const [timelineStep, setTimelineStep] = useState<number>(0); // 0 to 11
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);

  // Map viewport states
  const [basemap, setBasemap] = useState<BasemapStyle>('esri-satellite');
  const [sarOpacity, setSarOpacity] = useState<number>(0.85);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [ancillaryVisible, setAncillaryVisible] = useState<string[]>([]);

  // Audio Sonification for Story Mode & Workbench
  const { play: playAudio, stop: stopAudio, isPlaying: isSonifying } = useSonification();
  const { data: timeseriesData } = useTimeSeries(activeArea?.timeseries || null);

  // Dates for 12-step timeline
  const dates = timeseriesData?.dates || [
    '2025-01-15',
    '2025-02-15',
    '2025-03-15',
    '2025-04-15',
    '2025-05-15',
    '2025-06-15',
    '2025-07-15',
    '2025-08-15',
    '2025-09-15',
    '2025-10-15',
    '2025-11-15',
    '2025-12-15',
  ];
  const timelineDate = dates[timelineStep] || dates[0];

  // Single centralized 1100ms interval timer for 12-step timeline playback
  useEffect(() => {
    if (!isTimelinePlaying) return;

    const interval = setInterval(() => {
      setTimelineStep((prev) => (prev + 1) % 12);
    }, 1100);

    return () => clearInterval(interval);
  }, [isTimelinePlaying]);

  const handleTimelineDateChange = useCallback((idx: number, _d?: string) => {
    setTimelineStep(idx);
  }, []);

  const handleTimelineStepChange = useCallback((step: number) => {
    setTimelineStep(step);
  }, []);

  // Snapshot & Modals
  const [captureTrigger, setCaptureTrigger] = useState<number>(0);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const [showSlider, setShowSlider] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  // Trigger snapshot export in Globe via captureTrigger
  const handleExportSnapshot = useCallback(() => {
    setCaptureTrigger((prev) => prev + 1);
  }, []);

  // 1-Click Study Area Switcher: Auto-selects signature phenomenon layer
  const handleAreaChange = useCallback(
    (area: StudyArea) => {
      setActiveArea(area);
      const signatureLayer =
        area.default_layer && area.layers[area.default_layer]
          ? area.default_layer
          : Object.keys(area.layers)[0] || 'hh';
      setActiveLayerKey(signatureLayer);
      setTimelineStep(0);
    },
    [setActiveArea]
  );

  // Guided Tour 8-second interval runner
  useEffect(() => {
    if (!isTourPlaying || areas.length === 0) return;

    const interval = setInterval(() => {
      setTourIndex((prev) => (prev + 1) % areas.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isTourPlaying, areas.length]);

  // Synchronize area selection when tourIndex changes while tour is playing
  useEffect(() => {
    if (!isTourPlaying || areas.length === 0) return;
    const targetArea = areas[tourIndex];
    if (targetArea) {
      handleAreaChange(targetArea);
    }
  }, [tourIndex, isTourPlaying, areas, handleAreaChange]);

  const handleToggleTour = useCallback(() => {
    setIsTourPlaying((prev) => !prev);
    setTourIndex(0);
  }, []);

  const handleSnapshotSuccess = useCallback((filename: string) => {
    setSnapshotToast(filename);
    setTimeout(() => setSnapshotToast(null), 4000);
  }, []);

  // Story Mode Sonification toggle handler
  const handleToggleStorySonification = useCallback(() => {
    if (isSonifying) {
      stopAudio();
    } else {
      const hhSeries = timeseriesData?.series?.hh_mean || [-12, -11, -9, -7, -6, -8, -10, -11, -12];
      const cohSeries = timeseriesData?.series?.coherence_mean || [0.7, 0.7, 0.65, 0.6, 0.55, 0.6, 0.68];
      const dbVal = hhSeries[timelineStep] ?? hhSeries[0];
      const cohVal = cohSeries[timelineStep] ?? cohSeries[0];
      playAudio(dbVal, cohVal);
    }
  }, [isSonifying, stopAudio, playAudio, timeseriesData, timelineStep]);

  const activeLayer =
    activeArea.layers[activeLayerKey] ||
    (activeArea.default_layer && activeArea.layers[activeArea.default_layer]) ||
    Object.values(activeArea.layers)[0];

  return (
    <div
      style={{ backgroundColor: '#F6F5F0', color: '#121417', minHeight: '100vh', width: '100vw' }}
      className="h-screen w-screen flex flex-col bg-[#F6F5F0] text-[#121417] overflow-hidden select-none font-sans"
    >
      {/* GLOBAL COMMAND BAR WITH MODE SWITCHER (48px / h-12) */}
      <Header
        mode={mode}
        onModeChange={setMode}
        areas={areas}
        activeArea={activeArea}
        onAreaChange={handleAreaChange}
        onToggleSlider={() => setShowSlider((p) => !p)}
        showSlider={showSlider}
        onToggleExplainer={() => setShowExplainer((p) => !p)}
        showExplainer={showExplainer}
        onToggleResources={() => setShowResources((p) => !p)}
        showResources={showResources}
        onExportSnapshot={handleExportSnapshot}
        isTourPlaying={isTourPlaying}
        onToggleTour={handleToggleTour}
        tourIndex={tourIndex}
        tourTotal={areas.length}
        basemap={basemap}
        onBasemapChange={setBasemap}
        opacity={sarOpacity}
        onOpacityChange={setSarOpacity}
      />

      {/* DUAL-MODE WORKSPACE (Height matches 48px header: h-[calc(100vh-3rem)]) */}
      <div className="relative flex-1 flex w-full h-[calc(100vh-3rem)] overflow-hidden">
        {/* LEFT COLUMN: STORY JOURNAL (Overview) vs INSPECTOR SIDEBAR (Workbench) */}
        {mode === 'story' ? (
          <StoryJournal
            areas={areas}
            activeArea={activeArea}
            onSelectArea={handleAreaChange}
            activeLayerKey={activeLayerKey}
            onSelectLayer={setActiveLayerKey}
            onFocusCurtain={() => setCurtainPosition(38)}
            onSwitchToInstrument={() => setMode('instrument')}
            isPlayingSonification={isSonifying}
            onToggleSonification={handleToggleStorySonification}
            isPlayingTimeline={isTimelinePlaying}
            onToggleTimeline={() => setIsTimelinePlaying((prev) => !prev)}
            selectedBand={selectedBand}
            onSelectBand={setSelectedBand}
            ancillaryVisible={ancillaryVisible}
            onToggleAncillary={(layerId) =>
              setAncillaryVisible((prev) =>
                prev.includes(layerId) ? prev.filter((l) => l !== layerId) : [...prev, layerId]
              )
            }
          />
        ) : (
          <InspectorSidebar
            area={activeArea}
            activeLayerKey={activeLayerKey}
            onSelectLayer={setActiveLayerKey}
            selectedBand={selectedBand}
            onSelectBand={setSelectedBand}
            ancillaryVisible={ancillaryVisible}
            onToggleAncillary={(layerId) =>
              setAncillaryVisible((prev) =>
                prev.includes(layerId) ? prev.filter((l) => l !== layerId) : [...prev, layerId]
              )
            }
          />
        )}

        {/* RIGHT COLUMN: SHARED MAP VIEWPORT */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* PERSISTENT MAPLIBRE GL JS INSTANCE (0ms reload on mode switch) */}
          <GlobeWrapper
            areas={areas}
            activeArea={activeArea}
            activeLayer={activeLayer}
            onAreaClick={handleAreaChange}
            ancillaryVisible={ancillaryVisible}
            onCursorMove={setCursorCoords}
            basemap={basemap}
            opacity={sarOpacity}
            captureTrigger={captureTrigger}
            onSnapshotExported={handleSnapshotSuccess}
            timelineIndex={timelineStep}
            selectedBand={selectedBand}
            isTimelinePlaying={isTimelinePlaying}
            curtainPosition={curtainPosition}
            mode={mode}
          />

          {/* STORY MODE OVERLAYS: BEFORE/AFTER SPLIT CURTAIN & STATUS STRIP */}
          {mode === 'story' && (
            <>
              <StorySplitCurtain
                position={curtainPosition}
                onPositionChange={setCurtainPosition}
              />

              <StoryStatusStrip
                activeLayer={activeLayer}
                area={activeArea}
                cursorCoords={cursorCoords}
                timeseriesPath={activeArea.timeseries}
                timelineIndex={timelineStep}
                timelineStep={timelineStep}
                onTimelineChange={handleTimelineDateChange}
                onTimelineStepChange={handleTimelineStepChange}
                isPlaying={isTimelinePlaying}
                onPlayingChange={setIsTimelinePlaying}
              />
            </>
          )}

          {/* INSTRUMENT MODE OVERLAYS: CURSOR HUD & BOTTOM DOCK */}
          {mode === 'instrument' && (
            <>
              <CursorHUD
                activeLayer={activeLayer}
                area={activeArea}
                cursorCoords={cursorCoords}
                timelineDate={timelineDate}
                timelineIndex={timelineStep}
              />

              <BottomDock
                activeLayer={activeLayer}
                timeseriesPath={activeArea.timeseries}
                onDateChange={handleTimelineDateChange}
                isPlaying={isTimelinePlaying}
                onPlayingChange={setIsTimelinePlaying}
              />
            </>
          )}

          {/* SNAPSHOT TOAST NOTIFICATION */}
          {snapshotToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#121417] border border-[#0047AB] rounded px-4 py-2 text-xs font-sans tabular-nums text-[#F6F5F0] shadow-2xl z-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0047AB]" />
              <span>Snapshot exported: {snapshotToast}</span>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY MODALS (Available across both modes) */}
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
