'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface StorySplitCurtainProps {
  opticalCloudyPath: string;
  position: number;
  onPositionChange: (pos: number) => void;
}

export default function StorySplitCurtain({
  opticalCloudyPath,
  position,
  onPositionChange,
}: StorySplitCurtainProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
      onPositionChange(pct);
    },
    [onPositionChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: PointerEvent) => {
      handlePointerMove(e.clientX);
    };

    const onUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDragging, handlePointerMove]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden"
    >
      {/* LEFT OF CURTAIN: OPTICAL SATELLITE CLOUD DECK OVERLAY */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {/* Realistic multi-layer monsoon / smoke cloud deck */}
        <div className="absolute inset-0 bg-[#0D0E0C]/40 backdrop-blur-[2px]" />
        
        {/* Semi-transparent cloudy optical swath composite */}
        <div className="absolute inset-0 flex items-center justify-center opacity-70 mix-blend-screen pointer-events-none">
          <img
            src={opticalCloudyPath}
            alt="Optical Cloud Cover"
            className="w-full h-full object-cover filter contrast-125 brightness-110"
          />
        </div>

        {/* Cloud texture gradient simulation for realistic atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 30% 40%, rgba(240, 243, 246, 0.7) 0%, rgba(180, 190, 200, 0.45) 50%, rgba(90, 105, 120, 0.3) 100%)',
          }}
        />

        {/* Left Badge: What Optical Satellites See */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <div className="bg-[#0D0E0C]/90 backdrop-blur-md border border-[#232520] rounded-md px-3 py-1.5 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9A9B94]" />
            <span className="text-xs font-medium text-[#F4F3EF]">
              What optical satellites see
            </span>
            <span className="text-[10px] text-[#9A9B94] font-mono border-l border-[#232520] pl-2">
              Cloud-obscured monsoon / smoke view
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT OF CURTAIN BADGE: WHAT NISAR RADAR SEES */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-[#0D0E0C]/90 backdrop-blur-md border border-[#232520] rounded-md px-3 py-1.5 shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E54D2E]" />
          <span className="text-xs font-medium text-[#F4F3EF]">
            What NISAR radar sees
          </span>
          <span className="text-[10px] text-[#E54D2E] font-mono border-l border-[#232520] pl-2">
            Penetrates clouds & canopy (24 cm L-band)
          </span>
        </div>
      </div>

      {/* DRAGGABLE CURTAIN DIVIDER LINE & HANDLE */}
      <div
        className="absolute top-0 bottom-0 pointer-events-auto cursor-ew-resize flex items-center justify-center -translate-x-1/2 z-30"
        style={{ left: `${position}%`, width: '36px' }}
        onPointerDown={handlePointerDown}
      >
        {/* Vertical Rule Line */}
        <div className="w-[2px] h-full bg-[#E54D2E] shadow-[0_0_8px_rgba(229,77,46,0.6)]" />

        {/* Central Tactile Vermilion Handle */}
        <div className="absolute w-8 h-8 rounded-full bg-[#E54D2E] text-white shadow-lg flex items-center justify-center border-2 border-[#0D0E0C] hover:scale-110 active:scale-95 transition-transform">
          <div className="flex items-center gap-0.5 text-[11px] font-bold">
            <span>‹</span>
            <span>›</span>
          </div>
        </div>
      </div>
    </div>
  );
}

