'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface StorySplitCurtainProps {
  isOpen: boolean;
  onToggle: () => void;
  position: number;
  onPositionChange: (pos: number) => void;
  showClouds?: boolean;
  onToggleClouds?: () => void;
}

export default function StorySplitCurtain({
  isOpen,
  onToggle,
  position,
  onPositionChange,
  showClouds = false,
  onToggleClouds,
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

  // When closed, render a clean activation button on the top-left of the map
  if (!isOpen) {
    return (
      <div className="absolute top-4 left-4 pointer-events-auto z-20 font-sans">
        <button
          onClick={onToggle}
          className="bg-[#F6F5F0] hover:bg-[#EAE8E0] border border-[#D0CEC4] hover:border-[#0047AB] text-[#121417] px-3 py-1.5 rounded-md shadow-md flex items-center gap-2 text-xs font-medium cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          title="Open split panel to compare optical satellite imagery with radar"
        >
          <span className="w-2 h-2 rounded-full bg-[#0047AB] shrink-0" />
          <span className="font-semibold text-[#121417]">Compare with optical satellite view</span>
          <span className="text-[10px] text-[#71717A] border-l border-[#D0CEC4] pl-2 font-normal">
            Split curtain
          </span>
          <svg className="w-3.5 h-3.5 text-[#0047AB] fill-none stroke-current ml-0.5" viewBox="0 0 24 24" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden font-sans"
    >
      {/* Top Left Label, Cloud Toggle & Close Button */}
      <div className="absolute top-4 left-4 pointer-events-auto flex items-center gap-2">
        <div className="bg-[#F6F5F0] border border-[#D0CEC4] rounded-md px-3 py-1.5 shadow-sm flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${showClouds ? 'bg-[#71717A]' : 'bg-[#10B981]'}`} />
          <span className="text-xs font-medium text-[#121417]">
            What optical satellites see
          </span>
          <span className="text-[10px] text-[#71717A] font-normal border-l border-[#D0CEC4] pl-2">
            {showClouds ? 'Cloud-obscured view' : 'Clear satellite view'}
          </span>
        </div>

        {/* Button to toggle cloud simulation on / off */}
        {onToggleClouds && (
          <button
            onClick={onToggleClouds}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md border shadow-sm transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              showClouds
                ? 'bg-[#0047AB] text-white border-[#0047AB] font-semibold hover:bg-[#003882]'
                : 'bg-[#F6F5F0] text-[#121417] border-[#D0CEC4] hover:bg-[#EAE8E0]'
            }`}
            title={showClouds ? 'Turn off cloud view' : 'Turn on cloud-obscured simulation'}
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
            <span>{showClouds ? 'Clouds: ON' : 'Turn on clouds'}</span>
          </button>
        )}

        {/* Button to close optical split comparison */}
        <button
          onClick={onToggle}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#D0CEC4] bg-[#F6F5F0] text-[#121417] hover:bg-[#EAE8E0] hover:text-[#DC2626] shadow-sm transition-all flex items-center gap-1 cursor-pointer select-none"
          title="Close optical satellite split panel"
        >
          <span className="font-bold text-xs leading-none">✕</span>
          <span>Close split</span>
        </button>
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
