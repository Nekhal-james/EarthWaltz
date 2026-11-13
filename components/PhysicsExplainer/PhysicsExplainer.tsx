'use client';

import type { StudyArea } from '@/types';

interface PhysicsExplainerProps {
  area: StudyArea;
  onClose: () => void;
}

const SAR_PHYSICS: Record<string, { title: string; content: string; icon: string }[]> = {
  default: [
    {
      title: 'What is Radar Backscatter?',
      icon: '📡',
      content:
        'SAR sends microwave pulses and measures the energy bounced back. Rough surfaces (cities, forests) scatter strongly; smooth surfaces (water, roads) reflect energy away, appearing dark. The backscatter coefficient σ⁰ is measured in decibels (dB).',
    },
    {
      title: 'HH vs HV Polarization',
      icon: '↔️',
      content:
        'HH (Horizontal-Horizontal): transmit and receive horizontally. Best for soil moisture and flooding — water acts as a mirror, creating double-bounce with vegetation. HV (Horizontal-Vertical): the signal changes polarization on scattering. Strong HV means volume scattering in forest canopies.',
    },
    {
      title: 'InSAR Interferometry',
      icon: '🌈',
      content:
        'By comparing the phase of two SAR acquisitions, InSAR measures ground displacement to centimeter accuracy. Each color fringe in an interferogram represents ~12cm of displacement for L-band. Used to map earthquake deformation, volcanic uplift, and land subsidence.',
    },
    {
      title: 'Coherence',
      icon: '🎯',
      content:
        'Coherence measures how similar two SAR images are at each pixel (0 = random, 1 = identical). Low coherence means the surface changed between acquisitions — floods, harvests, or construction. High coherence means stability: buildings, rock, dry ground.',
    },
    {
      title: 'Scattering Mechanisms',
      icon: '🔬',
      content:
        'Surface scattering: bare soil, rock. Volume scattering: forest canopy, crops. Double-bounce: standing water beneath vegetation (corner reflector effect). Each polarization responds differently to these mechanisms, revealing different aspects of the landscape.',
    },
    {
      title: 'Why L-band?',
      icon: '📏',
      content:
        "NISAR's L-band (24cm wavelength) penetrates vegetation canopies, detecting soil moisture beneath crops and forests. Shorter wavelengths (C-band 5.6cm, S-band 9.3cm) interact more with leaves and branches, providing complementary information about canopy structure.",
    },
  ],
};

const AREA_PHYSICS: Record<string, { title: string; content: string; icon: string }[]> = {
  kerala: [
    {
      title: 'Paddy Field Flooding',
      icon: '🌾',
      content:
        'In Kuttanad, paddy fields are deliberately flooded. HH backscatter shows a distinctive bright signature from double-bounce: radar bounces off water surface, hits vertical rice stems, and returns. This bright flooding signal is invisible to optical sensors under clouds.',
    },
    {
      title: 'Western Ghats Landslides',
      icon: '⛰️',
      content:
        'InSAR coherence drops sharply where landslides have occurred, as the surface is completely rearranged. InSAR phase fringes can reveal pre-failure creep — slow ground movement that precedes catastrophic failure.',
    },
  ],
  amazon: [
    {
      title: 'Canopy Penetration',
      icon: '🌳',
      content:
        "L-band's 24cm wavelength penetrates the Amazon canopy, reaching the forest floor. HH detects flooding beneath the canopy (bright double-bounce), while HV responds to canopy volume. Deforestation appears as a sudden drop in HV backscatter.",
    },
  ],
  himalayas: [
    {
      title: 'Glacier Motion',
      icon: '🏔️',
      content:
        'Offset tracking measures glacier flow by correlating SAR amplitude patterns between acquisitions. Unlike InSAR (which loses coherence on fast-moving ice), offset tracking works for velocities up to meters per day.',
    },
  ],
  turkey: [
    {
      title: 'Earthquake Interferograms',
      icon: '🌍',
      content:
        'The rainbow fringes in earthquake interferograms map ground displacement. For NISAR L-band, each complete color cycle = ~12cm of line-of-sight displacement. Dense fringes near fault ruptures indicate rapid displacement gradients.',
    },
  ],
  punjab: [
    {
      title: 'Dual-Frequency Agriculture',
      icon: '🌱',
      content:
        'L-band penetrates wheat and rice canopies to sense soil moisture beneath. S-band (9.3cm) interacts with the canopy itself. Together they distinguish irrigated vs rainfed fields and track crop growth stages through the season.',
    },
  ],
  indonesia: [
    {
      title: 'Seeing Through Smoke',
      icon: '🔥',
      content:
        'During peat fire season, smoke blankets Sumatra for months. Optical satellites are useless. SAR cuts through smoke and clouds to map burn scars. C-band sees the surface roughness changes; L-band penetrates to detect subsurface peat moisture loss.',
    },
  ],
};

export default function PhysicsExplainer({ area, onClose }: PhysicsExplainerProps) {
  const generalTopics = SAR_PHYSICS.default;
  const areaTopics = AREA_PHYSICS[area.id] || [];

  return (
    <div className="slide-in-right fixed top-0 right-0 bottom-0 w-96 max-w-[90vw] z-40 bg-[#111827]/95 backdrop-blur-md border-l border-[#1f2937] shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#111827]/95 backdrop-blur-md border-b border-[#1f2937] px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-base font-bold text-[#f9fafb]">
            SAR Physics
          </h2>
          <p className="text-xs text-[#9ca3af]">Understanding radar remote sensing</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#1f2937] hover:bg-[#374151] flex items-center justify-center text-[#9ca3af] hover:text-[#f9fafb] transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Area-specific topics */}
        {areaTopics.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-[#f59e0b] uppercase tracking-wider">
              📍 {area.name}
            </h3>
            {areaTopics.map((topic) => (
              <div key={topic.title} className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#f9fafb] flex items-center gap-2 mb-2">
                  <span>{topic.icon}</span> {topic.title}
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{topic.content}</p>
              </div>
            ))}
            <div className="border-t border-[#1f2937] my-4" />
          </>
        )}

        {/* General SAR physics */}
        <h3 className="text-xs font-medium text-[#06b6d4] uppercase tracking-wider">
          🎓 SAR Fundamentals
        </h3>
        {generalTopics.map((topic) => (
          <div key={topic.title} className="bg-[#1f2937]/50 border border-[#374151] rounded-lg p-4">
            <h4 className="text-sm font-medium text-[#f9fafb] flex items-center gap-2 mb-2">
              <span>{topic.icon}</span> {topic.title}
            </h4>
            <p className="text-xs text-[#9ca3af] leading-relaxed">{topic.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
