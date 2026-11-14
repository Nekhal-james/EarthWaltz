'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTimeSeries } from '@/hooks/useTimeSeries';
import type { LayerInfo } from '@/types';

interface BottomDockProps {
  activeLayer: LayerInfo | null;
  timeseriesPath?: string | null;
  onDateChange?: (index: number, dateStr: string) => void;
}

export default function BottomDock({
  activeLayer,
  timeseriesPath,
  onDateChange,
}: BottomDockProps) {
  const { data } = useTimeSeries(timeseriesPath || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 4x

  const unit = activeLayer?.unit || 'dB';
  const label = activeLayer?.label || 'SAR Backscatter';
  const isHV = useMemo(() => {
    const img = (activeLayer?.image || '').toLowerCase();
    const lbl = (label || '').toLowerCase();
    return img.includes('hv') || lbl.includes('hv');
  }, [activeLayer, label]);

  // Calibrated colorbar gradient and scientific ticks
  const legendConfig = useMemo(() => {
    if (unit === 'rad') {
      return {
        title: 'InSAR Phase',
        subtitle: '1 fringe (2π) = 12 cm',
        gradient:
          'linear-gradient(to right, #ff0000 0%, #ffff00 16.6%, #00ff00 33.3%, #00ffff 50%, #0000ff 66.6%, #ff00ff 83.3%, #ff0000 100%)',
        ticks: ['-π (-12cm)', '0 (0cm)', '+π (+12cm)'],
      };
    }

    if (unit === 'm') {
      return {
        title: 'Glacier GOFF',
        subtitle: 'Displacement',
        gradient:
          'linear-gradient(to right, #2563eb 0%, #93c5fd 35%, #f8fafc 50%, #fca5a5 65%, #ef4444 100%)',
        ticks: ['-2.0 m', '0.0 m', '+2.0 m'],
      };
    }

    if (unit === 'coherence') {
      return {
        title: 'Coherence (γ)',
        subtitle: 'Phase stability',
        gradient:
          'linear-gradient(to right, #111210 0%, #4b5563 50%, #ffffff 100%)',
        ticks: ['0.0 (Decorrelated)', '0.50', '1.0 (Stable)'],
      };
    }

    // HV Distinct Biomass colormap
    if (isHV) {
      return {
        title: 'HV Biomass',
        subtitle: 'Canopy scatter',
        gradient:
          'linear-gradient(to right, #0D1B1E 0%, #1B4332 40%, #2D6A4F 67%, #D9ED92 100%)',
        ticks: ['-24 dB (Specular)', '-18 dB', '-14 dB', '-9 dB (Biomass)'],
      };
    }

    // HH Backscatter colormap: Slate -> Cyan -> Amber -> Gold
    return {
      title: 'HH Backscatter',
      subtitle: 'Surface & structure',
      gradient:
        'linear-gradient(to right, #0F172A 0%, #06B6D4 50%, #F59E0B 83%, #FEF08A 100%)',
      ticks: ['-24 dB (Water)', '-12 dB', '-4 dB', '0 dB (Double-Bounce)'],
    };
  }, [unit, isHV]);

  const dates = data?.dates || [];
  const currentDate = dates[currentIndex] || '2025-01-15';
  const progress = dates.length > 1 ? (currentIndex / (dates.length - 1)) * 100 : 0;

  // Propagate timeline date change to parent
  useEffect(() => {
    if (dates.length > 0) {
      onDateChange?.(currentIndex, currentDate);
    }
  }, [currentIndex, currentDate, dates, onDateChange]);

  // Animation interval loop
  useEffect(() => {
    if (!playing || dates.length === 0) return;
    const intervalMs = 1200 / speed;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dates.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [playing, dates.length, speed]);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const cycleSpeed = () => {
    setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1));
  };

  const handleStepPrev = () => {
    if (!dates.length) return;
    setCurrentIndex((prev) => (prev - 1 + dates.length) % dates.length);
  };

  const handleStepNext = () => {
    if (!dates.length) return;
    setCurrentIndex((prev) => (prev + 1) % dates.length);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[94vw] max-w-4xl h-12 bg-[#111210]/95 backdrop-blur-md border border-[#242522] rounded-md shadow-2xl px-3.5 flex items-center justify-between gap-4 z-20 pointer-events-auto select-none">
      {/* LEFT SECTION: TIMELINE ANIMATION CONTROLS */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Step Prev */}
        <button
          onClick={handleStepPrev}
          className="w-6 h-6 rounded bg-[#181916] border border-[#242522] hover:border-[#10B981] flex items-center justify-center text-[#9A9B94] hover:text-[#F3F2EE] transition-colors"
          title="Previous acquisition date"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className={`w-6 h-6 rounded flex items-center justify-center transition-colors border ${
            playing
              ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]'
              : 'bg-[#181916] text-[#F3F2EE] border-[#242522] hover:border-[#10B981]'
          }`}
          title={playing ? 'Pause timeline animation' : 'Play timeline animation'}
        >
          {playing ? (
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Step Next */}
        <button
          onClick={handleStepNext}
          className="w-6 h-6 rounded bg-[#181916] border border-[#242522] hover:border-[#10B981] flex items-center justify-center text-[#9A9B94] hover:text-[#F3F2EE] transition-colors"
          title="Next acquisition date"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Current Date Badge */}
        <div className="bg-[#181916] border border-[#242522] rounded px-2 py-0.5 flex items-center gap-1.5">
          {playing && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
          <span className="font-mono text-xs font-medium text-[#10B981] tabular-nums">
            {currentDate}
          </span>
        </div>

        {/* Speed Multiplier */}
        <button
          onClick={cycleSpeed}
          className="font-mono text-[10px] text-[#9A9B94] hover:text-[#F3F2EE] bg-[#181916] border border-[#242522] rounded px-1.5 py-0.5 tabular-nums transition-colors"
          title="Playback speed multiplier"
        >
          {speed}x
        </button>
      </div>

      {/* CENTER SECTION: SCRUBBER TRACK */}
      <div className="flex-1 max-w-xs flex flex-col justify-center gap-0.5">
        <div
          className="relative h-1.5 bg-[#181916] border border-[#242522] rounded cursor-pointer group"
          onClick={(e) => {
            if (!dates.length) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setCurrentIndex(Math.round(pct * (dates.length - 1)));
          }}
        >
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#10B981]/50 rounded transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-3 bg-[#10B981] rounded-sm -translate-x-1/2 shadow transition-transform group-hover:scale-125"
            style={{ left: `${progress}%` }}
          />
        </div>
        {dates.length > 0 && (
          <div className="flex justify-between font-mono text-[9px] text-[#9A9B94] tabular-nums">
            <span>{dates[0]}</span>
            <span>Step {currentIndex + 1}/{dates.length}</span>
            <span>{dates[dates.length - 1]}</span>
          </div>
        )}
      </div>

      {/* HAIRLINE VERTICAL DIVIDER */}
      <div className="h-6 w-px bg-[#242522] shrink-0" />

      {/* RIGHT SECTION: SLEEK COMPACT COLORBAR LEGEND */}
      <div className="flex flex-col justify-center gap-0.5 shrink-0 min-w-[210px]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-[#F3F2EE] truncate">{legendConfig.title}</span>
          <span className="font-mono text-[10px] text-[#10B981] font-medium">{unit}</span>
        </div>
        <div
          className="h-1.5 w-full rounded-sm border border-[#242522]"
          style={{ background: legendConfig.gradient }}
        />
        <div className="flex justify-between font-mono text-[8px] text-[#9A9B94] tabular-nums px-0.5">
          {legendConfig.ticks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
