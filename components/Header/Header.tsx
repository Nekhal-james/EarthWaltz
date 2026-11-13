'use client';

import { useState } from 'react';
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
  const [basemapOpen, setBasemapOpen] = useState(false);

  return (
    <header className="h-14 w-full bg-[#090A0F] border-b border-[#222736] flex items-center justify-between px-4 z-40 select-none">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3 min-w-[240px]">
        <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
        <span className="font-semibold text-sm tracking-tight text-[#F1F5F9]">EarthWaltz</span>
        <span className="text-[#222736]">|</span>
        <span className="text-xs text-[#8A94A6]">NISAR L+S Observatory</span>
      </div>

      {/* Center: Horizontal 1-Click Study Area Switcher */}
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

      {/* Right: Mode Controls, Basemap Selector, & Opacity Slider */}
      <div className="flex items-center gap-3">
        {/* Mode Buttons */}
        <div className="flex items-center bg-[#12151E] border border-[#222736] rounded-md p-0.5">
          <button
            onClick={onToggleSlider}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              showSlider
                ? 'bg-[#222736] text-[#F59E0B]'
                : 'text-[#8A94A6] hover:text-[#F1F5F9]'
            }`}
          >
            Split Compare
          </button>
          <button
            onClick={onToggleExplainer}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              showExplainer
                ? 'bg-[#222736] text-[#F59E0B]'
                : 'text-[#8A94A6] hover:text-[#F1F5F9]'
            }`}
          >
            Physics Guide
          </button>
          <button
            onClick={onToggleResources}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              showResources
                ? 'bg-[#222736] text-[#F59E0B]'
                : 'text-[#8A94A6] hover:text-[#F1F5F9]'
            }`}
          >
            Missions & STAC
          </button>
          <button
            onClick={onExportSnapshot}
            className="px-2.5 py-1 text-xs font-medium rounded text-[#8A94A6] hover:text-[#F1F5F9] transition-colors"
            title="Export high-resolution annotated PNG snapshot"
          >
            Export PNG
          </button>
          <button
            onClick={onToggleTour}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              isTourPlaying
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                : 'text-[#8A94A6] hover:text-[#F1F5F9]'
            }`}
          >
            {isTourPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />}
            <span>{isTourPlaying ? `Tour (${tourIndex + 1}/${tourTotal})` : 'Guided Tour'}</span>
          </button>
        </div>

        {/* Basemap Dropdown */}
        <div className="relative">
          <button
            onClick={() => setBasemapOpen((p) => !p)}
            className="flex items-center gap-1.5 bg-[#12151E] border border-[#222736] rounded-md px-2.5 py-1 text-xs text-[#8A94A6] hover:text-[#F1F5F9] transition-colors"
          >
            <span className="text-[#8A94A6]">Base:</span>
            <span className="text-[#F1F5F9] font-medium">{BASEMAPS[basemap]?.label || 'Satellite'}</span>
            <span className="text-[10px] text-[#8A94A6]">▾</span>
          </button>

          {basemapOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-[#090A0F] border border-[#222736] rounded-md shadow-xl py-1 z-50">
              {(Object.keys(BASEMAPS) as BasemapStyle[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    onBasemapChange(key);
                    setBasemapOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    basemap === key
                      ? 'bg-[#12151E] text-[#F59E0B] font-medium'
                      : 'text-[#8A94A6] hover:text-[#F1F5F9] hover:bg-[#12151E]/60'
                  }`}
                >
                  {BASEMAPS[key].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-2 bg-[#12151E] border border-[#222736] rounded-md px-2.5 py-1">
          <span className="text-[11px] text-[#8A94A6]">SAR</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-16 h-1 bg-[#222736] rounded appearance-none cursor-pointer accent-[#F59E0B]"
          />
          <span className="font-mono text-xs text-[#F1F5F9] tabular-nums w-7 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      </div>
    </header>
  );
}
