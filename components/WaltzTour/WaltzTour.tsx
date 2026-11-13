'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { StudyArea } from '@/types';

interface WaltzTourProps {
  areas: StudyArea[];
  onFlyTo: (area: StudyArea) => void;
}

export default function WaltzTour({ areas, onFlyTo }: WaltzTourProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const onFlyToRef = useRef(onFlyTo);
  onFlyToRef.current = onFlyTo;

  // Tour sequence prioritizes Kerala first (hometown), then the others
  const tourAreas = useMemo(() => {
    return [...areas].sort((a, b) => {
      if (a.hometown) return -1;
      if (b.hometown) return 1;
      return 0;
    });
  }, [areas]);

  const currentArea = tourAreas[currentIndex] || tourAreas[0];

  useEffect(() => {
    if (!isPlaying || tourAreas.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % tourAreas.length;
        const nextArea = tourAreas[nextIndex];
        if (nextArea) {
          setTimeout(() => {
            onFlyToRef.current?.(nextArea);
          }, 0);
        }
        return nextIndex;
      });
    }, 8000); // 8-second dwell per stop

    return () => clearInterval(interval);
  }, [isPlaying, tourAreas]);

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
    if (tourAreas[0]) {
      setTimeout(() => {
        onFlyToRef.current?.(tourAreas[0]);
      }, 0);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % tourAreas.length;
    setCurrentIndex(next);
    if (tourAreas[next]) {
      setTimeout(() => {
        onFlyToRef.current?.(tourAreas[next]);
      }, 0);
    }
  };

  const handlePrev = () => {
    const prev = (currentIndex - 1 + tourAreas.length) % tourAreas.length;
    setCurrentIndex(prev);
    if (tourAreas[prev]) {
      setTimeout(() => {
        onFlyToRef.current?.(tourAreas[prev]);
      }, 0);
    }
  };

  if (!isPlaying) {
    return (
      <button
        onClick={handleStart}
        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#f59e0b] hover:from-[#c026d3] hover:to-[#d97706] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#d946ef]/20 transition-all transform hover:scale-105 active:scale-95"
      >
        <span className="text-sm animate-spin" style={{ animationDuration: '6s' }}>🌍</span>
        <span>Auto-Play Waltz Tour</span>
      </button>
    );
  }

  return (
    <div className="bg-[#111827]/95 backdrop-blur-md border border-[#f59e0b]/40 rounded-xl p-3 shadow-2xl w-72 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🎶</span>
          <span className="text-xs font-bold text-[#f59e0b]">Global Waltz Tour</span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          Stop {currentIndex + 1} of {tourAreas.length}
        </span>
      </div>

      <div className="bg-[#0a0e1a]/80 rounded-lg p-2.5 mb-2.5 border border-[#1f2937]">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-xs font-bold text-white truncate">{currentArea?.name}</p>
          {currentArea?.hometown && (
            <span className="text-[9px] bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 rounded px-1 font-semibold">
              Hometown
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#06b6d4] font-medium mb-1.5">{currentArea?.phenomenon}</p>
        <p className="text-[10px] text-gray-300 line-clamp-3 leading-relaxed">
          {currentArea?.narrative}
        </p>
      </div>

      <div className="flex items-center justify-between gap-1">
        <button
          onClick={handlePrev}
          className="px-2 py-1 bg-[#1f2937] hover:bg-[#374151] text-gray-200 text-[11px] rounded transition"
          title="Previous stop"
        >
          ⏮ Prev
        </button>
        <button
          onClick={handleStop}
          className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 text-[11px] rounded font-medium transition"
        >
          ⏹ Exit
        </button>
        <button
          onClick={handleNext}
          className="px-2 py-1 bg-[#1f2937] hover:bg-[#374151] text-gray-200 text-[11px] rounded transition"
          title="Next stop"
        >
          Next ⏭
        </button>
      </div>
    </div>
  );
}
