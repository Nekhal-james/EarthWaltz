'use client';

import { useState } from 'react';
import type { StudyArea } from '@/types';

interface HeaderProps {
  areas: StudyArea[];
  activeArea: StudyArea;
  onAreaChange: (area: StudyArea) => void;
  onToggleExplainer: () => void;
  onToggleSlider: () => void;
  onToggleResources?: () => void;
}

export default function Header({
  areas,
  activeArea,
  onAreaChange,
  onToggleExplainer,
  onToggleSlider,
  onToggleResources,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-30 bg-[#111827]/80 backdrop-blur-md border-b border-[#1f2937]">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {/* Radar wave SVG icon */}
          <svg className="w-8 h-8 text-[#f59e0b]" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="3" fill="currentColor" />
            <path d="M16 8a8 8 0 010 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M16 4a12 12 0 010 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" begin="0.3s" repeatCount="indefinite" />
            </path>
            <path d="M16 0a16 16 0 010 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" begin="0.6s" repeatCount="indefinite" />
            </path>
          </svg>
          <div>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#f9fafb] leading-tight">
              Earth<span className="text-[#f59e0b]">Waltz</span>
            </h1>
            <p className="text-[10px] text-[#9ca3af] tracking-wider uppercase">Global SAR Observatory</p>
          </div>
        </div>

        {/* Study Area Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 bg-[#1f2937] hover:bg-[#374151] border border-[#374151] rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            <span className="text-[#f59e0b]">📍</span>
            <span className="text-[#f9fafb] max-w-[200px] truncate">{activeArea.name}</span>
            <svg className={`w-4 h-4 text-[#9ca3af] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-72 bg-[#111827]/95 backdrop-blur-sm border border-[#374151] rounded-lg shadow-2xl overflow-hidden">
              {areas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => {
                    onAreaChange(area);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 transition-colors ${
                    area.id === activeArea.id
                      ? 'bg-[#f59e0b]/10 border-l-2 border-[#f59e0b]'
                      : 'hover:bg-[#1f2937] border-l-2 border-transparent'
                  }`}
                >
                  <span className="text-sm text-[#f9fafb] font-medium flex items-center gap-2">
                    {area.name}
                    {area.hometown && (
                      <span className="text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] px-1.5 py-0.5 rounded-full">HOME</span>
                    )}
                  </span>
                  <span className="text-xs text-[#9ca3af]">{area.subtitle}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onToggleResources && (
            <button
              onClick={onToggleResources}
              className="bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 border border-[#06b6d4]/30 rounded-lg px-3 py-1.5 text-xs text-[#06b6d4] font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              title="NASA Mission Resources & Live STAC Explorer"
            >
              <span>🛰️</span>
              <span>Missions & STAC</span>
            </button>
          )}
          <button
            onClick={onToggleSlider}
            className="bg-[#1f2937] hover:bg-[#374151] border border-[#374151] rounded-lg px-3 py-1.5 text-xs text-[#9ca3af] hover:text-[#f9fafb] transition-colors flex items-center gap-1.5"
            title="Compare SAR vs Optical"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
            Compare
          </button>
          <button
            onClick={onToggleExplainer}
            className="bg-[#1f2937] hover:bg-[#374151] border border-[#374151] rounded-lg px-3 py-1.5 text-xs text-[#9ca3af] hover:text-[#f9fafb] transition-colors flex items-center gap-1.5"
            title="SAR Physics Explainer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Physics
          </button>
        </div>
      </div>
    </header>
  );
}
