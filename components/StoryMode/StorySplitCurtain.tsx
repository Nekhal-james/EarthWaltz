'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface StorySplitCurtainProps {
  position: number;
  onPositionChange: (pos: number) => void;
}

export default function StorySplitCurtain({
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
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
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
      className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden font-sans"
    >
      {/* Top Left Label: What optical satellites see */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-[#F6F5F0] border border-[#D0CEC4] rounded-md px-3 py-1.5 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#71717A]" />
          <span className="text-xs font-medium text-[#121417]">
            What optical satellites see
          </span>
          <span className="text-[10px] text-[#71717A] font-normal border-l border-[#D0CEC4] pl-2">
            Cloud-obscured view
          </span>
        </div>
      </div>

      {/* Top Right Label: What NISAR radar sees */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-[#F6F5F0] border border-[#D0CEC4] rounded-md px-3 py-1.5 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0047AB]" />
          <span className="text-xs font-medium text-[#121417]">
            What NISAR radar sees
          </span>
          <span className="text-[10px] text-[#0047AB] font-medium border-l border-[#D0CEC4] pl-2">
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
        <div className="w-[2px] h-full bg-[#0047AB]" />

        {/* Central Tactile Cobalt Handle */}
        <div className="absolute w-8 h-8 rounded-full bg-[#0047AB] text-white shadow-md flex items-center justify-center border-2 border-[#F6F5F0] hover:scale-105 active:scale-95 transition-transform">
          <div className="flex items-center gap-0.5 text-[11px] font-bold">
            <span>‹</span>
            <span>›</span>
          </div>
        </div>
      </div>
    </div>
  );
}
