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

  // 8-second dwell interval incrementing step index
  useEffect(() => {
    if (!isPlaying || tourAreas.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tourAreas.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPlaying, tourAreas.length]);

  // Safely trigger onFlyTo in a separate effect (never inside a setState callback or render)
  useEffect(() => {
    if (!isPlaying || tourAreas.length === 0) return;
    const targetArea = tourAreas[currentIndex];
    if (targetArea) {
      onFlyToRef.current?.(targetArea);
    }
  }, [currentIndex, isPlaying, tourAreas]);

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
    if (tourAreas[0]) {
      onFlyToRef.current?.(tourAreas[0]);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % tourAreas.length;
    setCurrentIndex(next);
  };

  const handlePrev = () => {
    const prev = (currentIndex - 1 + tourAreas.length) % tourAreas.length;
    setCurrentIndex(prev);
  };

  if (!isPlaying) {
    return (
      <button
        onClick={handleStart}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-[#12151E] hover:bg-[#171B26] border border-[#222736] text-[#F1F5F9] text-xs font-medium rounded transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
        <span>Start Guided Tour</span>
      </button>
    );
  }

  return (
    <div className="bg-[#090A0F]/95 backdrop-blur-md border border-[#222736] rounded p-3 shadow-2xl w-72">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
          <span className="text-xs font-semibold text-[#F1F5F9]">Guided Tour</span>
        </div>
        <span className="text-[10px] font-mono text-[#8A94A6]">
          Stop {currentIndex + 1} of {tourAreas.length}
        </span>
      </div>

      <div className="bg-[#12151E] rounded p-2.5 mb-2.5 border border-[#222736]">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-xs font-semibold text-[#F1F5F9] truncate">{currentArea?.name}</p>
          {currentArea?.hometown && (
            <span className="text-[9px] bg-[#12151E] text-[#F59E0B] border border-[#F59E0B]/40 rounded px-1 font-mono">
              Hometown
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#F59E0B] font-medium mb-1">{currentArea?.phenomenon}</p>
        <p className="text-[10px] text-[#8A94A6] line-clamp-3 leading-relaxed">
          {currentArea?.narrative}
        </p>
      </div>

      <div className="flex items-center justify-between gap-1">
        <button
          onClick={handlePrev}
          className="px-2 py-1 bg-[#12151E] hover:bg-[#171B26] border border-[#222736] text-[#8A94A6] hover:text-[#F1F5F9] text-[11px] rounded transition"
          title="Previous stop"
        >
          Previous
        </button>
        <button
          onClick={handleStop}
          className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-200 text-[11px] rounded font-medium transition"
        >
          Exit Tour
        </button>
        <button
          onClick={handleNext}
          className="px-2 py-1 bg-[#12151E] hover:bg-[#171B26] border border-[#222736] text-[#8A94A6] hover:text-[#F1F5F9] text-[11px] rounded transition"
          title="Next stop"
        >
          Next
        </button>
      </div>
    </div>
  );
}
