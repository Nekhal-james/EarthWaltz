'use client';

import { useState } from 'react';
import type { StudyArea } from '@/types';

interface MissionResourcesModalProps {
  activeArea: StudyArea;
  onClose: () => void;
}

const OFFICIAL_RESOURCES = [
  {
    name: 'NASA Earthdata Search',
    badge: 'NASA ESDIS',
    desc: 'Discovery, search, comparison, and visualization across NASA Earth science data holdings.',
    url: 'https://search.earthdata.nasa.gov/search',
  },
  {
    name: 'ASF Data Search Vertex',
    badge: 'NASA ASF DAAC',
    desc: 'The official NASA archive of SAR satellite data (NISAR, ALOS PALSAR, Sentinel-1, UAVSAR).',
    url: 'https://search.asf.alaska.edu/',
  },
  {
    name: 'NISAR Data User Guide',
    badge: 'NASA / JPL / ASF',
    desc: 'Comprehensive reference for NISAR L2 GCOV, GUNW, and GOFF HDF5 science data structures.',
    url: 'https://asf.alaska.edu/data-sets/sar-data-sets/nisar/',
  },
  {
    name: 'NASA ARSET SAR Trainings',
    badge: 'NASA Applied Sciences',
    desc: 'Introductory to advanced radar remote sensing courses on disasters, ecosystems, and water resources.',
    url: 'https://appliedsciences.nasa.gov/what-we-do/capacity-building/arset',
  },
  {
    name: 'NASA UAVSAR Postcards',
    badge: 'NASA JPL Airborne',
    desc: 'Airborne L-band polarimetric false-color composites depicting wetlands, faults, and cryosphere.',
    url: 'https://uavsar.jpl.nasa.gov/science/postcards/',
  },
  {
    name: 'CSA RADARSAT Constellation (RCM)',
    badge: 'Canadian Space Agency',
    desc: 'Canada’s C-band triple-satellite constellation for ecosystem monitoring and maritime surveillance.',
    url: 'https://www.asc-csa.gc.ca/eng/satellites/radarsat/',
  },
  {
    name: 'CONAE SAOCOM Catalogue',
    badge: 'Argentina Space Agency',
    desc: 'Full-polarimetric L-band SAR mission for agriculture, soil moisture, and disaster mapping.',
    url: 'https://catalog.saocom.conae.gov.ar/',
  },
  {
    name: 'NASA Global Imagery Browse Services (GIBS)',
    badge: 'NASA EOSDIS',
    desc: 'Full-resolution, daily, true-color and geophysical satellite imagery across the globe.',
    url: 'https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs',
  },
];

export default function MissionResourcesModal({ activeArea, onClose }: MissionResourcesModalProps) {
  const [activeTab, setActiveTab] = useState<'resources' | 'stac'>('resources');
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const handleQueryAsf = async () => {
    setLoading(true);
    setQueryError(null);
    try {
      const bboxStr = activeArea.bbox.join(',');
      const res = await fetch(`/api/asf-proxy?bbox=${encodeURIComponent(bboxStr)}&platform=ALOS&maxResults=5`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const features = data?.features || (Array.isArray(data) && data[0]) || [];
      setLiveResults(features);
    } catch (err: any) {
      setQueryError(err.message || 'Error querying live ASF proxy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#374151] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937] bg-[#0a0e1a]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛰️</span>
            <div>
              <h2 className="text-base font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                NASA Mission Resources & Live STAC Explorer
              </h2>
              <p className="text-xs text-[#06b6d4]">
                Target: {activeArea.name} ({activeArea.bbox.map((v) => v.toFixed(2)).join(', ')})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1f2937] hover:bg-[#374151] flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1f2937] px-6 bg-[#0e1626]">
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'resources'
                ? 'border-[#f59e0b] text-[#f59e0b]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            📚 Official Mission Resources & Documentation
          </button>
          <button
            onClick={() => setActiveTab('stac')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'stac'
                ? 'border-[#06b6d4] text-[#06b6d4]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            ⚡ Live ASF Vertex & CMR STAC Query
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'resources' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OFFICIAL_RESOURCES.map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-[#0a0e1a]/80 hover:bg-[#1a2333] border border-[#1f2937] hover:border-[#f59e0b]/50 rounded-xl transition group block"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white group-hover:text-[#f59e0b] transition-colors">
                      {r.name} ↗
                    </span>
                    <span className="text-[9px] bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 px-1.5 py-0.5 rounded font-mono">
                      {r.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{r.desc}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#0a0e1a] p-4 rounded-xl border border-[#1f2937]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono">
                      Query NASA ASF DAAC Granules (Live Vertex API)
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Coordinates: Bounding Box [{activeArea.bbox.join(', ')}]
                    </p>
                  </div>
                  <button
                    onClick={handleQueryAsf}
                    disabled={loading}
                    className="px-4 py-2 bg-[#06b6d4] hover:bg-[#0891b2] text-black font-bold text-xs rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Querying NASA...' : '🛰️ Query Live Granules'}
                  </button>
                </div>

                {queryError && (
                  <p className="text-xs text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-800">
                    {queryError}
                  </p>
                )}
              </div>

              {/* Verified active granule banner */}
              <div className="bg-[#0a0e1a] p-4 rounded-xl border border-[#06b6d4]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono text-[#06b6d4] uppercase tracking-wider">
                    Target Seed Granule Provenance
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    Acquired: {activeArea.provenance?.acquisition_date || '2024-08-16'}
                  </span>
                </div>
                <div className="font-mono text-xs space-y-1">
                  <p className="text-white font-bold">{activeArea.provenance?.granule_id}</p>
                  <p className="text-gray-300 text-[11px]">
                    Platform: <span className="text-[#f59e0b]">{activeArea.provenance?.platform}</span>
                  </p>
                  <p className="text-gray-400 text-[10px] truncate">
                    WKT: {activeArea.provenance?.wkt_footprint}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <a
                      href={activeArea.provenance?.vertex_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-[#1f2937] hover:bg-[#374151] text-[#06b6d4] text-[10px] rounded border border-[#06b6d4]/40"
                    >
                      Open in ASF Vertex ↗
                    </a>
                    <a
                      href={activeArea.provenance?.earthdata_search_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-[#1f2937] hover:bg-[#374151] text-[#f59e0b] text-[10px] rounded border border-[#f59e0b]/40"
                    >
                      Earthdata Search ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Results from live query */}
              {liveResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-300 font-mono">
                    Returned NASA Granules ({liveResults.length})
                  </h4>
                  {liveResults.map((item, idx) => {
                    const props = item?.properties || item;
                    const name = props?.sceneName || props?.granuleName || `Granule #${idx + 1}`;
                    return (
                      <div key={idx} className="bg-[#0a0e1a] p-3 rounded-lg border border-[#1f2937] text-xs font-mono">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[#06b6d4] font-bold">{name}</span>
                          <span className="text-gray-400 text-[10px]">{props?.startTime || props?.sceneDate || ''}</span>
                        </div>
                        <div className="flex gap-3 text-[10px] text-gray-400">
                          <span>Platform: {props?.platform || 'SAR'}</span>
                          <span>Beam: {props?.beamModeType || props?.beamMode || 'Standard'}</span>
                          <span>Orbit: {props?.flightDirection || 'Ascending'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
