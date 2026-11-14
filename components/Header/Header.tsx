'use client';

import { useState, useRef, useEffect } from 'react';
import type { StudyArea, BasemapStyle } from '@/types';

interface HeaderProps {
  areas: StudyArea[];
  activeArea: StudyArea;
  onAreaChange: (area: StudyArea) => void;
  onToggleSlider: () => void;
  showSlider: boolean;
  onToggleExplainer: () => void;
  showExplainer: boolean;
  onToggleResources: () => void;
  showResources: boolean;
  onExportSnapshot?: () => void;
  isTourPlaying?: boolean;
  onToggleTour?: () => void;
  tourIndex?: number;
  tourTotal?: number;
  basemap: BasemapStyle;
  onBasemapChange: (basemap: BasemapStyle) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

const BASEMAPS: Record<BasemapStyle, { label: string }> = {
  'esri-satellite': { label: 'Esri Satellite' },
  'dark-matter': { label: 'Dark Gray Canvas' },
  'gibs-truecolor': { label: 'NASA VIIRS TrueColor' },
  'positron': { label: 'Light Gray Canvas' },
};

export default function Header({
  areas,
  activeArea,
  onAreaChange,
  onToggleSlider,
  showSlider,
  onToggleExplainer,
  showExplainer,
  onToggleResources,
  showResources,
  onExportSnapshot,
  isTourPlaying = false,
  onToggleTour,
  tourIndex = 0,
  tourTotal = 6,
  basemap,
  onBasemapChange,
  opacity,
  onOpacityChange,
}: HeaderProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="h-14 w-full bg-[#111210] border-b border-[#242522] flex items-center justify-between px-4 z-40 select-none">
      {/* LEFT: BRAND IDENTITY */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="w-2 h-2 rounded-full bg-[#10B981]" />
        <span className="font-semibold text-sm tracking-tight text-[#F3F2EE]">EarthWaltz</span>
        <span className="text-[#242522]">|</span>
        <span className="text-xs text-[#9A9B94]">NISAR L+S Observatory</span>
      </div>

      {/* CENTER: 6 HORIZONTAL STUDY AREA TABS */}
      <div className="flex items-center bg-[#181916] border border-[#242522] rounded-md p-0.5">
        {areas.map((area) => {
          const isActive = area.id === activeArea.id;
          const label = area.id === 'indonesia' ? 'Sumatra' : area.name.split(',')[0].trim();
          return (
            <button
              key={area.id}
              onClick={() => onAreaChange(area)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-[#242522] text-[#F3F2EE] shadow-sm'
                  : 'text-[#9A9B94] hover:text-[#F3F2EE] hover:bg-[#181916]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* RIGHT: DOCKED CONTROLS & CLEAN TOOLS / EXPORT DROPDOWN */}
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        {/* Split Compare Button */}
        <button
          onClick={onToggleSlider}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors border ${
            showSlider
              ? 'bg-[#242522] text-[#10B981] border-[#10B981]/40'
              : 'bg-[#181916] border-[#242522] text-[#9A9B94] hover:text-[#F3F2EE]'
          }`}
        >
          Split compare
        </button>

        {/* Guided Tour Button */}
        <button
          onClick={onToggleTour}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 border ${
            isTourPlaying
              ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50'
              : 'bg-[#181916] border-[#242522] text-[#9A9B94] hover:text-[#F3F2EE]'
          }`}
        >
          {isTourPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
          <span>{isTourPlaying ? `Tour (${tourIndex + 1}/${tourTotal})` : 'Guided tour'}</span>
        </button>

        {/* Tools / Export Popover Trigger */}
        <button
          onClick={() => setToolsOpen((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors border ${
            toolsOpen
              ? 'bg-[#242522] text-[#F3F2EE] border-[#9A9B94]'
              : 'bg-[#181916] border-[#242522] text-[#9A9B94] hover:text-[#F3F2EE]'
          }`}
        >
          <span>Tools & export</span>
          <span className="text-[10px] text-[#9A9B94]">▾</span>
        </button>

        {/* Tools / Export Popover Menu */}
        {toolsOpen && (
          <div className="absolute right-0 top-11 w-64 bg-[#111210]/98 backdrop-blur-md border border-[#242522] rounded-md shadow-2xl p-3 z-50 flex flex-col gap-3">
            {/* Modal Launchers */}
            <div>
              <span className="text-[11px] font-medium text-[#9A9B94] block mb-1.5">
                Scientific modals
              </span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    onToggleExplainer();
                    setToolsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                    showExplainer
                      ? 'bg-[#181916] text-[#10B981]'
                      : 'text-[#9A9B94] hover:bg-[#181916] hover:text-[#F3F2EE]'
                  }`}
                >
                  <span>Radar physics guide</span>
                  <span className="font-mono text-[10px]">λ/σ°</span>
                </button>
                <button
                  onClick={() => {
                    onToggleResources();
                    setToolsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                    showResources
                      ? 'bg-[#181916] text-[#10B981]'
                      : 'text-[#9A9B94] hover:bg-[#181916] hover:text-[#F3F2EE]'
                  }`}
                >
                  <span>Missions & STAC search</span>
                  <span className="font-mono text-[10px]">ASF/CMR</span>
                </button>
              </div>
            </div>

            {/* Export Snapshot */}
            <div className="border-t border-[#242522] pt-2">
              <span className="text-[11px] font-medium text-[#9A9B94] block mb-1.5">
                Snapshot export
              </span>
              <button
                onClick={() => {
                  onExportSnapshot?.();
                  setToolsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs bg-[#181916] hover:bg-[#242522] border border-[#242522] rounded-md text-[#F3F2EE] transition-colors flex items-center justify-between"
              >
                <span>Export high-res PNG</span>
                <span className="font-mono text-[10px] text-[#10B981]">.PNG</span>
              </button>
            </div>

            {/* Basemap Selection */}
            <div className="border-t border-[#242522] pt-2">
              <span className="text-[11px] font-medium text-[#9A9B94] block mb-1.5">
                Basemap
              </span>
              <div className="grid grid-cols-1 gap-1">
                {(Object.keys(BASEMAPS) as BasemapStyle[]).map((key) => {
                  const isSelected = basemap === key;
                  return (
                    <button
                      key={key}
                      onClick={() => onBasemapChange(key)}
                      className={`px-2 py-1 text-xs rounded-md text-left transition-colors border ${
                        isSelected
                          ? 'bg-[#181916] border-[#10B981]/50 text-[#10B981]'
                          : 'bg-[#111210] border-[#242522] text-[#9A9B94] hover:text-[#F3F2EE]'
                      }`}
                    >
                      {BASEMAPS[key].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SAR Overlay Opacity Slider */}
            <div className="border-t border-[#242522] pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-[#9A9B94]">
                  Radar opacity
                </span>
                <span className="font-mono text-xs text-[#10B981] tabular-nums">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#242522] rounded appearance-none cursor-pointer accent-[#10B981]"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
