'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTimeSeries } from '@/hooks/useTimeSeries';
import type { LayerInfo, StudyArea, TelemetryData } from '@/types';

interface StoryStatusStripProps {
  activeLayer: LayerInfo | null;
  area: StudyArea;
  cursorCoords: { lat: number; lng: number } | null;
  timeseriesPath?: string | null;
  timelineIndex?: number;
  timelineStep?: number;
  onTimelineChange?: (index: number, dateStr: string) => void;
  onTimelineStepChange?: (step: number) => void;
  isPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function StoryStatusStrip({
  activeLayer,
  area,
  cursorCoords,
  timeseriesPath,
  timelineIndex = 0,
  timelineStep,
  onTimelineChange,
  onTimelineStepChange,
  isPlaying = false,
  onPlayingChange,
}: StoryStatusStripProps) {
  const currentStep = timelineStep !== undefined ? timelineStep : timelineIndex;
  const { data: tsData } = useTimeSeries(timeseriesPath || null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  const dates = useMemo(() => {
    if (tsData?.dates && tsData.dates.length > 0) {
      return tsData.dates;
    }
    return [
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
  }, [tsData]);

  const togglePlay = useCallback(() => {
    onPlayingChange?.(!isPlaying);
  }, [isPlaying, onPlayingChange]);

  const setStep = useCallback(
    (nextIdx: number) => {
      const bounded = (nextIdx + dates.length) % dates.length;
      onTimelineStepChange?.(bounded);
      onTimelineChange?.(bounded, dates[bounded] || '');
    },
    [dates, onTimelineChange, onTimelineStepChange]
  );

  // Load telemetry grid for coordinate value lookup
  useEffect(() => {
    if (!activeLayer) return;
    let cancelled = false;

    fetch(`/data/${activeLayer.telemetry}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TelemetryData | null) => {
        if (!cancelled && data) setTelemetry(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeLayer]);

  // Compute live calibrated value at cursor or default to center/mean
  const currentVal = useMemo(() => {
    const unit = activeLayer?.unit || 'dB';
    if (!telemetry || !telemetry.data || telemetry.data.length === 0) {
      if (unit === 'rad') return { val: 0.85, unit: 'rad' };
      if (unit === 'coherence') return { val: 0.65, unit: 'γ' };
      return { val: -11.5, unit: 'dB' };
    }

    const bbox = telemetry.bbox || area.bbox || [
      area.lng - 0.45,
      area.lat - 0.4,
      area.lng + 0.45,
      area.lat + 0.4,
    ];
    const [west, south, east, north] = bbox;

    const lat = cursorCoords ? cursorCoords.lat : area.lat;
    const lng = cursorCoords ? cursorCoords.lng : area.lng;

    const xPct = (lng - west) / (east - west);
    const yPct = (north - lat) / (north - south);

    if (xPct < 0 || xPct > 1 || yPct < 0 || yPct > 1) {
      return { val: telemetry.min, unit: telemetry.unit };
    }

    const rows = telemetry.data.length;
    const cols = telemetry.data[0].length;
    const r = Math.min(rows - 1, Math.max(0, Math.floor(yPct * rows)));
    const c = Math.min(cols - 1, Math.max(0, Math.floor(xPct * cols)));
    const sampled = telemetry.data[r][c];

    // Modulate with timeline if available
    let modulated = sampled;
    if (tsData && tsData.series) {
      const meanSeries = tsData.series.hh_mean || tsData.series.hv_mean;
      if (meanSeries && meanSeries[currentStep] !== undefined) {
        const offset = meanSeries[currentStep] - meanSeries[0];
        modulated += offset;
      }
    }

    return { val: modulated, unit: telemetry.unit };
  }, [telemetry, area, cursorCoords, activeLayer, tsData, currentStep]);

  // Plain-English physical scattering mechanism description
  const mechanismText = useMemo(() => {
    const val = currentVal.val;
    const unit = activeLayer?.unit || 'dB';
    const isHV =
      (activeLayer?.image || '').toLowerCase().includes('hv') ||
      (activeLayer?.label || '').toLowerCase().includes('hv');

    if (unit === 'rad') {
      return 'Interferometric surface displacement fringe cycle';
    }
    if (unit === 'coherence') {
      if (val >= 0.72) return 'High phase stability on bedrock and urban structures';
      if (val >= 0.35) return 'Moderate coherence on agricultural fields and bare soil';
      return 'Decorrelated surface';
    }

    // HV Channel (Cross-polarized)
    if (isHV) {
      if (val < -18.0) return 'Canopy clear-cut, burn scar, or smooth surface';
      if (val >= -12.0) return 'Cross-polarized volumetric canopy scatter';
      return 'Diffuse volumetric canopy scatter';
    }

    // HH Channel (Co-polarized)
    if (val < -17.5) return 'Specular surface scatter off open water';
    if (val > -7.0) return 'Corner-reflector double bounce in flooded vegetation';
    return 'Diffuse surface backscatter on land and crop fields';
  }, [currentVal, activeLayer]);

  const monthLabel = MONTH_NAMES[currentStep] || 'Jan';
  const currentDate = dates[currentStep] || dates[0];

  return (
    <footer className="absolute bottom-0 left-0 right-0 h-9 bg-[#F6F5F0] border-t border-[#D0CEC4] z-20 px-4 flex items-center justify-between text-xs select-none font-sans text-[#121417]">
      {/* LEFT: LIVE CURSOR COORDINATES, CALIBRATED VALUE, SCATTERING MECHANISM */}
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Live Cursor Latitude and Longitude */}
        <div className="flex items-center gap-1 font-sans tabular-nums text-[11px] text-[#121417]/70 whitespace-nowrap">
          <span>
            {cursorCoords
              ? `${Math.abs(cursorCoords.lat).toFixed(4)}° ${cursorCoords.lat >= 0 ? 'N' : 'S'}, ${Math.abs(cursorCoords.lng).toFixed(4)}° ${cursorCoords.lng >= 0 ? 'E' : 'W'}`
              : `${Math.abs(area.lat).toFixed(4)}° ${area.lat >= 0 ? 'N' : 'S'}, ${Math.abs(area.lng).toFixed(4)}° ${area.lng >= 0 ? 'E' : 'W'}`}
          </span>
        </div>

        <div className="w-[1px] h-3 bg-[#D0CEC4] shrink-0" />

        {/* Calibrated Radar Value */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-display tabular-nums font-bold text-xs text-[#0047AB]">
            {currentVal.val > 0 && activeLayer?.unit !== 'coherence'
              ? `+${currentVal.val.toFixed(2)}`
              : currentVal.val.toFixed(2)}{' '}
            {currentVal.unit}
          </span>
          <span className="font-sans text-[11px] text-[#121417]/60">
            ({activeLayer?.label || 'SAR'})
          </span>
        </div>

        <div className="w-[1px] h-3 bg-[#D0CEC4] shrink-0" />

        {/* Plain-English Scattering Mechanism */}
        <div className="text-[11px] font-sans text-[#121417]/85 truncate max-w-[420px]">
          {mechanismText}
        </div>
      </div>

      {/* RIGHT: 12-STEP TIMELINE SCRUBBER WITH MONTH BADGE & TRACK */}
      <div className="flex items-center gap-2.5 shrink-0 pl-2">
        {/* Playback Controls (No emojis, clean SVG / typography) */}
        <div className="flex items-center gap-1">
          <button
            onClick={togglePlay}
            className="w-5 h-5 rounded flex items-center justify-center bg-[#EAE8E0] hover:bg-[#D0CEC4] text-[#121417] border border-[#D0CEC4] text-[10px] transition-colors"
            title={isPlaying ? 'Pause 12-month cycle' : 'Play 12-month cycle'}
            aria-label={isPlaying ? 'Pause 12-month cycle' : 'Play 12-month cycle'}
          >
            {isPlaying ? (
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setStep(currentStep - 1)}
            className="w-5 h-5 rounded flex items-center justify-center bg-[#EAE8E0] hover:bg-[#D0CEC4] text-[#121417] border border-[#D0CEC4] text-[11px] font-medium transition-colors"
            title="Previous month"
            aria-label="Previous month"
          >
            ‹
          </button>

          <button
            onClick={() => setStep(currentStep + 1)}
            className="w-5 h-5 rounded flex items-center justify-center bg-[#EAE8E0] hover:bg-[#D0CEC4] text-[#121417] border border-[#D0CEC4] text-[11px] font-medium transition-colors"
            title="Next month"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {/* 12-Step Scrubber Track */}
        <div
          className="flex items-center gap-0.5 w-24 h-2 cursor-pointer"
          title={`Step ${currentStep + 1} of 12`}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`flex-1 h-1.5 transition-colors ${
                i === currentStep
                  ? 'bg-[#0047AB]'
                  : i < currentStep
                  ? 'bg-[#0047AB]/35'
                  : 'bg-[#D0CEC4]'
              }`}
              title={`Step ${i + 1}/12 (${MONTH_NAMES[i]} 2025)`}
              aria-label={`Step ${i + 1} of 12`}
            />
          ))}
        </div>

        {/* Step Indicator & Month Badge */}
        <div className="flex items-center gap-1.5 font-sans tabular-nums text-[11px]">
          <span className="text-[#121417]/70 font-medium">
            Step {currentStep + 1}/12
          </span>
          <span
            className="px-1.5 py-0.5 rounded border border-[#0047AB]/25 bg-[#0047AB]/10 text-[#0047AB] font-semibold text-[10px] tabular-nums whitespace-nowrap"
            title={currentDate}
          >
            {monthLabel} 2025
          </span>
        </div>
      </div>
    </footer>
  );
}
