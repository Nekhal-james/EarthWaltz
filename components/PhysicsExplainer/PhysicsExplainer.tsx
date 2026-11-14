'use client';

import type { StudyArea } from '@/types';

interface PhysicsExplainerProps {
  area: StudyArea;
  onClose: () => void;
}

const GENERAL_PHYSICS = [
  {
    title: 'Radar Backscatter and Reflectivity',
    content:
      'Synthetic Aperture Radar transmits coherent microwave pulses and measures the backscattered energy. Rough, structured surfaces (urban buildings, forest biomass) scatter energy back toward the sensor, appearing bright. Smooth surfaces (calm water, asphalt) reflect energy away specularly, appearing dark. Calibrated backscatter is measured in decibels (dB).',
  },
  {
    title: 'HH and HV Polarization Signatures',
    content:
      'HH (Horizontal Transmit, Horizontal Receive) is sensitive to direct surface roughness and double-bounce reflection (e.g., standing water under flooded vegetation). HV (Cross-Polarization) measures signal depolarization caused by multiple random scattering events inside tree canopies and complex agricultural structures.',
  },
  {
    title: 'InSAR Interferometry and Phase Fringes',
    content:
      'By computing the phase difference between two repeat-pass SAR acquisitions, InSAR measures subtle surface displacement with centimeter-level precision. For NISAR L-band (wavelength 24 cm), one full phase cycle (2π radians) corresponds to exactly 12.0 cm of line-of-sight surface displacement.',
  },
  {
    title: 'Interferometric Coherence',
    content:
      'Coherence (γ, scaled 0 to 1) quantifies the statistical phase correlation between two observations. High coherence (bare rock, urban structures) indicates surface stability. Low coherence (decorrelation) indicates structural change, moisture shifts, active flooding, or rapid vegetation growth.',
  },
  {
    title: 'Scattering Mechanisms',
    content:
      'Three fundamental physical scattering mechanisms dominate radar imagery: Specular Reflection (flat water, runways), Volume Scattering (depolarizing forest canopies), and Double-Bounce Reflection (orthogonal corner reflector formed by vertical tree trunks or buildings standing in water).',
  },
  {
    title: 'Multi-Frequency Penetration Depths',
    content:
      'L-Band (24 cm wavelength) penetrates dense tree foliage and dry soil layers to probe root zone hydrology and bedrock deformation. S-Band (9.3 cm) interacts with crop stalks and upper foliage. C-Band (5.6 cm) scatters off the top canopy crown, enabling complementary multi-frequency environmental profiling.',
  },
];

export default function PhysicsExplainer({ area, onClose }: PhysicsExplainerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#111210]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#111210] border border-[#242522] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#242522] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#F3F2EE]">SAR remote sensing physics guide</h3>
            <p className="text-xs text-[#9A9B94] mt-0.5">
              Microwave scattering, polarimetry, and interferometry principles
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[#9A9B94] hover:text-[#F3F2EE] px-2 py-1 rounded border border-[#242522] hover:bg-[#181916] transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          <div className="bg-[#181916] border border-[#242522] rounded-md p-3">
            <span className="text-[11px] font-medium text-[#10B981]">
              Current region focus · {area.name}
            </span>
            <p className="text-xs text-[#F3F2EE] font-medium mt-1">{area.phenomenon}</p>
            <p className="text-xs text-[#9A9B94] leading-relaxed mt-1">{area.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GENERAL_PHYSICS.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#181916] border border-[#242522] rounded-md p-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <h4 className="text-xs font-semibold text-[#F3F2EE]">{item.title}</h4>
                </div>
                <p className="text-[11px] text-[#9A9B94] leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#242522] bg-[#181916]/50 flex justify-between items-center text-xs">
          <span className="text-[#9A9B94] text-[11px]">NASA / ISRO SAR Calibration Standards</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#242522] hover:bg-[#2c3345] text-[#F3F2EE] text-xs font-medium rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
