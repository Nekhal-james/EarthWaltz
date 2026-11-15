'use client';

import React from 'react';
import type { StudyArea } from '@/types';

interface StoryJournalProps {
  areas: StudyArea[];
  activeArea: StudyArea;
  onSelectArea: (area: StudyArea) => void;
  activeLayerKey: string;
  onSelectLayer: (layerKey: string) => void;
  onFocusCurtain?: () => void;
  onSwitchToInstrument?: () => void;
  isPlayingSonification: boolean;
  onToggleSonification: () => void;
  isPlayingTimeline?: boolean;
  onToggleTimeline?: () => void;
  selectedBand?: string;
  onSelectBand?: (band: string) => void;
  ancillaryVisible?: string[];
  onToggleAncillary?: (layerId: string) => void;
}

interface ChapterSummary {
  id: string;
  title: string;
  location: string;
  sensor: string;
  story: string;
}

const CHAPTER_SUMMARIES: Record<string, ChapterSummary> = {
  kerala: {
    id: 'kerala',
    title: 'Monsoon flood inundation and below-sea-level polders',
    location: 'Kuttanad and Vembanad Lake, India',
    sensor: 'NISAR L-band 24 cm, dual polarimetric',
    story:
      'Torrential monsoon clouds completely block optical cameras over Kerala for months on end. NISAR’s 24 cm L-band radar penetrates directly through storm clouds to map rising floodwaters across Kuttanad’s below-sea-level paddy polders. Where standing water meets upright crops, microwave pulses double-bounce into bright amber reflections, pinpointing flooded communities in real time.',
  },
  amazon: {
    id: 'amazon',
    title: 'Hidden flood pulses and deforestation frontiers',
    location: 'Manaus, Rio Negro and Solimões, Brazil',
    sensor: 'ALOS PALSAR and CONAE SAOCOM-1A, L-band',
    story:
      'Seasonal flood pulses surge meters of river water across thousands of square kilometers of dense tropical forest. Optical satellites see only an unbroken green canopy that completely conceals the flooded ground below. L-band microwaves pierce the canopy to illuminate submerged tree trunks, revealing critical aquatic habitats while cross-polarization tracks deforestation.',
  },
  himalayas: {
    id: 'himalayas',
    title: 'Glacial velocity and high-mountain hazards',
    location: 'Khumbu Glacier and Everest Massif, Nepal',
    sensor: 'NISAR L2 GOFF and ALOS PALSAR, L-band 24 cm',
    story:
      'Persistent blizzards and extreme optical shadows make tracking Himalayan glaciers nearly impossible with ordinary cameras. Radar offset tracking measures the slow downhill crawl of Khumbu Glacier ice with millimeter precision. Phase stability changes alert scientists to melting firn and unstable moraine dams that threaten catastrophic downstream floods.',
  },
  turkey: {
    id: 'turkey',
    title: 'Coseismic surface rupture and fault slip',
    location: 'East Anatolian Fault, Kahramanmaraş, Turkey',
    sensor: 'Sentinel-1 C-band and NISAR L2 GUNW InSAR',
    story:
      'In February 2023, catastrophic earthquakes ruptured the East Anatolian Fault across southern Turkey. Satellite radar interferometry (InSAR) captured repeat passes before and after the quake, generating colorful fringe cycles where each rainbow band represents centimeters of ground shift. This pinpointed the exact surface fault rupture and seismic strain.',
  },
  punjab: {
    id: 'punjab',
    title: 'Soil moisture dynamics and crop growth cycles',
    location: 'Indo-Gangetic Plain, Punjab, India',
    sensor: 'NISAR dual-frequency L and S band (24 cm and 9.3 cm)',
    story:
      'Punjab’s agricultural heartland feeds millions through intensive wheat-rice rotations, often obscured by seasonal dust and smog. Liquid water has a dielectric constant 20× higher than dry soil, causing radar backscatter to surge when fields are irrigated. Dual L and S band microwaves simultaneously track soil moisture and crop emergence from sowing to harvest.',
  },
  indonesia: {
    id: 'indonesia',
    title: 'Peatland moisture depletion and fire early warning',
    location: 'Tropical peat forests, Sumatra, Indonesia',
    sensor: 'NISAR L-band 24 cm and RADARSAT C-band',
    story:
      'Southeast Asian tropical peatlands store centuries of subterranean carbon that becomes an explosive fire hazard when drained. Long L-band radar waves penetrate through smoke and surface vegetation deep into the underground peat bed. When subterranean moisture drops below critical thresholds, radar signals warn forestry teams weeks before fires ignite.',
  },
};

