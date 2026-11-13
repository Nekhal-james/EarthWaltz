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
  const [sarLoaded, setSarLoaded] = useState(false);
  const [optLoaded, setOptLoaded] = useState(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

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

  return (
    <div className="fixed inset-0 z-50 bg-[#090A0F]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-[92vw] max-w-4xl aspect-[4/3] bg-[#090A0F] border border-[#222736] rounded-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="px-4 py-2.5 bg-[#12151E] border-b border-[#222736] flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-[#F1F5F9]">All-Weather Penetration Comparison</span>
            <span className="text-[10px] text-[#8A94A6]">· Drag slider to compare SAR radar penetration vs cloudy optical</span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono text-[#8A94A6] hover:text-[#F1F5F9] px-2 py-0.5 rounded border border-[#222736] hover:bg-[#090A0F] transition-colors"
          >
            Esc / Close
          </button>
        </div>

        {/* Comparison Viewport */}
        <div ref={containerRef} className="relative w-full flex-1 select-none overflow-hidden bg-[#090A0F]">
          {/* Left image: SAR */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            {sarImagePath ? (
              <img
                src={sarImagePath}
                alt="Active SAR Backscatter"
                className="w-full h-full object-cover"
                onLoad={() => setSarLoaded(true)}
              />
            ) : null}
            {!sarLoaded && (
              <div className="w-full h-full flex items-center justify-center bg-[#12151E]">
                <p className="text-[#8A94A6] text-xs font-mono">Loading calibrated SAR raster...</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-[#090A0F]/90 border border-[#222736] px-2.5 py-1 rounded text-xs text-[#F59E0B] font-mono font-medium">
              SAR Backscatter (Penetrates Clouds)
            </div>
          </div>

          {/* Right image: Optical Cloudy */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${position}%)` }}
          >
            <img
              src={opticalPath}
              alt="Cloud-Obscured Optical Satellite"
              className="w-full h-full object-cover"
              onLoad={() => setOptLoaded(true)}
            />
            {!optLoaded && (
              <div className="w-full h-full flex items-center justify-center bg-[#12151E]">
                <p className="text-[#8A94A6] text-xs font-mono">Loading optical imagery...</p>
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-[#090A0F]/90 border border-[#222736] px-2.5 py-1 rounded text-xs text-[#8A94A6] font-mono font-medium">
              True-Color Optical (Cloud Obscured)
            </div>
          </div>

          {/* Divider Handle */}
          <div
            className="split-handle absolute top-0 bottom-0 z-10"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            onPointerDown={handlePointerDown}
          >
            <div className="w-0.5 h-full bg-[#F59E0B]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-[#090A0F] border border-[#F59E0B] rounded-full flex items-center justify-center shadow-lg cursor-ew-resize">
              <svg className="w-3.5 h-3.5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
