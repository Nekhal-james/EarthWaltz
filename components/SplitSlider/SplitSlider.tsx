'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface SplitSliderProps {
  sarImagePath: string | null;
  opticalPath: string;
  onClose: () => void;
}

export default function SplitSlider({ sarImagePath, opticalPath, onClose }: SplitSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [allWeather, setAllWeather] = useState(true);
  const [sarLoaded, setSarLoaded] = useState(false);
  const [optLoaded, setOptLoaded] = useState(false);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(pct);
    },
    []
  );

  const handlePointerDown = useCallback(() => setDragging(true), []);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => handleMove(e.clientX);
    const onUp = () => setDragging(false);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, handleMove]);

  const leftLabel = allWeather ? 'SAR (All-Weather)' : 'Date 1';
  const rightLabel = allWeather ? 'Optical (Cloudy)' : 'Date 2';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="relative w-[90vw] max-w-4xl aspect-square bg-[#111827] rounded-xl overflow-hidden border border-[#374151] shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-[#111827]/90 rounded-full flex items-center justify-center text-[#9ca3af] hover:text-[#f9fafb] border border-[#374151] transition-colors"
        >
          ✕
        </button>

        {/* All-Weather toggle */}
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={() => setAllWeather((p) => !p)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              allWeather
                ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30'
                : 'bg-[#1f2937] text-[#9ca3af] border-[#374151]'
            }`}
          >
            🛰️ All-Weather Mode {allWeather ? 'ON' : 'OFF'}
          </button>
        </div>

        <div ref={containerRef} className="relative w-full h-full select-none">
          {/* Left image (SAR) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            {sarImagePath ? (
              <img
                src={sarImagePath}
                alt="SAR"
                className="w-full h-full object-cover"
                onLoad={() => setSarLoaded(true)}
                onError={() => setSarLoaded(false)}
              />
            ) : null}
            {!sarLoaded && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#06b6d4]/20 to-[#d946ef]/20">
                <p className="text-[#9ca3af] text-sm">SAR data loading...</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-[#111827]/80 px-3 py-1 rounded text-xs text-[#06b6d4] font-medium">
              {leftLabel}
            </div>
          </div>

          {/* Right image (Optical) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${position}%)` }}
          >
            <img
              src={opticalPath}
              alt="Optical"
              className="w-full h-full object-cover"
              onLoad={() => setOptLoaded(true)}
              onError={() => setOptLoaded(false)}
            />
            {!optLoaded && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#374151]/50 to-[#1f2937]/50">
                <p className="text-[#9ca3af] text-sm">Optical data loading...</p>
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-[#111827]/80 px-3 py-1 rounded text-xs text-[#d946ef] font-medium">
              {rightLabel}
            </div>
          </div>

          {/* Divider handle */}
          <div
            className="split-handle absolute top-0 bottom-0 z-10"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            onPointerDown={handlePointerDown}
          >
            <div className="w-0.5 h-full bg-[#f59e0b]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#f59e0b] rounded-full flex items-center justify-center shadow-lg shadow-[#f59e0b]/30">
              <svg className="w-5 h-5 text-[#0a0e1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
