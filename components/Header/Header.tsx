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
}

const BASEMAPS: Record<BasemapStyle, { label: string }> = {
  'esri-satellite': { label: 'Esri Satellite' },
  'dark-matter': { label: 'Dark Gray Canvas' },
  'gibs-truecolor': { label: 'NASA VIIRS TrueColor' },
  'positron': { label: 'Light Gray Canvas' },
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
    <header className="h-14 w-full bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between px-4 z-40 select-none shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* LEFT: BRAND IDENTITY */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
        <div className="flex items-baseline gap-2">
          <span className="font-sans font-bold text-base tracking-tight text-[#0F172A]">EarthWaltz</span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-xs font-medium text-[#64748B]">NISAR L+S Observatory</span>
        </div>
      </div>

      {/* CENTER: 6 HORIZONTAL STUDY AREA TABS (In Instrument Mode) */}
      {mode === 'instrument' && (
        <div className="hidden lg:flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-0.5">
          {areas.map((area) => {
            const isActive = area.id === activeArea.id;
            const label = area.id === 'indonesia' ? 'Sumatra' : area.name.split(',')[0].trim();
            return (
              <button
                key={area.id}
                onClick={() => onAreaChange(area)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* RIGHT: TACTILE MODE SWITCHER & WORKBENCH CONTROLS */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* GLOBAL 2-WAY SEGMENTED MODE SWITCHER */}
        <div className="flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-0.5 shadow-inner">
          <button
            onClick={() => onModeChange('story')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'story'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
            <span>Story mode</span>
          </button>

          <button
            onClick={() => onModeChange('instrument')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'instrument'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>Instrument mode</span>
          </button>
        </div>

        {/* WORKBENCH QUICK ACTIONS (In Instrument Mode) */}
        {mode === 'instrument' && (
          <div className="flex items-center gap-2">
            {/* Split Compare Button */}
            <button
              onClick={onToggleSlider}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors border ${
                showSlider
                  ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/40 font-semibold'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              Split compare
            </button>

            {/* Guided Tour Button */}
            <button
              onClick={onToggleTour}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 border ${
                isTourPlaying
                  ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/50 font-semibold'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              {isTourPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />}
              <span>{isTourPlaying ? `Tour (${tourIndex + 1}/${tourTotal})` : 'Guided tour'}</span>
            </button>
          </div>
        )}

        {/* Tools & Export Popover Trigger */}
        <button
          onClick={() => setToolsOpen((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors border ${
            toolsOpen
              ? 'bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1]'
              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
        >
          <span>Tools & export</span>
          <span className="text-[10px] text-[#64748B]">▾</span>
        </button>

        {/* Tools / Export Popover Menu */}
        {toolsOpen && (
          <div className="absolute right-0 top-11 w-72 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-xl p-3 z-50 flex flex-col gap-3 font-sans">
            {/* Basemap Selection */}
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                Basemap layer
              </label>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(BASEMAPS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => onBasemapChange(key as BasemapStyle)}
                    className={`px-2 py-1 text-xs rounded text-left transition-colors border ${
                      basemap === key
                        ? 'bg-[#2563EB] text-white border-[#2563EB] font-medium'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Swath Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B] mb-1">
                <span>SAR swath opacity</span>
                <span className="font-mono text-[#0F172A]">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
            </div>

            <div className="border-t border-[#E2E8F0] pt-2 flex flex-col gap-1.5">
              {/* Export High-Res PNG */}
              <button
                onClick={() => {
                  onExportSnapshot?.();
                  setToolsOpen(false);
                }}
                className="w-full px-2.5 py-1.5 text-xs text-left font-medium rounded bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-between transition-colors"
              >
                <span>Export annotated PNG snapshot</span>
                <span className="text-[10px] font-mono text-[#64748B]">PNG</span>
              </button>

              {/* Radar Physics Explainer */}
              <button
                onClick={() => {
                  onToggleExplainer();
                  setToolsOpen(false);
                }}
                className="w-full px-2.5 py-1.5 text-xs text-left font-medium rounded bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-between transition-colors"
              >
                <span>Radar physics reference</span>
                <span className="text-[10px] font-mono text-[#64748B]">Doc</span>
              </button>

              {/* NASA / ISRO Resources & STAC Search */}
              <button
                onClick={() => {
                  onToggleResources();
                  setToolsOpen(false);
                }}
                className="w-full px-2.5 py-1.5 text-xs text-left font-medium rounded bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-between transition-colors"
              >
                <span>NASA CMR & ASF STAC query</span>
                <span className="text-[10px] font-mono text-[#2563EB] font-semibold">STAC</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
