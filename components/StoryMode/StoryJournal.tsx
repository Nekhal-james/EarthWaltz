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
}

interface ChapterData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  sensor: string;
  location: string;
  p1: string;
  p2: string;
  visualKey: {
    value: string;
    label: string;
    physics: string;
  }[];
}

const CHAPTERS: ChapterData[] = [
  {
    id: 'kerala',
    number: 1,
    title: 'When the Monsoon Meets Below-Sea-Level Fields',
    subtitle: 'Kuttanad Polders & Idukki Foothills, Kerala',
    sensor: 'NISAR L-Band 24 cm · HH & HV Polarizations',
    location: 'Kerala, India · 9.49° N, 76.33° E',
    p1: 'During the Southwest Monsoon over Kerala, thick rain clouds shroud Vembanad Lake and the Kuttanad delta for months on end. Optical satellites see nothing but an opaque white ceiling. Yet below sea level, where farmers cultivate rice in reclaimed polders, rising floodwaters threaten earthen bunds, and waterlogged slopes in the Western Ghats foothills face dangerous landslide hazards.',
    p2: 'This is where 24 cm L-band microwave radar proves indispensable. The long radio waves pass straight through torrential monsoon clouds. Because calm open water acts as a specular mirror, it scatters pulses away from the satellite, appearing deep slate-dark (-24 dB). But when water enters standing rice crops, the microwave pulse bounces first off the water and then off the upright stalk—a classic double-bounce corner reflection that flashes brilliant amber (-4.2 dB). Disaster management teams can map breached bunds and waterlogged villages in real time through the storm.',
    visualKey: [
      {
        value: '-24.0 dB',
        label: 'Vembanad Lake open water',
        physics: 'Specular mirror reflection: pulses bounce forward away from sensor',
      },
      {
        value: '-4.2 dB',
        label: 'Flooded Kuttanad paddy polders',
        physics: 'Double-bounce corner reflection between standing water and rice stalks',
      },
      {
        value: '-14.8 dB',
        label: 'Midland rubber & coconut groves',
        physics: 'Diffuse volume canopy scattering across multi-story tree foliage',
      },
    ],
  },
  {
    id: 'amazon',
    number: 2,
    title: 'The Hidden Flood Pulse of the Great Rainforest',
    subtitle: 'Manaus, Rio Negro & Solimões Confluence, Brazil',
    sensor: 'ALOS PALSAR & CONAE SAOCOM-1A · L-Band 24 cm',
    location: 'Amazonas, Brazil · 3.12° S, 60.02° W',
    p1: 'Near the meeting of the black waters of Rio Negro and the sediment-rich Rio Solimões, seasonal flood pulses expand the river surface into thousands of square kilometers of dense flooded forest (várzea and igapó). From airplanes and optical satellites, the continuous green canopy completely conceals the meters of water surging beneath the trees.',
    p2: 'NISAR and SAOCOM L-band radar penetrates through the thick triple-tier tropical canopy. The ground-trunk dihedral bounce produces an unmistakable high-intensity signal, revealing the exact boundaries of aquatic ecosystems that nurture Amazonian biodiversity. Meanwhile, cross-polarized HV backscatter tracks canopy volume loss along expanding deforestation frontiers with sub-hectare precision.',
    visualKey: [
      {
        value: '-24.5 dB',
        label: 'Rio Negro deep specular surface',
        physics: 'Smooth calm water acts as an electromagnetic mirror with zero return',
      },
      {
        value: '-3.8 dB',
        label: 'Submerged várzea forest',
        physics: 'High-intensity trunk-water double-bounce illuminates flooded roots',
      },
      {
        value: '-10.2 dB',
        label: 'Pristine rainforest canopy',
        physics: 'Dense cross-polarizing crown volume scattering (-14 to -9 dB HV)',
      },
    ],
  },
  {
    id: 'himalayas',
    number: 3,
    title: 'Creeping Ice and the High-Mountain Hazards',
    subtitle: 'Khumbu Glacier & Everest Massif, Nepal',
    sensor: 'NISAR L2 GOFF & ALOS PALSAR · L-Band 24 cm',
    location: 'Sagarmatha, Nepal · 27.98° N, 86.92° E',
    p1: 'The glaciers of the High Himalayas supply freshwater to over a billion people downstream, yet they are among the most vulnerable and hostile environments on Earth. Persistent blizzards, cloud decks, and severe optical shadows cast by towering peaks make continuous tracking by conventional cameras nearly impossible.',
    p2: 'Using radar offset tracking (GOFF) and interferometric coherence, scientists track the slow, relentless downhill crawl of the Khumbu glacier—displacements between 0.5 and 2.0 meters per year. Radar phase decorrelation highlights melting firn snow and unstable terminal moraine dams, providing early warning for Glacial Lake Outburst Floods (GLOFs) before moraines fail.',
    visualKey: [
      {
        value: '0.22 γ',
        label: 'Flowing glacial ice & melting firn',
        physics: 'Rapid structural movement creates low interferometric coherence',
      },
      {
        value: '0.86 γ',
        label: 'Exposed granite bedrock ridges',
        physics: 'Rigid rock face retains stable microwave phase return over repeat passes',
      },
      {
        value: '±1.46 m',
        label: 'Annual glacial velocity field',
        physics: 'Pixel speckle correlation tracks downhill ice surface velocity vectors',
      },
    ],
  },
  {
    id: 'turkey',
    number: 4,
    title: 'When the Earth Snaps: Mapping Tectonic Rupture',
    subtitle: 'East Anatolian Fault Zone, Kahramanmaraş, Turkey',
    sensor: 'Sentinel-1 C-Band 5.6 cm & NISAR GUNW Interferometry',
    location: 'Anatolia, Turkey · 37.57° N, 36.93° E',
    p1: 'In February 2023, catastrophic earthquakes shattered southern Turkey along the East Anatolian Fault system. Ground rupture severed highways, collapsed thousands of buildings, and displaced agricultural fields by several meters within seconds, creating an urgent crisis for emergency search and rescue teams.',
    p2: 'Radar interferometry (InSAR) captured repeat-pass radar phase before and after the rupture. By differencing the phase fields, scientists generated an interferogram where each colorful rainbow fringe represents exactly 2.8 centimeters of ground movement toward or away from the satellite. The tight concentration of fringes pinpointed the exact fault trace and sub-surface slip distribution.',
    visualKey: [
      {
        value: '2.8 cm / fringe',
        label: 'Interferometric fringe cycle (2π)',
        physics: 'Centimetric line-of-sight surface displacement along the fault line',
      },
      {
        value: '0.14 γ',
        label: 'Shattered fault rupture corridor',
        physics: 'Severe ground displacement destroys phase coherence into speckle noise',
      },
      {
        value: '0.92 γ',
        label: 'Stable arid plains & undamaged bedrock',
        physics: 'High phase stability preserves crisp interferometric signal',
      },
    ],
  },
  {
    id: 'punjab',
    number: 5,
    title: 'The Dielectric Pulse of India\'s Breadbasket',
    subtitle: 'Indo-Gangetic Plain, Punjab, India',
    sensor: 'NISAR Dual L+S Band (24 cm & 9.3 cm)',
    location: 'Punjab, India · 30.90° N, 75.85° E',
    p1: 'Punjab produces a massive share of India\'s food grains through intensive wheat-rice rotations. In summer and post-monsoon periods, heavy smog, agricultural dust haze, and cloud cover obstruct optical NDVI satellites from monitoring soil preparation and crop growth cycles.',
    p2: 'Liquid water has an extraordinary dielectric constant (~80) compared to dry mineral soil (~3 to 4). When farmers irrigate parched soil, the soil\'s dielectric permittivity surges, causing a sharp jump in L-band backscatter. Simultaneously, ISRO\'s 9.3 cm S-band interacts directly with the emerging crop canopy, giving agronomists independent measurements of soil moisture and crop biomass simultaneously.',
    visualKey: [
      {
        value: '-12.4 dB',
        label: 'Dry fallow soil prior to irrigation',
        physics: 'Low dielectric permittivity produces weak diffuse surface return',
      },
      {
        value: '-4.8 dB',
        label: 'Irrigated seedling emergence',
        physics: 'High dielectric constant of moist soil dramatically boosts radar backscatter',
      },
      {
        value: '0.88 γ',
        label: 'Uniform crop parcel borders',
        physics: 'Consistent vegetative growth maintains high interferometric coherence',
      },
    ],
  },
  {
    id: 'indonesia',
    number: 6,
    title: 'Subterranean Embers: Peatland Moisture and Fire Early Warning',
    subtitle: 'Tropical Peat Forests, Sumatra & Kalimantan, Indonesia',
    sensor: 'NISAR L-Band 24 cm & Sentinel-1 C-Band Multi-Frequency',
    location: 'Sumatra, Indonesia · 0.58° S, 101.45° E',
    p1: 'Southeast Asian tropical peatlands store immense quantities of organic carbon built over thousands of years. When drained by palm oil canals or subjected to El Niño droughts, the spongy peat dries out and becomes an explosive tinderbox. Optical satellites and thermal sensors only detect fires once smoke plumes have already filled the sky.',
    p2: 'Because L-band microwaves penetrate deep into dry organic soil layers, NISAR measures moisture depletion within the subterranean peat bed weeks before fires ignite. A drop in L-band backscatter below -20 dB signals critical drying of the peat matrix, alerting forestry teams and fire brigades before irrecoverable peat fires break out.',
    visualKey: [
      {
        value: '-24.0 dB',
        label: 'Desiccated peatland canal bank',
        physics: 'Plummeting dielectric constant signals extreme underground fire hazard',
      },
      {
        value: '-11.5 dB',
        label: 'Hydrated virgin swamp forest',
        physics: 'High dielectric response combined with intact canopy volume scatter',
      },
      {
        value: '-18.2 dB',
        label: 'Burn scar recovery zone',
        physics: 'Structural collapse of canopy eliminates cross-polarization HV return',
      },
    ],
  },
];

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
}: StoryJournalProps) {
  // Find current chapter
  const currentChapter = CHAPTERS.find((c) => c.id === activeArea.id) || CHAPTERS[0];

  const handleNextChapter = () => {
    const currentIndex = CHAPTERS.findIndex((c) => c.id === activeArea.id);
    const nextIndex = (currentIndex + 1) % CHAPTERS.length;
    const nextChapter = CHAPTERS[nextIndex];
    const targetArea = areas.find((a) => a.id === nextChapter.id);
    if (targetArea) {
      onSelectArea(targetArea);
    }
  };

  const handlePrevChapter = () => {
    const currentIndex = CHAPTERS.findIndex((c) => c.id === activeArea.id);
    const prevIndex = (currentIndex - 1 + CHAPTERS.length) % CHAPTERS.length;
    const prevChapter = CHAPTERS[prevIndex];
    const targetArea = areas.find((a) => a.id === prevChapter.id);
    if (targetArea) {
      onSelectArea(targetArea);
    }
  };

  const handlePolarizationCycle = () => {
    const layerKeys = Object.keys(activeArea.layers);
    if (layerKeys.length === 0) return;
    const currentIndex = layerKeys.indexOf(activeLayerKey);
    const nextIndex = (currentIndex + 1) % layerKeys.length;
    onSelectLayer(layerKeys[nextIndex]);
  };

  return (
    <aside className="w-[420px] h-full flex flex-col bg-[#0D0E0C] border-r border-[#232520] select-text z-20 overflow-hidden">
      {/* JOURNAL HEADER */}
      <div className="p-6 border-b border-[#232520] shrink-0 bg-[#0D0E0C]">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E54D2E]" />
          <span className="text-[11px] font-medium tracking-normal text-[#9A9B94] uppercase font-mono">
            NASA · ISRO · Earth Observatory Journal
          </span>
        </div>

        <h1 className="font-serif text-2xl font-normal leading-snug tracking-tight text-[#F4F3EF] mb-3">
          Dancing with the SARs
        </h1>

        <p className="text-xs text-[#9A9B94] leading-relaxed mb-4">
          How synthetic aperture radar penetrates clouds, canopy, and crust to map the living, changing Earth.
        </p>

        {/* Plain language physics callout */}
        <div className="bg-[#141613] border border-[#232520] rounded-md p-3 text-[11px] text-[#9A9B94] leading-relaxed">
          <p className="mb-1.5">
            <span className="text-[#F4F3EF] font-medium">Roughness:</span> Calm water acts as a mirror bouncing radar pulses away (dark). Rough trees and cities scatter pulses back to the antenna (bright).
          </p>
          <p>
            <span className="text-[#F4F3EF] font-medium">Dielectric Permittivity:</span> Liquid water has 20× the reflective electrical property of dry soil. When land floods or soil moistens, radar reflection surges.
          </p>
        </div>
      </div>

      {/* CHAPTER STEPPER PILL BAR */}
      <div className="px-6 py-2.5 bg-[#111210] border-b border-[#232520] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          {CHAPTERS.map((ch) => {
            const isCurrent = ch.id === activeArea.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  const targetArea = areas.find((a) => a.id === ch.id);
                  if (targetArea) onSelectArea(targetArea);
                }}
                className={`w-6 h-6 rounded-full text-xs font-mono transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[#E54D2E] text-white font-bold ring-2 ring-[#E54D2E]/30'
                    : 'bg-[#181916] text-[#9A9B94] border border-[#232520] hover:text-[#F4F3EF] hover:border-[#9A9B94]/50'
                }`}
                title={ch.title}
              >
                {ch.number}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 text-xs text-[#9A9B94]">
          <button
            onClick={handlePrevChapter}
            className="px-2 py-0.5 rounded border border-[#232520] bg-[#141613] hover:text-[#F4F3EF] hover:bg-[#181916] transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={handleNextChapter}
            className="px-2 py-0.5 rounded border border-[#232520] bg-[#141613] hover:text-[#F4F3EF] hover:bg-[#181916] transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* SCROLLABLE CHAPTER CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Chapter Header */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold text-[#E54D2E]">
              Chapter {currentChapter.number} of {CHAPTERS.length}
            </span>
            <span className="text-xs text-[#232520]">/</span>
            <span className="text-xs text-[#9A9B94]">{currentChapter.location}</span>
          </div>

          <h2 className="font-serif text-xl font-normal leading-tight text-[#F4F3EF] mb-2">
            {currentChapter.title}
          </h2>

          <p className="text-xs font-mono text-[#9A9B94]">
            {currentChapter.sensor}
          </p>
        </div>

        {/* Narrative Prose */}
        <div className="space-y-3.5 text-xs text-[#9A9B94] leading-relaxed font-sans">
          <p>{currentChapter.p1}</p>
          <p>{currentChapter.p2}</p>
        </div>

        {/* Visual Key: What the Radar Sees */}
        <div className="bg-[#141613] border border-[#232520] rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#232520] pb-2">
            <span className="text-xs font-medium text-[#F4F3EF]">What the radar sees</span>
            <span className="text-[10px] font-mono text-[#9A9B94]">Physical interaction</span>
          </div>

          <div className="space-y-2">
            {currentChapter.visualKey.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                <div className="flex flex-col">
                  <span className="font-medium text-[#F4F3EF]">{item.label}</span>
                  <span className="text-[11px] text-[#9A9B94] leading-snug">{item.physics}</span>
                </div>
                <span className="font-mono text-xs text-[#E54D2E] font-medium shrink-0 bg-[#0D0E0C] px-1.5 py-0.5 rounded border border-[#232520]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Three 1-Click Inline Chapter Action Pills */}
        <div className="pt-2">
          <span className="text-[11px] text-[#9A9B94] font-medium block mb-2">
            Interactive chapter actions
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onFocusCurtain}
              className="px-3 py-1.5 rounded-md bg-[#181916] border border-[#232520] hover:border-[#E54D2E] text-xs font-medium text-[#F4F3EF] transition-all flex items-center gap-1.5 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E54D2E]" />
              <span>Drag before / after curtain</span>
            </button>

            <button
              onClick={handlePolarizationCycle}
              className="px-3 py-1.5 rounded-md bg-[#181916] border border-[#232520] hover:border-[#10B981] text-xs font-medium text-[#F4F3EF] transition-all flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>
                Switch channel ({activeArea.layers[activeLayerKey]?.label?.split(' ')[0] || 'Radar'})
              </span>
            </button>

            <button
              onClick={onToggleSonification}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all flex items-center gap-1.5 ${
                isPlayingSonification
                  ? 'bg-[#E54D2E]/20 text-[#E54D2E] border-[#E54D2E]'
                  : 'bg-[#181916] border-[#232520] hover:border-[#9A9B94] text-[#F4F3EF]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPlayingSonification ? 'bg-[#E54D2E] animate-pulse' : 'bg-[#9A9B94]'}`} />
              <span>{isPlayingSonification ? 'Stop audio sonification' : 'Listen to surface waltz'}</span>
            </button>
          </div>
        </div>

        {/* Footer Pro Link */}
        <div className="pt-4 border-t border-[#232520]">
          <button
            onClick={onSwitchToInstrument}
            className="w-full py-2.5 px-3 rounded-md bg-[#141613] hover:bg-[#181916] border border-[#232520] hover:border-[#9A9B94]/60 text-xs text-[#9A9B94] hover:text-[#F4F3EF] transition-all flex items-center justify-between group"
          >
            <span>Want multi-frequency bands, HDF5 provenance & STAC telemetry?</span>
            <span className="font-mono text-[#E54D2E] group-hover:translate-x-0.5 transition-transform">
              Switch to Instrument Mode →
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