export default function StoryJournal({
  areas,
  activeArea,
  onSelectArea,
  activeLayerKey,
  onSelectLayer,
  isPlayingSonification,
  onToggleSonification,
  isPlayingTimeline = false,
  onToggleTimeline,
  selectedBand = 'L-Band',
  onSelectBand,
  ancillaryVisible = [],
  onToggleAncillary,
}: StoryJournalProps) {
  const current = CHAPTER_SUMMARIES[activeArea.id] || CHAPTER_SUMMARIES.kerala;

  // Determine active channel type: hh, hv, insar, or coherence
  const isCoherence = activeLayerKey.includes('coherence');
  const isInSAR = !isCoherence && (activeLayerKey.includes('phase') || activeLayerKey.includes('insar') || activeLayerKey.includes('goff'));
  const isHV = !isCoherence && !isInSAR && activeLayerKey.includes('hv');
  const isHH = !isCoherence && !isInSAR && !isHV;

  const handleChannelSelect = (channel: 'hh' | 'hv' | 'insar' | 'coherence') => {
    const keys = Object.keys(activeArea.layers);
    if (channel === 'hh') {
      const match = keys.find((k) => k.includes('hh')) || 'hh';
      onSelectLayer(match);
    } else if (channel === 'hv') {
      const match = keys.find((k) => k.includes('hv')) || 'hv';
      onSelectLayer(match);
    } else if (channel === 'insar') {
      const match = keys.find((k) => k.includes('phase') || k.includes('insar') || k.includes('goff')) || 'insar';
      onSelectLayer(match);
    } else {
      const match = keys.find((k) => k.includes('coherence')) || 'coherence';
      onSelectLayer(match);
    }
  };

  const channelRows = [
    {
      id: 'hh' as const,
      label: 'HH flood and water',
      isSelected: isHH,
      gradient: 'linear-gradient(to right, #0284C7, #38BDF8, #F59E0B, #FEF08A)',
      scaleHint: 'Specular water to double-bounce urban',
    },
    {
      id: 'hv' as const,
      label: 'HV forest canopy',
      isSelected: isHV,
      gradient: 'linear-gradient(to right, #E11D48, #F97316, #10B981)',
      scaleHint: 'Deforestation scar to dense canopy',
    },
    {
      id: 'insar' as const,
      label: 'InSAR ground shift',
      isSelected: isInSAR,
      gradient: 'linear-gradient(to right, #EF4444, #F59E0B, #10B981, #06B6D4, #3B82F6, #A855F7)',
      scaleHint: 'Phase fringe deformation cycles',
    },
    {
      id: 'coherence' as const,
      label: 'Phase coherence',
      isSelected: isCoherence,
      gradient: 'linear-gradient(to right, #6D28D9, #06B6D4, #FFFFFF)',
      scaleHint: 'Decorrelated ground to stable urban structure',
    },
  ];

  const wavelengthBands = [
    { id: 'L-Band', label: '24 cm L-band' },
    { id: 'S-Band', label: '9.3 cm S-band' },
    { id: 'C-Band', label: '5.6 cm C-band' },
  ];

  const contextLayers = [
    { id: 'population', label: 'Settlements' },
    { id: 'agriculture', label: 'Agriculture' },
    { id: 'infrastructure', label: 'Roads & bunds' },
  ];

  return (
    <aside className="w-[400px] h-full flex flex-col bg-[#F6F5F0] border-r border-[#D0CEC4] select-text z-20 overflow-y-auto font-sans">
      {/* SECTION 1: REGION NARRATIVE */}
      <section className="p-4 border-b border-[#D0CEC4] flex flex-col gap-2">
        <h1 className="font-display text-[22px] font-bold text-[#121417] leading-tight">
          {current.title}
        </h1>
        <div className="text-xs text-[#121417]/70 font-normal">
          {current.location}, {current.sensor}
        </div>
        <p className="text-xs text-[#121417]/85 leading-relaxed font-sans mt-1">
          {current.story}
        </p>
      </section>

      {/* SECTION 2: RADAR CHANNEL & BAND */}
      <section className="p-4 border-b border-[#D0CEC4] flex flex-col gap-3.5">
        <div>
          <div className="text-xs font-medium text-[#121417]/70 mb-2">Radar channel</div>
          <div className="flex flex-col gap-1.5">
            {channelRows.map((row) => (
              <button
                key={row.id}
                onClick={() => handleChannelSelect(row.id)}
                className={`w-full flex items-center justify-between p-2 text-left border transition-colors ${
                  row.isSelected
                    ? 'bg-[#EAE8E0] border-[#0047AB]'
                    : 'bg-[#F6F5F0] border-[#D0CEC4] hover:bg-[#EAE8E0]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      row.isSelected ? 'border-[#0047AB]' : 'border-[#D0CEC4] bg-white'
                    }`}
                  >
                    {row.isSelected && <div className="w-2 h-2 rounded-full bg-[#0047AB]" />}
                  </div>
                  <span className="text-xs font-medium text-[#121417] truncate">
                    {row.label}
                  </span>
                </div>
                <div
                  className="h-2 w-20 border border-[#D0CEC4] shrink-0 ml-3"
                  style={{ background: row.gradient }}
                  title={row.scaleHint}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-[#121417]/70 mb-1.5">Radar wavelength</div>
          <div className="grid grid-cols-3 gap-1.5">
            {wavelengthBands.map((b) => {
              const isSelected = selectedBand === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBand?.(b.id)}
                  className={`py-1.5 px-2 text-xs font-medium text-center border transition-colors ${
                    isSelected
                      ? 'bg-[#0047AB] text-white border-[#0047AB] font-semibold'
                      : 'bg-[#EAE8E0] text-[#121417] border-[#D0CEC4] hover:bg-[#D0CEC4]/50'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: CONTEXT LAYERS & PLAYBACK */}
      <section className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#121417]/70 mb-1.5">Context layers</div>
          <div className="grid grid-cols-3 gap-1.5">
            {contextLayers.map((layer) => {
              const isVisible = ancillaryVisible?.includes(layer.id);
              return (
                <button
                  key={layer.id}
                  onClick={() => onToggleAncillary?.(layer.id)}
                  className={`py-1.5 px-2 text-xs font-medium text-center border transition-colors ${
                    isVisible
                      ? 'bg-[#0047AB] text-white border-[#0047AB] font-semibold'
                      : 'bg-[#EAE8E0] text-[#121417] border-[#D0CEC4] hover:bg-[#D0CEC4]/50'
                  }`}
                >
                  {layer.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={onToggleTimeline}
            className="w-full py-2.5 px-3 text-xs font-semibold bg-[#0047AB] text-white hover:bg-[#003882] transition-colors"
          >
            {isPlayingTimeline ? 'Pause 12-month cycle' : 'Play 12-month cycle'}
          </button>
          <button
            onClick={onToggleSonification}
            className="w-full py-2.5 px-3 text-xs font-medium bg-[#EAE8E0] text-[#121417] border border-[#D0CEC4] hover:bg-[#D0CEC4]/60 transition-colors"
          >
            {isPlayingSonification ? 'Stop radar rhythm' : 'Listen to radar rhythm'}
          </button>
        </div>
      </section>
    </aside>
  );
}