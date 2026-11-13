'use client';

import { useMemo } from 'react';
import type { LayerInfo } from '@/types';
import { useTimeSeries } from '@/hooks/useTimeSeries';

interface BottomDockProps {
  activeLayer: LayerInfo | null;
  timeseriesPath: string;
}

export default function BottomDock({ activeLayer, timeseriesPath }: BottomDockProps) {
  const { data, loading, currentIndex, setCurrentIndex, playing, togglePlay, speed, cycleSpeed } =
    useTimeSeries(timeseriesPath);

  const unit = activeLayer?.unit || 'dB';
  const label = activeLayer?.label || 'SAR Backscatter';

  // Calibrated colorbar gradient and scientific ticks
  const legendConfig = useMemo(() => {
    if (unit === 'rad') {
      return {
        title: label,
        subtitle: '1 fringe cycle (2π) = 12.0 cm ground movement (L-Band λ = 24 cm)',
        gradient:
          'linear-gradient(to right, #ff0000 0%, #ffff00 16.6%, #00ff00 33.3%, #00ffff 50%, #0000ff 66.6%, #ff00ff 83.3%, #ff0000 100%)',
        ticks: ['-π (-12cm)', '-π/2 (-6cm)', '0 (0cm)', '+π/2 (+6cm)', '+π (+12cm)'],
      };
    }

    if (unit === 'm') {
      return {
        title: label,
        subtitle: 'Glacier flow offset displacement along LOS',
        gradient:
          'linear-gradient(to right, #2563eb 0%, #93c5fd 30%, #f8fafc 50%, #fca5a5 70%, #ef4444 100%)',
        ticks: ['-2.0 m', '-1.0 m', '0.0 m', '+1.0 m', '+2.0 m'],
      };
    }

    if (unit === 'coherence') {
      return {
        title: label,
        subtitle: 'Interferometric coherence (0 = decorrelated, 1 = stable phase)',
        gradient:
          'linear-gradient(to right, #090A0F 0%, #1f2937 25%, #4b5563 50%, #9ca3af 75%, #ffffff 100%)',
        ticks: ['0.0 (Decorrelated)', '0.25', '0.50', '0.75', '1.0 (Stable Phase)'],
      };
    }

    // Default: Calibrated Backscatter (dB)
    return {
      title: label,
      subtitle: 'Radar cross section intensity (calibrated σ° / γ°)',
      gradient:
        'linear-gradient(to right, #000004 0%, #1b0c41 20%, #4a0c6b 40%, #781c6d 60%, #a52c60 75%, #cf4446 88%, #ed6925 94%, #fb9b06 97%, #f7d13d 99%, #fcffa4 100%)',
      ticks: ['-24 dB (Specular)', '-18 dB', '-12 dB', '-6 dB', '0 dB (Double-Bounce)'],
    };
  }, [unit, label]);

  const dates = data?.dates || [];
  const currentDate = dates[currentIndex] || '2024-08-16';
  const progress = dates.length > 1 ? (currentIndex / (dates.length - 1)) * 100 : 0;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92vw] max-w-2xl bg-[#090A0F]/95 backdrop-blur-md border border-[#222736] rounded-lg shadow-2xl p-3 flex flex-col gap-2.5 z-20 pointer-events-auto select-none">
      {/* TOP: CALIBRATED COLORBAR LEGEND */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#F1F5F9]">{legendConfig.title}</span>
            <span className="text-[10px] text-[#8A94A6]">· {legendConfig.subtitle}</span>
          </div>
          <span className="font-mono text-[11px] text-[#F59E0B] font-semibold">{unit}</span>
        </div>

        {/* Continuous Color Gradient Bar */}
        <div
          className="h-2 w-full rounded-sm border border-[#222736]"
          style={{ background: legendConfig.gradient }}
        />

        {/* Calibrated Tick Marks */}
        <div className="flex justify-between font-mono text-[10px] text-[#8A94A6] tabular-nums px-0.5">
          {legendConfig.ticks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* 1PX HAIRLINE DIVIDER */}
      <div className="border-t border-[#222736]" />

      {/* BOTTOM: TIMELINE SCRUBBER */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Step Button */}
        <button
          onClick={togglePlay}
          className="w-7 h-7 rounded bg-[#12151E] border border-[#222736] hover:border-[#F59E0B] flex items-center justify-center text-[#F1F5F9] transition-colors shrink-0"
          title={playing ? 'Pause' : 'Play timeseries'}
        >
          {playing ? (
            <svg className="w-3.5 h-3.5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-[#F1F5F9] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Scrubber Track */}
        <div className="flex-1 flex flex-col gap-1">
          <div
            className="relative h-2 bg-[#12151E] border border-[#222736] rounded cursor-pointer group"
            onClick={(e) => {
              if (!dates.length) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentIndex(Math.round(pct * (dates.length - 1)));
            }}
          >
            {/* Progress Fill */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-[#F59E0B]/50 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
            {/* Scrubber Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-3.5 bg-[#F59E0B] rounded-sm -translate-x-1/2 shadow transition-transform group-hover:scale-110"
              style={{ left: `${progress}%` }}
            />
          </div>

          {/* Date Axis Range */}
          {dates.length > 0 && (
            <div className="flex justify-between font-mono text-[9px] text-[#8A94A6] tabular-nums">
              <span>{dates[0]}</span>
              <span>{dates[dates.length - 1]}</span>
            </div>
          )}
        </div>

        {/* Current Acquisition Timestamp */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#12151E] border border-[#222736] rounded px-2 py-1 text-center">
            <span className="font-mono text-xs font-semibold text-[#F59E0B] tabular-nums">
              {currentDate}
            </span>
          </div>

          {/* Speed Toggle */}
          <button
            onClick={cycleSpeed}
            className="font-mono text-[10px] text-[#8A94A6] hover:text-[#F1F5F9] bg-[#12151E] border border-[#222736] rounded px-1.5 py-1 tabular-nums"
            title="Playback speed"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
}
