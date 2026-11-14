'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
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

  // Mode: 'story' (Editorial) is DEFAULT ON LOAD, 'instrument' is Advanced Workbench
  const [mode, setMode] = useState<AppMode>('story');

  const [activeLayerKey, setActiveLayerKey] = useState<string>('hh');
  const [basemap, setBasemap] = useState<BasemapStyle>('esri-satellite');
  const [sarOpacity, setSarOpacity] = useState<number>(0.85);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [ancillaryVisible, setAncillaryVisible] = useState<string[]>([]);

  // Story Mode Split Curtain Position (0 to 100%, default 35% so 65% showcases radar swath)
  const [storyCurtainPos, setStoryCurtainPos] = useState<number>(35);

  // Shared Timeline Play state across Story Mode & Instrument Mode
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);

  // Audio Sonification for Story Mode & Workbench
  const { play: playAudio, stop: stopAudio, isPlaying: isSonifying } = useSonification();
  const { data: timeseriesData } = useTimeSeries(activeArea?.timeseries || null);

  // Timeline state synced with BottomDock, StoryStatusStrip, and CursorHUD
  const [timelineDate, setTimelineDate] = useState<string>('2025-01-15');
  const [timelineDateIndex, setTimelineDateIndex] = useState<number>(0);
  const [selectedBand, setSelectedBand] = useState<string>('L-Band');

  const handleTimelineDateChange = useCallback((idx: number, d: string) => {
    setTimelineDateIndex(idx);
    setTimelineDate(d);
  }, []);

  // Snapshot & Modals
  const [captureTrigger, setCaptureTrigger] = useState<number>(0);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const [showSlider, setShowSlider] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  // 1-Click Study Area Switcher: Auto-selects signature phenomenon layer
  const handleAreaChange = useCallback(
    (area: StudyArea) => {
      setActiveArea(area);
      const signatureLayer =
        area.default_layer && area.layers[area.default_layer]
          ? area.default_layer
          : Object.keys(area.layers)[0] || 'hh';
      setActiveLayerKey(signatureLayer);
      setTimelineDateIndex(0);
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
      const dbVal = hhSeries[timelineDateIndex] ?? hhSeries[0];
      const cohVal = cohSeries[timelineDateIndex] ?? cohSeries[0];
      playAudio(dbVal, cohVal);
    }
  }, [isSonifying, stopAudio, playAudio, timeseriesData, timelineDateIndex]);

  const activeLayer =
    activeArea.layers[activeLayerKey] ||
    (activeArea.default_layer && activeArea.layers[activeArea.default_layer]) ||
    Object.values(activeArea.layers)[0];

  return (
    <div
      style={{ backgroundColor: '#FFFFFF', color: '#0F172A', minHeight: '100vh', width: '100vw' }}
      className="h-screen w-screen flex flex-col bg-[#FFFFFF] text-[#0F172A] overflow-hidden select-none font-sans"
    >
      {/* GLOBAL COMMAND BAR WITH MODE SWITCHER */}
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
        onExportSnapshot={() => setCaptureTrigger((prev) => prev + 1)}
        isTourPlaying={isTourPlaying}
        onToggleTour={handleToggleTour}
        tourIndex={tourIndex}
        tourTotal={areas.length}
        basemap={basemap}
        onBasemapChange={setBasemap}
        opacity={sarOpacity}
        onOpacityChange={setSarOpacity}
      />

      {/* DUAL-MODE WORKSPACE (Shared persistent MapLibre Canvas) */}
      <div className="relative flex-1 flex w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* LEFT COLUMN: STORY JOURNAL vs INSTRUMENT SIDEBAR */}
        {mode === 'story' ? (
          <StoryJournal
            areas={areas}
            activeArea={activeArea}
            onSelectArea={handleAreaChange}
            activeLayerKey={activeLayerKey}
            onSelectLayer={setActiveLayerKey}
            onFocusCurtain={() => setStoryCurtainPos(35)}
            onSwitchToInstrument={() => setMode('instrument')}
            isPlayingSonification={isSonifying}
            onToggleSonification={handleToggleStorySonification}
            isPlayingTimeline={isTimelinePlaying}
            onToggleTimeline={() => setIsTimelinePlaying((prev) => !prev)}
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
            timelineIndex={timelineDateIndex}
            selectedBand={selectedBand}
            isTimelinePlaying={isTimelinePlaying}
          />

          {/* STORY MODE OVERLAYS: BEFORE/AFTER SPLIT CURTAIN & STATUS STRIP */}
          {mode === 'story' && (
            <>
              <StorySplitCurtain
                opticalCloudyPath={`/data/${activeArea.optical_cloudy}`}
                position={storyCurtainPos}
                onPositionChange={setStoryCurtainPos}
              />

              <StoryStatusStrip
                activeLayer={activeLayer}
                area={activeArea}
                cursorCoords={cursorCoords}
                timeseriesPath={activeArea.timeseries}
                timelineIndex={timelineDateIndex}
                onTimelineChange={handleTimelineDateChange}
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
                timelineIndex={timelineDateIndex}
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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#141613] border border-[#10B981] rounded-md px-4 py-2 text-xs font-mono text-[#F4F3EF] shadow-2xl z-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
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
