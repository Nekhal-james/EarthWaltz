'use client';

import { useState, useRef, useEffect } from 'react';
import type { StudyArea, BasemapStyle, AppMode } from '@/types';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
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
  showOpticalSplit?: boolean;
  onToggleOpticalSplit?: () => void;
  showClouds?: boolean;
  onToggleClouds?: () => void;
}

const BASEMAPS: Record<BasemapStyle, { label: string }> = {
  'esri-satellite': { label: 'Esri satellite' },
  'dark-matter': { label: 'Dark gray canvas' },
  'gibs-truecolor': { label: 'NASA VIIRS truecolor' },
  'positron': { label: 'Light gray canvas' },
};

const REGION_NAMES: Record<string, string> = {
  kerala: 'Kerala',
  amazon: 'Amazon',
  himalayas: 'Himalayas',
  turkey: 'Turkey',
  punjab: 'Punjab',
  indonesia: 'Sumatra',
};

export default function Header({
  mode,
  onModeChange,
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
  showOpticalSplit = false,
  onToggleOpticalSplit,
  showClouds = false,
  onToggleClouds,
}: HeaderProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    <header className="h-12 w-full bg-[#F6F5F0] border-b border-[#D0CEC4] flex items-center justify-between px-4 z-40 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-[#0047AB]" />
        <div className="flex items-baseline gap-2">
          <span className="font-display font-bold text-base tracking-tight text-[#121417]">EarthWaltz</span>
          <span className="text-[#D0CEC4]">/</span>
          <span className="text-xs font-normal text-[#121417]/70">NISAR L+S observatory</span>
        </div>
      </div>

      {/* 6 Region Tabs - Permanently Visible Across BOTH Modes */}
      <div className="hidden md:flex items-center bg-[#EAE8E0] border border-[#D0CEC4] p-0.5">
        {areas.map((area) => {
          const isActive = area.id === activeArea.id;
          const label = REGION_NAMES[area.id] || area.name.split(',')[0].trim();
          return (
            <button
              key={area.id}
              onClick={() => onAreaChange(area)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#0047AB] text-white font-semibold'
                  : 'text-[#121417]/80 hover:text-[#121417] hover:bg-[#D0CEC4]/50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Mode Switch, Snapshot Export, and Options */}
      <div className="flex items-center gap-2.5 relative" ref={dropdownRef}>
        {/* Mode Switch: [ Overview | Workbench ] */}
        <div className="flex items-center bg-[#EAE8E0] border border-[#D0CEC4] p-0.5">
          <button
            onClick={() => onModeChange('story')}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'story'
                ? 'bg-[#0047AB] text-white font-semibold'
                : 'text-[#121417]/75 hover:text-[#121417]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onModeChange('instrument')}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'instrument'
                ? 'bg-[#0047AB] text-white font-semibold'
                : 'text-[#121417]/75 hover:text-[#121417]'
            }`}
          >
            Workbench
          </button>
        </div>

        {/* Snapshot Export Button - Surfaced Directly on Header Bar */}
        <button
          onClick={onExportSnapshot}
          className="px-2.5 py-1 text-xs font-medium border border-[#D0CEC4] bg-[#EAE8E0] text-[#121417] hover:bg-[#D0CEC4]/60 transition-colors"
        >
          Export snapshot
        </button>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/Nekhal-james/EarthWaltz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-[#D0CEC4] bg-[#EAE8E0] text-[#121417] hover:bg-[#D0CEC4]/60 transition-colors"
          title="View source on GitHub"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>GitHub</span>
        </a>

        {/* Optical Satellite Split Panel Activation Toggle */}
        {onToggleOpticalSplit && mode === 'story' && (
          <button
            onClick={onToggleOpticalSplit}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
              showOpticalSplit
                ? 'bg-[#0047AB] text-white border-[#0047AB] font-semibold'
                : 'border-[#D0CEC4] bg-[#EAE8E0] text-[#121417] hover:bg-[#D0CEC4]/60'
            }`}
            title={showOpticalSplit ? 'Exit optical satellite comparison' : 'Compare optical satellite vs radar'}
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M8 7h8m-8 5h8m-8 5h8M4 5v14m16-14v14" />
            </svg>
            <span>{showOpticalSplit ? 'Optical Split: ON' : 'Compare Optical'}</span>
          </button>
        )}

        {/* Cloud View Toggle Button on Top Bar (only displayed when optical split is active) */}
        {onToggleClouds && showOpticalSplit && (
          <button
            onClick={onToggleClouds}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
              showClouds
                ? 'bg-[#0047AB] text-white border-[#0047AB] font-semibold'
                : 'border-[#D0CEC4] bg-[#EAE8E0] text-[#121417] hover:bg-[#D0CEC4]/60'
            }`}
            title={showClouds ? 'Turn off cloud view' : 'Turn on cloud-obscured view'}
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
            <span>{showClouds ? 'Clouds: On' : 'Clouds: Off'}</span>
          </button>
        )}

        {/* Workbench Quick Actions */}
        {mode === 'instrument' && (
          <div className="hidden xl:flex items-center gap-1.5">
            <button
              onClick={onToggleSlider}
              className={`px-2 py-1 text-xs font-medium border transition-colors ${
                showSlider
                  ? 'bg-[#0047AB] text-white border-[#0047AB]'
                  : 'bg-[#EAE8E0] border-[#D0CEC4] text-[#121417] hover:bg-[#D0CEC4]/50'
              }`}
            >
              Split compare
            </button>

            <button
              onClick={onToggleTour}
              className={`px-2 py-1 text-xs font-medium border transition-colors ${
                isTourPlaying
                  ? 'bg-[#0047AB] text-white border-[#0047AB]'
                  : 'bg-[#EAE8E0] border-[#D0CEC4] text-[#121417] hover:bg-[#D0CEC4]/50'
              }`}
            >
              {isTourPlaying ? `Tour (${tourIndex + 1}/${tourTotal})` : 'Guided tour'}
            </button>
          </div>
        )}

        {/* Tools Menu Trigger */}
        <button
          onClick={() => setToolsOpen((p) => !p)}
          className={`px-2 py-1 text-xs font-medium border transition-colors ${
            toolsOpen
              ? 'bg-[#D0CEC4] text-[#121417] border-[#D0CEC4]'
              : 'bg-[#EAE8E0] border-[#D0CEC4] text-[#121417] hover:bg-[#D0CEC4]/50'
          }`}
        >
          Tools
        </button>

        {/* Tools Popover Menu */}
        {toolsOpen && (
          <div className="absolute right-0 top-10 w-72 bg-[#F6F5F0] border border-[#D0CEC4] shadow-md p-3 z-50 flex flex-col gap-3 font-sans">
            {/* Basemap Selection */}
            <div>
              <label className="text-[11px] font-medium text-[#121417]/70 block mb-1">
                Basemap layer
              </label>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(BASEMAPS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => onBasemapChange(key as BasemapStyle)}
                    className={`px-2 py-1 text-xs text-left transition-colors border ${
                      basemap === key
                        ? 'bg-[#0047AB] text-white border-[#0047AB] font-medium'
                        : 'bg-[#EAE8E0] border-[#D0CEC4] text-[#121417] hover:bg-[#D0CEC4]/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Swath Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-[#121417]/70 mb-1">
                <span>SAR swath opacity</span>
                <span className="font-sans tabular-nums text-[#121417]">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#D0CEC4] appearance-none cursor-pointer accent-[#0047AB]"
              />
            </div>

            <div className="border-t border-[#D0CEC4] pt-2 flex flex-col gap-1.5">
              {/* Radar Physics Explainer */}
              <button
                onClick={() => {
                  onToggleExplainer();
                  setToolsOpen(false);
                }}
                className="w-full px-2.5 py-1.5 text-xs text-left font-medium bg-[#EAE8E0] hover:bg-[#D0CEC4]/50 border border-[#D0CEC4] text-[#121417] flex items-center justify-between transition-colors"
              >
                <span>Radar physics reference</span>
                <span className="text-[10px] font-sans text-[#121417]/60">Document</span>
              </button>

              {/* NASA / ISRO Resources & STAC Search */}
              <button
                onClick={() => {
                  onToggleResources();
                  setToolsOpen(false);
                }}
                className="w-full px-2.5 py-1.5 text-xs text-left font-medium bg-[#EAE8E0] hover:bg-[#D0CEC4]/50 border border-[#D0CEC4] text-[#121417] flex items-center justify-between transition-colors"
              >
                <span>NASA CMR and ASF STAC query</span>
                <span className="text-[10px] font-sans text-[#0047AB] font-semibold">STAC</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}