'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTimeSeries } from '@/hooks/useTimeSeries';
import type { LayerInfo, StudyArea, TelemetryData } from '@/types';

interface StoryStatusStripProps {
  activeLayer: LayerInfo | null;
  area: StudyArea;
  cursorCoords: { lat: number; lng: number } | null;
  timeseriesPath?: string | null;
  timelineIndex: number;
  onTimelineChange: (index: number, dateStr: string) => void;
  isPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
}

export default function StoryStatusStrip({
  activeLayer,
  area,
  cursorCoords,
  timeseriesPath,
  timelineIndex,
  onTimelineChange,
  isPlaying,
  onPlayingChange,
}: StoryStatusStripProps) {
  const { data: tsData } = useTimeSeries(timeseriesPath || null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [internalPlaying, setInternalPlaying] = useState(false);
  const playing = isPlaying !== undefined ? isPlaying : internalPlaying;

  const togglePlay = useCallback(() => {
    const next = !playing;
    setInternalPlaying(next);
    onPlayingChange?.(next);
  }, [playing, onPlayingChange]);

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

  // Compute live value at cursor or default to center/mean
  const currentVal = useMemo(() => {
    const unit = activeLayer?.unit || 'dB';
    if (!telemetry || !telemetry.data || telemetry.data.length === 0) {
      if (unit === 'rad') return { val: 0.85, unit: 'rad' };
      if (unit === 'coherence') return { val: 0.65, unit: 'γ' };
      return { val: -11.5, unit: 'dB' };
    }

    const bbox = telemetry.bbox || area.bbox || [
      area.lng - 0.45,
      area.lat - 0.40,
      area.lng + 0.45,
      area.lat + 0.40,
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
      if (meanSeries && meanSeries[timelineIndex] !== undefined) {
        const offset = meanSeries[timelineIndex] - meanSeries[0];
        modulated += offset;
      }
    }

    return { val: modulated, unit: telemetry.unit };
  }, [telemetry, area, cursorCoords, activeLayer, tsData, timelineIndex]);

  // Plain-English physical mechanism description
  const mechanismText = useMemo(() => {
    const val = currentVal.val;
    const unit = activeLayer?.unit || 'dB';
    const isHV =
      (activeLayer?.image || '').toLowerCase().includes('hv') ||
      (activeLayer?.label || '').toLowerCase().includes('hv');

    if (unit === 'rad') {
      return 'Interferometric fringe cycle (Centimetric line-of-sight surface displacement)';
    }
    if (unit === 'coherence') {
      if (val >= 0.75) return 'High phase stability (Bedrock / stable urban structures)';
      if (val >= 0.40) return 'Moderate phase stability (Agricultural crops / dry soil)';
      return 'Decorrelated surface (Open water specular surface / dense wind-blown canopy)';
    }

    // Backscatter dB
    if (isHV) {
      if (val < -22.5) return 'Specular mirror reflection (Smooth open water)';
      if (val >= -14.5) return 'Dense canopy volume scattering (Multi-tier tree crown reflection)';
      return 'Low-biomass / agricultural surface scatter (Soil roughness & crop canopy)';
    }

    // HH
    if (val > -8.0) return 'Double-bounce corner reflection (Flooded vegetation / urban structures)';
    if (val > -14.0) return 'Diffuse surface backscatter (Midland plains & agricultural fields)';
    if (val < -18.0) return 'Specular mirror reflection (Smooth open water)';
    return 'Moderate surface return';
  }, [currentVal, activeLayer]);

  // Timeline playback (1100ms per step)
  useEffect(() => {
    if (!playing || !tsData || tsData.dates.length === 0) return;
    const interval = setInterval(() => {
      const nextIdx = (timelineIndex + 1) % tsData.dates.length;
      onTimelineChange(nextIdx, tsData.dates[nextIdx]);
    }, 1100);

    return () => clearInterval(interval);
  }, [playing, tsData, timelineIndex, onTimelineChange]);

  const dates = tsData?.dates || ['2025-01-15'];
  const currentDate = dates[timelineIndex] || dates[0];

  return (
    <footer className="absolute bottom-0 left-0 right-0 h-9 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E2E8F0] z-20 px-4 flex items-center justify-between text-xs select-none shadow-[0_-1px_3px_rgba(0,0,0,0.03)] font-sans">
      {/* LEFT: LIVE CURSOR COORDINATES & PRIMARY READING */}
      <div className="flex items-center gap-4">
        {/* Coordinates */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#64748B]">
          <span className="text-[#0F172A] font-medium">
            {cursorCoords ? cursorCoords.lat.toFixed(4) : area.lat.toFixed(4)}° N,{' '}
            {cursorCoords ? cursorCoords.lng.toFixed(4) : area.lng.toFixed(4)}° E
          </span>
        </div>

        <div className="w-[1px] h-3.5 bg-[#E2E8F0]" />

        {/* Primary Reading */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[#2563EB] font-bold tabular-nums text-xs">
            {currentVal.val > 0 && activeLayer?.unit !== 'coherence' ? `+${currentVal.val.toFixed(2)}` : currentVal.val.toFixed(2)}
          </span>
          <span className="text-[#64748B] text-[10px]">{currentVal.unit}</span>
          <span className="text-[11px] text-[#64748B]">({activeLayer?.label || 'SAR'})</span>
        </div>

        <div className="w-[1px] h-3.5 bg-[#E2E8F0]" />

        {/* Plain English Scattering Mechanism */}
        <div className="text-[11px] text-[#64748B] truncate max-w-[460px]">
          <span className="text-[#0F172A] font-medium">{mechanismText.split('(')[0].trim()}</span>
          {mechanismText.includes('(') && (
            <span className="text-[#64748B] ml-1">({mechanismText.split('(')[1]}</span>
          )}
        </div>
      </div>

      {/* RIGHT: COMPACT TIMELINE SCRUBBER */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={togglePlay}
            className="w-5 h-5 rounded flex items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-[10px] transition-colors"
            title={playing ? 'Pause timeline' : 'Play timeline'}
          >
            {playing ? '⏸' : '▶'}
          </button>

          <button
            onClick={() => {
              const prev = (timelineIndex - 1 + dates.length) % dates.length;
              onTimelineChange(prev, dates[prev]);
            }}
            className="w-5 h-5 rounded flex items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] text-[10px] transition-colors"
            title="Previous step"
          >
            ‹
          </button>

          <button
            onClick={() => {
              const next = (timelineIndex + 1) % dates.length;
              onTimelineChange(next, dates[next]);
            }}
            className="w-5 h-5 rounded flex items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] text-[10px] transition-colors"
            title="Next step"
          >
            ›
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-[#64748B]">
            {timelineIndex + 1}/{dates.length}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] font-semibold text-[10px]">
            {currentDate}
          </span>
        </div>
      </div>
    </footer>
  );
}

