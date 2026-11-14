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
          <div className="bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
            <span className="text-xs font-semibold text-[#0F172A]">
              What optical satellites see
            </span>
            <span className="text-[10px] text-[#64748B] font-medium border-l border-[#E2E8F0] pl-2">
              Cloud-obscured view
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT OF CURTAIN BADGE: WHAT NISAR RADAR SEES */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
          <span className="text-xs font-semibold text-[#0F172A]">
            What NISAR radar sees
          </span>
          <span className="text-[10px] text-[#2563EB] font-semibold border-l border-[#E2E8F0] pl-2">
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
        <div className="w-[2px] h-full bg-[#2563EB] shadow-[0_0_8px_rgba(37,99,235,0.4)]" />

        {/* Central Tactile Cobalt Handle */}
        <div className="absolute w-8 h-8 rounded-full bg-[#2563EB] text-white shadow-lg flex items-center justify-center border-2 border-white hover:scale-110 active:scale-95 transition-transform">
          <div className="flex items-center gap-0.5 text-[11px] font-bold">
            <span>‹</span>
            <span>›</span>
          </div>
        </div>
      </div>
    </div>
  );
}

