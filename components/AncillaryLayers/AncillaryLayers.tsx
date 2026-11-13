'use client';

import { useState } from 'react';

interface AncillaryLayersProps {
  visible: string[];
  onToggle: (layerId: string) => void;
}

const ANCILLARY_OPTIONS = [
  { id: 'population', label: 'Human Settlement / Population', icon: '👥', color: '#f59e0b' },
  { id: 'agriculture', label: 'Cropland & Paddy Field Grids', icon: '🌾', color: '#10b981' },
  { id: 'infrastructure', label: 'Bridges, Dams & Transport Corridors', icon: '🏗️', color: '#3b82f6' },
];

export default function AncillaryLayers({ visible, onToggle }: AncillaryLayersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#111827]/90 backdrop-blur-md border border-[#374151] rounded-xl shadow-xl overflow-hidden w-64">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-200 hover:bg-[#1f2937]/50 transition"
      >
        <div className="flex items-center gap-1.5">
          <span>🗺️</span>
          <span>Ancillary Human Layers</span>
          {visible.length > 0 && (
            <span className="text-[10px] bg-[#f59e0b] text-black font-bold px-1.5 py-0.2 rounded-full">
              {visible.length}
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-2 pt-0 border-t border-[#1f2937] flex flex-col gap-1.5 mt-1">
          {ANCILLARY_OPTIONS.map((opt) => {
            const isChecked = visible.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-[#1f2937] cursor-pointer text-[11px] text-gray-300 transition"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(opt.id)}
                  className="rounded border-gray-600 text-[#f59e0b] focus:ring-[#f59e0b] bg-[#0a0e1a]"
                />
                <span>{opt.icon}</span>
                <span className="truncate">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

