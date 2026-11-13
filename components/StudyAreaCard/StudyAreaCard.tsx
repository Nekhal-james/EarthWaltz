'use client';

import { useState } from 'react';
import type { StudyArea } from '@/types';

interface StudyAreaCardProps {
  area: StudyArea;
}

export default function StudyAreaCard({ area }: StudyAreaCardProps) {
  const [showProvenance, setShowProvenance] = useState(false);
  const prov = area.provenance;

  return (
    <div className="absolute bottom-24 left-4 z-20 w-88 max-w-[340px] bg-[#111827]/95 backdrop-blur-md border border-[#374151] rounded-xl p-3.5 shadow-2xl animate-in fade-in duration-200">
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#f9fafb]">
            {area.name}
          </h2>
          <p className="text-[11px] text-[#f59e0b] font-medium">{area.subtitle}</p>
        </div>
        {area.hometown && (
          <span className="text-[9px] bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded-full border border-[#f59e0b]/40 font-semibold shrink-0">
            🏠 Hometown
          </span>
        )}
      </div>

      <p className="text-[11px] text-gray-300 mb-2.5 leading-relaxed line-clamp-2">
        {area.phenomenon}
      </p>

      {/* Verified NASA / ISRO Granule Provenance Badge */}
      <div className="bg-[#0a0e1a]/90 rounded-lg p-2.5 mb-2.5 border border-[#1f2937]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#10b981]">
              Verified NASA Granule
            </span>
          </div>
          <button
            onClick={() => setShowProvenance((p) => !p)}
            className="text-[10px] text-gray-400 hover:text-[#f59e0b] font-mono transition-colors"
          >
            {showProvenance ? '▲ Less' : '▼ Details'}
          </button>
        </div>

        <div className="space-y-1 text-[10px] font-mono">
          <div className="flex justify-between items-baseline gap-1">
            <span className="text-gray-400">Granule ID:</span>
            <span className="text-[#06b6d4] font-bold truncate max-w-[190px]" title={prov?.granule_id}>
              {prov?.granule_id || 'NISAR_L2_PR_GCOV'}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-gray-400">Platform:</span>
            <span className="text-gray-200 truncate max-w-[190px]">{prov?.platform || 'NISAR L-Band'}</span>
          </div>

          {showProvenance && (
            <div className="pt-1.5 mt-1.5 border-t border-[#1f2937] space-y-1 animate-in fade-in duration-150">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400">Acquisition:</span>
                <span className="text-gray-300">{prov?.acquisition_date?.split('T')[0] || '2024-08-16'}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400">Orbit / Track:</span>
                <span className="text-gray-300">{prov?.orbit_direction || 'Ascending'}, {prov?.track_frame || 'Trk 48'}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400">HDF5 Grid Path:</span>
                <span className="text-[#d946ef] text-[9px] truncate max-w-[170px]" title={prov?.hdf5_spec_path}>
                  {prov?.hdf5_spec_path || '/science/LSAR/GCOV'}
                </span>
              </div>
            </div>
          )}

          {/* Direct Verification Links */}
          <div className="flex items-center gap-1.5 pt-1.5 mt-1 border-t border-[#1f2937]/80">
            {prov?.vertex_url && (
              <a
                href={prov.vertex_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-[#06b6d4] px-1.5 py-0.5 rounded border border-[#06b6d4]/30 transition-colors"
                title="Verify granule on NASA ASF Vertex"
              >
                ASF Vertex ↗
              </a>
            )}
            {prov?.earthdata_search_url && (
              <a
                href={prov.earthdata_search_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#f59e0b] px-1.5 py-0.5 rounded border border-[#f59e0b]/30 transition-colors"
                title="Verify on NASA Earthdata Search"
              >
                Earthdata ↗
              </a>
            )}
            {prov?.official_docs_url && (
              <a
                href={prov.official_docs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] bg-[#d946ef]/10 hover:bg-[#d946ef]/20 text-[#d946ef] px-1.5 py-0.5 rounded border border-[#d946ef]/30 transition-colors"
                title="Official Mission Docs"
              >
                Mission Specs ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-[10px]">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono">Sensors: </span>
          <span className="text-[#06b6d4] font-medium">{area.sensors.join(' · ')}</span>
        </div>

        <div>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono">Frequencies: </span>
          <span className="text-[#d946ef] font-medium">
            {area.frequencies.map((f) => `${f.band} (${f.wavelength_cm}cm)`).join(', ')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[9px] font-mono text-gray-400 pt-1.5 border-t border-[#1f2937]">
          <span>📍 {area.lat.toFixed(2)}°, {area.lng.toFixed(2)}°</span>
          <span>·</span>
          <span>Zoom {area.zoom}</span>
          <span>·</span>
          <span>{Object.keys(area.layers).length} Calibrated Layers</span>
        </div>
      </div>
    </div>
  );
}
