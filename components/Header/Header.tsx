'use client';

import { useState, useRef, useEffect } from 'react';
import type { StudyArea, BasemapStyle } from '@/types';
import { BASEMAPS } from '@/components/Globe/Globe';

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
  isTourPlaying: boolean;
  onToggleTour: () => void;
  tourIndex?: number;
  tourTotal?: number;
  basemap: BasemapStyle;
  onBasemapChange: (style: BasemapStyle) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

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
  isTourPlaying,
  onToggleTour,
  tourIndex = 0,
  tourTotal = 6,
  basemap,
  onBasemapChange,
  opacity,
  onOpacityChange,
}: HeaderProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 w-full bg-[#090A0F] border-b border-[#222736] flex items-center justify-between px-4 z-40 select-none">
      {/* LEFT: BRAND IDENTITY */}
      <div className="flex items-center gap-3 min-w-[230px]">
        <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
        <span className="font-semibold text-sm tracking-tight text-[#F1F5F9]">EarthWaltz</span>
        <span className="text-[#222736]">|</span>
        <span className="text-xs text-[#8A94A6]">NISAR L+S Observatory</span>
      </div>

      {/* CENTER: 6 HORIZONTAL STUDY AREA TABS */}
      <div className="flex items-center bg-[#12151E] border border-[#222736] rounded-md p-0.5">
        {areas.map((area) => {
          const isActive = area.id === activeArea.id;
          const label = area.id === 'indonesia' ? 'Sumatra' : area.name.split(',')[0].trim();
          return (
            <button
              key={area.id}
              onClick={() => onAreaChange(area)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                isActive
                  ? 'bg-[#222736] text-[#F1F5F9]'
                  : 'text-[#8A94A6] hover:text-[#F1F5F9] hover:bg-[#171B26]'
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
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors border ${
            showSlider
              ? 'bg-[#222736] text-[#F59E0B] border-[#F59E0B]/40'
              : 'bg-[#12151E] border-[#222736] text-[#8A94A6] hover:text-[#F1F5F9]'
          }`}
        >
          Split Compare
        </button>

        {/* Guided Tour Button */}
        <button
          onClick={onToggleTour}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 border ${
            isTourPlaying
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
              : 'bg-[#12151E] border-[#222736] text-[#8A94A6] hover:text-[#F1F5F9]'
          }`}
        >
          {isTourPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />}
          <span>{isTourPlaying ? `Tour (${tourIndex + 1}/${tourTotal})` : 'Guided Tour'}</span>
        </button>

        {/* Tools / Export Popover Trigger */}
        <button
          onClick={() => setToolsOpen((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors border ${
            toolsOpen
              ? 'bg-[#222736] text-[#F1F5F9] border-[#8A94A6]'
              : 'bg-[#12151E] border-[#222736] text-[#8A94A6] hover:text-[#F1F5F9]'
          }`}
        >
          <span>Tools / Export</span>
          <span className="text-[10px] text-[#8A94A6]">▾</span>
        </button>

        {/* Tools / Export Popover Menu */}
        {toolsOpen && (
          <div className="absolute right-0 top-11 w-64 bg-[#090A0F]/98 backdrop-blur-md border border-[#222736] rounded-md shadow-2xl p-3 z-50 flex flex-col gap-3">
            {/* Modal Launchers */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase block mb-1.5">
                Scientific Modals
              </span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    onToggleExplainer();
                    setToolsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center justify-between ${
                    showExplainer
                      ? 'bg-[#12151E] text-[#F59E0B]'
                      : 'text-[#8A94A6] hover:bg-[#12151E] hover:text-[#F1F5F9]'
                  }`}
                >
                  <span>Radar Physics Guide</span>
                  <span className="font-mono text-[10px]">λ/σ°</span>
                </button>
                <button
                  onClick={() => {
                    onToggleResources();
                    setToolsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center justify-between ${
                    showResources
                      ? 'bg-[#12151E] text-[#F59E0B]'
                      : 'text-[#8A94A6] hover:bg-[#12151E] hover:text-[#F1F5F9]'
                  }`}
                >
                  <span>Missions & STAC Search</span>
                  <span className="font-mono text-[10px]">ASF/CMR</span>
                </button>
              </div>
            </div>

            {/* Export Snapshot */}
            <div className="border-t border-[#222736] pt-2">
              <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase block mb-1.5">
                Snapshot Export
              </span>
              <button
                onClick={() => {
                  onExportSnapshot?.();
                  setToolsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs bg-[#12151E] hover:bg-[#171B26] border border-[#222736] rounded text-[#F1F5F9] transition-colors flex items-center justify-between"
              >
                <span>Export High-Res PNG</span>
                <span className="font-mono text-[10px] text-[#F59E0B]">.PNG</span>
              </button>
            </div>

            {/* Basemap Selection */}
            <div className="border-t border-[#222736] pt-2">
              <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase block mb-1.5">
                Basemap
              </span>
              <div className="grid grid-cols-2 gap-1">
                {(Object.keys(BASEMAPS) as BasemapStyle[]).map((key) => {
                  const isSelected = basemap === key;
                  return (
                    <button
                      key={key}
                      onClick={() => onBasemapChange(key)}
                      className={`px-2 py-1 text-xs rounded text-left transition-colors border ${
                        isSelected
                          ? 'bg-[#12151E] border-[#F59E0B]/50 text-[#F59E0B]'
                          : 'bg-[#090A0F] border-[#222736] text-[#8A94A6] hover:text-[#F1F5F9]'
                      }`}
                    >
                      {BASEMAPS[key].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SAR Overlay Opacity Slider */}
            <div className="border-t border-[#222736] pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase">
                  SAR Opacity
                </span>
                <span className="font-mono text-xs text-[#F59E0B] tabular-nums">
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
                className="w-full h-1 bg-[#222736] rounded appearance-none cursor-pointer accent-[#F59E0B]"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
