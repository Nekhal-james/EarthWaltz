'use client';

import { useMemo } from 'react';
import type { LayerInfo } from '@/types';

interface ColorbarLegendProps {
  activeLayer: LayerInfo | null;
}

export default function ColorbarLegend({ activeLayer }: ColorbarLegendProps) {
  const unit = activeLayer?.unit || 'dB';
  const label = activeLayer?.label || 'SAR Layer';

  const config = useMemo(() => {
    if (unit === 'rad') {
      return {
        title: 'InSAR Interferometric Phase & LOS Deformation',
        subtitle: '1 full fringe cycle (2π) = 12.0 cm ground movement (L-Band λ = 24 cm)',
        gradient: 'linear-gradient(to right, #ff0000 0%, #ffff00 16.6%, #00ff00 33.3%, #00ffff 50%, #0000ff 66.6%, #ff00ff 83.3%, #ff0000 100%)',
        ticks: [
          { val: '-π', sub: '-12cm' },
          { val: '-π/2', sub: '-6cm' },
          { val: '0', sub: '0cm' },
          { val: '+π/2', sub: '+6cm' },
          { val: '+π', sub: '+12cm' },
        ],
      };
    }

    if (unit === 'm') {
      return {
        title: 'Glacier Flow Displacement (NISAR L2 GOFF)',
        subtitle: 'Pixel cross-correlation offset tracking along range/azimuth',
        gradient: 'linear-gradient(to right, #2563eb 0%, #93c5fd 30%, #f8fafc 50%, #fca5a5 70%, #ef4444 100%)',
        ticks: [
          { val: '-2.0 m', sub: 'Retreat' },
          { val: '-1.0 m', sub: '' },
          { val: '0.0 m', sub: 'Static' },
          { val: '+1.0 m', sub: '' },
          { val: '+2.0 m', sub: 'Downslope' },
        ],
      };
    }

    if (unit === 'coherence') {
      return {
        title: 'Interferometric Coherence (γ)',
        subtitle: 'Phase stability measure (0 = total decorrelation, 1 = perfect phase correlation)',
        gradient: 'linear-gradient(to right, #090d16 0%, #1f2937 25%, #4b5563 50%, #9ca3af 75%, #ffffff 100%)',
        ticks: [
          { val: '0.0', sub: 'Water / Dense Foliage' },
          { val: '0.25', sub: '' },
          { val: '0.50', sub: 'Sparse Veg' },
          { val: '0.75', sub: '' },
          { val: '1.0', sub: 'Bare Rock / Built' },
        ],
      };
    }

    // Default: Backscatter Intensity (dB)
    return {
      title: 'Calibrated Radar Backscatter (σ⁰ Intensity)',
      subtitle: 'Color scale: Cyan (#06b6d4) → Magenta (#d946ef) → Yellow (#eab308)',
      gradient: 'linear-gradient(to right, #06b6d4 0%, #a855f7 40%, #d946ef 65%, #f59e0b 88%, #eab308 100%)',
      ticks: [
        { val: '-25 dB', sub: 'Smooth Water' },
        { val: '-18 dB', sub: 'Low Veg' },
        { val: '-12 dB', sub: 'Tree Canopy' },
        { val: '-6 dB', sub: 'Dense/Rough' },
        { val: '+5 dB', sub: 'Double-Bounce' },
      ],
    };
  }, [unit]);

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-[#111827]/90 backdrop-blur-md border border-[#374151] rounded-xl px-4 py-2 shadow-2xl w-[90vw] max-w-xl pointer-events-auto">
      {/* Legend Title */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span className="text-[11px] font-bold text-gray-200 font-mono tracking-tight">
            {config.title}
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          Layer: <span className="text-[#06b6d4] font-semibold">{label}</span>
        </span>
      </div>

      {/* Colorbar Gradient Bar */}
      <div
        className="w-full h-2.5 rounded-full shadow-inner border border-white/20 mb-1"
        style={{ background: config.gradient }}
      />

      {/* Ticks and physical annotations */}
      <div className="flex justify-between items-start text-[9px] font-mono text-gray-300">
        {config.ticks.map((t, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              idx === 0
                ? 'items-start text-left'
                : idx === config.ticks.length - 1
                ? 'items-end text-right'
                : 'items-center text-center'
            }`}
          >
            <span className="font-bold text-white text-[9px]">{t.val}</span>
            {t.sub && <span className="text-[8px] text-gray-400">{t.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
