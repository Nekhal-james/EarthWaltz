'use client';

import React from 'react';
import type { StudyArea } from '@/types';

interface StoryJournalProps {
  areas: StudyArea[];
  activeArea: StudyArea;
  onSelectArea: (area: StudyArea) => void;
  activeLayerKey: string;
  onSelectLayer: (layerKey: string) => void;
  onFocusCurtain: () => void;
  onSwitchToInstrument: () => void;
  isPlayingSonification: boolean;
  onToggleSonification: () => void;
  isPlayingTimeline?: boolean;
  onToggleTimeline?: () => void;
}

interface ChapterSummary {
  id: string;
  pillLabel: string;
  title: string;
  location: string;
  sensor: string;
  story: string;
  hhKey: string;
  hvKey: string;
  insarKey: string;
}

const CHAPTER_SUMMARIES: Record<string, ChapterSummary> = {
  kerala: {
    id: 'kerala',
    pillLabel: 'Kerala',
    title: 'Monsoon Flood Inundation & Below-Sea-Level Polders',
    location: 'Kuttanad & Vembanad Lake, India',
    sensor: 'NISAR L-Band 24 cm · Dual Polarimetric',
    story:
      'Torrential monsoon clouds completely block optical cameras over Kerala for months on end. NISAR’s 24 cm L-band radar penetrates directly through storm clouds to map rising floodwaters across Kuttanad’s below-sea-level paddy polders. Where standing water meets upright crops, microwave pulses double-bounce into bright amber reflections, pinpointing flooded communities in real time.',
    hhKey: 'hh',
    hvKey: 'hv',
    insarKey: 'insar_phase',
  },
  amazon: {
    id: 'amazon',
    pillLabel: 'Amazon Basin',
    title: 'Hidden Flood Pulses & Deforestation Frontiers',
    location: 'Manaus, Rio Negro & Solimões, Brazil',
    sensor: 'ALOS PALSAR & CONAE SAOCOM-1A · L-Band',
    story:
      'Seasonal flood pulses surge meters of river water across thousands of square kilometers of dense tropical forest. Optical satellites see only an unbroken green canopy that completely conceals the flooded ground below. L-band microwaves pierce the canopy to illuminate submerged tree trunks, revealing critical aquatic habitats while cross-polarization tracks deforestation.',
    hhKey: 'hh',
    hvKey: 'hv',
    insarKey: 'insar_phase',
  },
  himalayas: {
    id: 'himalayas',
    pillLabel: 'Himalayas',
    title: 'Glacial Velocity & High-Mountain Hazards',
    location: 'Khumbu Glacier & Everest Massif, Nepal',
    sensor: 'NISAR L2 GOFF & ALOS PALSAR · L-Band 24 cm',
    story:
      'Persistent blizzards and extreme optical shadows make tracking Himalayan glaciers nearly impossible with ordinary cameras. Radar offset tracking measures the slow downhill crawl of Khumbu Glacier ice with millimeter precision. Phase stability changes alert scientists to melting firn and unstable moraine dams that threaten catastrophic downstream floods.',
    hhKey: 'hh',
    hvKey: 'hv',
    insarKey: 'coherence',
  },
  turkey: {
    id: 'turkey',
    pillLabel: 'Turkey / Anatolia',
    title: 'Coseismic Surface Rupture & Fault Slip',
    location: 'East Anatolian Fault, Kahramanmaraş, Turkey',
    sensor: 'Sentinel-1 C-Band & NISAR L2 GUNW InSAR',
    story:
      'In February 2023, catastrophic earthquakes ruptured the East Anatolian Fault across southern Turkey. Satellite radar interferometry (InSAR) captured repeat passes before and after the quake, generating colorful fringe cycles where each rainbow band represents centimeters of ground shift. This pinpointed the exact surface fault rupture and seismic strain.',
    hhKey: 'hh',
    hvKey: 'hv',
    insarKey: 'insar_phase',
  },
  punjab: {
    id: 'punjab',
    pillLabel: 'Punjab',
    title: 'Soil Moisture Dynamics & Crop Growth Cycles',
    location: 'Indo-Gangetic Plain, Punjab, India',
    sensor: 'NISAR Dual-Frequency L+S Band (24 cm & 9.3 cm)',
    story:
      'Punjab’s agricultural heartland feeds millions through intensive wheat-rice rotations, often obscured by seasonal dust and smog. Liquid water has a dielectric constant 20× higher than dry soil, causing radar backscatter to surge when fields are irrigated. Dual L+S band microwaves simultaneously track soil moisture and crop emergence from sowing to harvest.',
    hhKey: 'hh',
    hvKey: 'hv',
    insarKey: 'insar_phase',
  },
  indonesia: {
    id: 'indonesia',
    pillLabel: 'Sumatra',
    title: 'Peatland Moisture Depletion & Fire Early Warning',
    location: 'Tropical Peat Forests, Sumatra, Indonesia',
    sensor: 'NISAR L-Band 24 cm & RADARSAT C-Band',
    story:
      'Southeast Asian tropical peatlands store centuries of subterranean carbon that becomes an explosive fire hazard when drained. Long L-band radar waves penetrate through smoke and surface vegetation deep into the underground peat bed. When subterranean moisture drops below critical thresholds, radar signals warn forestry teams weeks before fires ignite.',
    hhKey: 'hh',
    hvKey: 'hv',
    insarKey: 'insar_phase',
  },
};

