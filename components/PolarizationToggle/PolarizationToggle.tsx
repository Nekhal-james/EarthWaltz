'use client';

import type { StudyArea } from '@/types';

interface PolarizationToggleProps {
  area: StudyArea;
  activeKey: string;
  onSelect: (key: string) => void;
}

const LAYER_ICONS: Record<string, string> = {
  hh: '📡',
  hv: '📡',
  vv: '📡',
  insar: '🌈',
  coherence: '🎯',
  offset: '➡️',
  sband_hh: '📡',
  sband_hv: '📡',
  cband_hv: '📡',
};

const POLARIZATION_COLORS: Record<string, string> = {
  hh: 'border-[#06b6d4] text-[#06b6d4]',
  hv: 'border-[#d946ef] text-[#d946ef]',
  vv: 'border-[#eab308] text-[#eab308]',
  insar: 'border-[#06b6d4] text-[#06b6d4]',
  coherence: 'border-[#9ca3af] text-[#9ca3af]',
  offset: 'border-[#f59e0b] text-[#f59e0b]',
};

export default function PolarizationToggle({ area, activeKey, onSelect }: PolarizationToggleProps) {
  const layerKeys = Object.keys(area.layers);
  const frequencies = area.frequencies;

  return (
    <div className="absolute top-16 left-4 z-20">
      {/* Frequency row */}
      {frequencies.length > 0 && (
        <div className="flex gap-1 mb-2">
          {frequencies.map((f) => (
            <span
              key={f.band}
              className="text-[10px] bg-[#111827]/80 backdrop-blur-sm border border-[#374151] rounded-full px-2.5 py-1 text-[#d946ef] font-medium"
            >
              {f.band} ({f.wavelength_cm}cm)
            </span>
          ))}
        </div>
      )}

      {/* Polarization buttons */}
      <div className="flex flex-col gap-1">
        {layerKeys.map((key) => {
          const layer = area.layers[key];
          const isActive = key === activeKey;
          const icon = LAYER_ICONS[key] || '📡';
          const colors = POLARIZATION_COLORS[key] || 'border-[#6b7280] text-[#6b7280]';

          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all backdrop-blur-sm ${
                isActive
                  ? 'bg-[#f59e0b]/20 border-2 border-[#f59e0b] text-[#f59e0b] shadow-lg shadow-[#f59e0b]/10'
                  : `bg-[#111827]/80 border ${colors} hover:bg-[#1f2937]/80`
              }`}
            >
              <span>{icon}</span>
              <span>{layer.label}</span>
              <span className="text-[10px] opacity-60">({layer.unit})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
