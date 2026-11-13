'use client';

import { useTimeSeries } from '@/hooks/useTimeSeries';

interface TimelinePanelProps {
  timeseriesPath: string;
}

export default function TimelinePanel({ timeseriesPath }: TimelinePanelProps) {
  const { data, loading, currentIndex, setCurrentIndex, playing, togglePlay, speed, cycleSpeed } =
    useTimeSeries(timeseriesPath);

  if (loading) {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#111827]/90 backdrop-blur-md rounded-xl border border-[#1f2937] px-6 py-3">
        <p className="text-xs text-[#9ca3af] animate-pulse">Loading timeline...</p>
      </div>
    );
  }

  if (!data || !data.dates.length) {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#111827]/90 backdrop-blur-md rounded-xl border border-[#1f2937] px-6 py-3">
        <p className="text-xs text-[#6b7280]">No time-series data available</p>
      </div>
    );
  }

  const dates = data.dates;
  const currentDate = dates[currentIndex] || '';
  const progress = dates.length > 1 ? (currentIndex / (dates.length - 1)) * 100 : 0;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[90vw] max-w-2xl bg-[#111827]/90 backdrop-blur-md rounded-xl border border-[#1f2937] px-4 py-3 shadow-2xl">
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-[#f59e0b] hover:bg-[#d97706] flex items-center justify-center transition-colors shadow-lg shadow-[#f59e0b]/20 shrink-0"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg className="w-4 h-4 text-[#0a0e1a]" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[#0a0e1a] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Timeline scrubber */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="relative h-2 bg-[#1f2937] rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentIndex(Math.round(pct * (dates.length - 1)));
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#06b6d4] via-[#d946ef] to-[#eab308] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f9fafb] rounded-full shadow-md border-2 border-[#f59e0b] transition-all duration-200"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#6b7280]">
            <span>{dates[0]}</span>
            <span className="text-[#f59e0b] font-medium">{currentDate}</span>
            <span>{dates[dates.length - 1]}</span>
          </div>
        </div>

        {/* Speed control */}
        <button
          onClick={cycleSpeed}
          className="text-xs font-mono bg-[#1f2937] hover:bg-[#374151] border border-[#374151] rounded-lg px-2.5 py-1.5 text-[#f59e0b] transition-colors shrink-0"
          title="Change speed"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
}