export default function StoryJournal({
  areas,
  activeArea,
  onSelectArea,
  activeLayerKey,
  onSelectLayer,
  onFocusCurtain,
  onSwitchToInstrument,
  isPlayingSonification,
  onToggleSonification,
  isPlayingTimeline = false,
  onToggleTimeline,
}: StoryJournalProps) {
  const current = CHAPTER_SUMMARIES[activeArea.id] || CHAPTER_SUMMARIES.kerala;

  // Resolve active channel mode: 'hh', 'hv', or 'insar'
  const isHH = activeLayerKey.includes('hh') || activeLayerKey === 'default';
  const isHV = activeLayerKey.includes('hv');
  const isInSAR = !isHH && !isHV;

  const handleSelectChannel = (channelType: 'hh' | 'hv' | 'insar') => {
    if (channelType === 'hh') {
      const target = Object.keys(activeArea.layers).find((k) => k.includes('hh')) || 'hh';
      onSelectLayer(target);
    } else if (channelType === 'hv') {
      const target = Object.keys(activeArea.layers).find((k) => k.includes('hv')) || 'hv';
      onSelectLayer(target);
    } else {
      const target =
        Object.keys(activeArea.layers).find((k) => k.includes('phase') || k.includes('coherence') || k.includes('goff')) ||
        current.insarKey;
      onSelectLayer(target);
    }
  };

  return (
    <aside className="w-[420px] h-full flex flex-col bg-[#FFFFFF] border-r border-[#E2E8F0] select-text z-20 overflow-y-auto font-sans shadow-sm">
      {/* 1. TOP HEADER & REGION PICKER (Clean 2x3 Grid) */}
      <div className="p-5 border-b border-[#E2E8F0] shrink-0 bg-[#FFFFFF]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
              NASA · ISRO Observatory
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-full">
            Story Mode
          </span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-[#0F172A] mb-3">
          Dancing with the SARs
        </h1>

        {/* 2x3 Grid of Region Pill Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          {areas.map((area) => {
            const isActive = area.id === activeArea.id;
            const item = CHAPTER_SUMMARIES[area.id] || { pillLabel: area.name.split(',')[0] };
            return (
              <button
                key={area.id}
                onClick={() => onSelectArea(area)}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all text-center truncate ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                    : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                }`}
              >
                {item.pillLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MIDDLE CONTENT: ACTIVE REGION STORY & RADAR CONTROLS */}
      <div className="p-5 flex-1 flex flex-col gap-4 bg-[#FFFFFF]">
        {/* Title & Metadata */}
        <div>
          <div className="text-[11px] font-medium text-[#64748B] mb-1">
            {current.location} · <span className="text-[#2563EB] font-semibold">{current.sensor}</span>
          </div>
          <h2 className="text-base font-bold text-[#0F172A] leading-snug">
            {current.title}
          </h2>
        </div>

        {/* Concise 3-Sentence Plain-English Story Card */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs leading-relaxed text-[#334155]">
          <p>{current.story}</p>
        </div>

        {/* 3-Button Radar Channel Switcher */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#0F172A]">Radar Channel View</span>
            <button
              onClick={onFocusCurtain}
              className="text-[11px] font-medium text-[#2563EB] hover:underline"
            >
              Reset curtain (35%)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleSelectChannel('hh')}
              className={`py-2 px-2 text-xs rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5 border ${
                isHH
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm font-semibold'
                  : 'bg-[#FFFFFF] text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <span>HH Channel</span>
              <span className={`text-[10px] ${isHH ? 'text-white/80' : 'text-[#64748B]'}`}>
                Water & Flood
              </span>
            </button>

            <button
              onClick={() => handleSelectChannel('hv')}
              className={`py-2 px-2 text-xs rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5 border ${
                isHV
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm font-semibold'
                  : 'bg-[#FFFFFF] text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <span>HV Channel</span>
              <span className={`text-[10px] ${isHV ? 'text-white/80' : 'text-[#64748B]'}`}>
                Forest Canopy
              </span>
            </button>

            <button
              onClick={() => handleSelectChannel('insar')}
              className={`py-2 px-2 text-xs rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5 border ${
                isInSAR
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm font-semibold'
                  : 'bg-[#FFFFFF] text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <span>InSAR / Coherence</span>
              <span className={`text-[10px] ${isInSAR ? 'text-white/80' : 'text-[#64748B]'}`}>
                Ground Shift
              </span>
            </button>
          </div>
        </div>

        {/* Inline Color Scale Legend inside Panel */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#0F172A]">
            <span>
              {isHH
                ? 'HH Backscatter Calibrated Scale'
                : isHV
                ? 'HV Biomass Canopy Scale'
                : 'InSAR Interferometric Phase Scale'}
            </span>
            <span className="font-mono text-[10px] text-[#64748B]">
              {isHH ? 'dB (σ°)' : isHV ? 'dB (γ°)' : 'rad / fringe'}
            </span>
          </div>

          {/* Color Gradient Ramp */}
          {isHH && (
            <div
              className="h-2.5 w-full rounded-full border border-black/10"
              style={{
                background: 'linear-gradient(to right, #0F172A 0%, #06B6D4 45%, #F59E0B 80%, #FEF08A 100%)',
              }}
            />
          )}

          {isHV && (
            <div
              className="h-2.5 w-full rounded-full border border-black/10"
              style={{
                background: 'linear-gradient(to right, #0D1B1E 0%, #1B4332 35%, #2D6A4F 65%, #D9ED92 100%)',
              }}
            />
          )}

          {isInSAR && (
            <div
              className="h-2.5 w-full rounded-full border border-black/10"
              style={{
                background:
                  'linear-gradient(to right, #EF4444 0%, #F59E0B 20%, #10B981 40%, #06B6D4 60%, #3B82F6 80%, #A855F7 100%)',
              }}
            />
          )}

          {/* Scale Labels */}
          <div className="flex items-center justify-between text-[10px] text-[#64748B]">
            {isHH ? (
              <>
                <span>-24 dB · Specular Water</span>
                <span>-12 dB · Soil/Plains</span>
                <span>+2 dB · Double-Bounce</span>
              </>
            ) : isHV ? (
              <>
                <span>-24 dB · Cleared / Water</span>
                <span>-16 dB · Sparse Veg</span>
                <span>-9 dB · Dense Canopy</span>
              </>
            ) : (
              <>
                <span>-π (-12 cm)</span>
                <span>0 cm (Stable)</span>
                <span>+π (+12 cm)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: 2-BUTTON ACTION ROW & INSTRUMENT MODE LINK */}
      <div className="p-5 border-t border-[#E2E8F0] shrink-0 bg-[#FFFFFF] flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Action 1: Time-Series Waltz Animation */}
          <button
            onClick={onToggleTimeline}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isPlayingTimeline
                ? 'bg-[#D97706] text-white hover:bg-[#B45309]'
                : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
            }`}
          >
            <span>{isPlayingTimeline ? '⏸ Pause Waltz' : '▶ Play Time-Series Waltz'}</span>
          </button>

          {/* Action 2: Audio Sonification */}
          <button
            onClick={onToggleSonification}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isPlayingSonification
                ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
            }`}
          >
            <span>{isPlayingSonification ? '⏹ Stop Audio' : '🔊 Audio Sonification'}</span>
          </button>
        </div>

        {/* Pro Link to Instrument Workbench */}
        <button
          onClick={onSwitchToInstrument}
          className="w-full py-2 px-3 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#475569] hover:text-[#0F172A] transition-colors flex items-center justify-between"
        >
          <span>Need HDF5 telemetry & STAC search?</span>
          <span className="font-semibold text-[#2563EB]">Instrument Mode →</span>
        </button>
      </div>
    </aside>
  );
}
