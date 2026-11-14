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
  const [activeTab, setActiveTab] = useState<'resources' | 'asf' | 'stac'>('resources');
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [stacResults, setStacResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const bbox = activeArea.bbox || [
    activeArea.lng - 0.5,
    activeArea.lat - 0.5,
    activeArea.lng + 0.5,
    activeArea.lat + 0.5,
  ];

  // Live Query via /api/asf-proxy
  const handleQueryAsf = async () => {
    setLoading(true);
    setQueryError(null);
    try {
      const bboxStr = bbox.join(',');
      const res = await fetch(`/api/asf-proxy?bbox=${encodeURIComponent(bboxStr)}&platform=ALOS&maxResults=6`);
      if (!res.ok) throw new Error(`ASF API returned HTTP ${res.status}`);
      const data = await res.json();
      const results = data?.results || [];
      setLiveResults(results);
    } catch (err: any) {
      setQueryError(err.message || 'Error querying live ASF proxy');
    } finally {
      setLoading(false);
    }
  };

  // Live Query via /api/stac-search
  const handleQueryStac = async () => {
    setLoading(true);
    setQueryError(null);
    try {
      const bboxStr = bbox.join(',');
      const res = await fetch(`/api/stac-search?bbox=${encodeURIComponent(bboxStr)}&limit=6`);
      if (!res.ok) throw new Error(`STAC API returned HTTP ${res.status}`);
      const data = await res.json();
      const features = data?.features || [];
      setStacResults(features);
    } catch (err: any) {
      setQueryError(err.message || 'Error querying live CMR STAC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090A0F]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#090A0F] border border-[#222736] rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#222736] bg-[#090A0F]">
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F9]">
              NASA Mission Resources and Live STAC Explorer
            </h3>
            <p className="text-xs text-[#8A94A6] mt-0.5">
              Target: {activeArea.name} ({bbox.map((v) => v.toFixed(2)).join(', ')})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono text-[#8A94A6] hover:text-[#F1F5F9] px-2 py-1 rounded border border-[#222736] hover:bg-[#12151E] transition-colors"
          >
            Esc / Close
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#222736] px-5 bg-[#12151E]/50">
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'resources'
                ? 'border-[#F59E0B] text-[#F59E0B]'
                : 'border-transparent text-[#8A94A6] hover:text-[#F1F5F9]'
            }`}
          >
            Mission Documentation
          </button>
          <button
            onClick={() => {
              setActiveTab('asf');
              if (liveResults.length === 0) handleQueryAsf();
            }}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'asf'
                ? 'border-[#F59E0B] text-[#F59E0B]'
                : 'border-transparent text-[#8A94A6] hover:text-[#F1F5F9]'
            }`}
          >
            NASA ASF Vertex API
          </button>
          <button
            onClick={() => {
              setActiveTab('stac');
              if (stacResults.length === 0) handleQueryStac();
            }}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'stac'
                ? 'border-[#F59E0B] text-[#F59E0B]'
                : 'border-transparent text-[#8A94A6] hover:text-[#F1F5F9]'
            }`}
          >
            NASA CMR STAC Catalog
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'resources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OFFICIAL_RESOURCES.map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#12151E] hover:bg-[#1A1F2C] border border-[#222736] hover:border-[#F59E0B]/50 rounded transition group block"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#F1F5F9] group-hover:text-[#F59E0B] transition-colors">
                      {r.name} ↗
                    </span>
                    <span className="text-[9px] bg-[#222736] text-[#8A94A6] px-1.5 py-0.5 rounded font-mono">
                      {r.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A94A6] leading-relaxed">{r.desc}</p>
                </a>
              ))}
            </div>
          )}

          {activeTab === 'asf' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#12151E] p-3 rounded border border-[#222736]">
                <div>
                  <div className="text-xs font-medium text-[#F1F5F9]">
                    Query NASA ASF DAAC Archive for {activeArea.name}
                  </div>
                  <div className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                    Bounding Box: [{bbox.join(', ')}]
                  </div>
                </div>
                <button
                  onClick={handleQueryAsf}
                  disabled={loading}
                  className="px-3 py-1.5 bg-[#222736] hover:bg-[#2C3345] text-[#F1F5F9] rounded text-xs font-medium border border-[#222736] hover:border-[#F59E0B] transition disabled:opacity-50 font-mono"
                >
                  {loading ? 'Querying ASF...' : 'Re-Query'}
                </button>
              </div>

              {queryError && (
                <div className="p-3 bg-red-950/40 border border-red-800/40 rounded text-xs text-red-300">
                  {queryError}
                </div>
              )}

              {liveResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#8A94A6]">
                    ASF DAAC Granules Returned ({liveResults.length}):
                  </div>
                  {liveResults.map((g: any, i: number) => {
                    const name = g.granuleName || g.sceneName || `Granule ${i + 1}`;
                    const date = g.startTime || '2024';
                    const platform = g.platform || 'NISAR L-Band Surrogate';
                    const browse = g.browse || [];
                    const browseUrl = Array.isArray(browse) && browse.length > 0 ? browse[0] : null;

                    return (
                      <div
                        key={i}
                        className="p-3 bg-[#12151E] border border-[#222736] rounded flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[#F1F5F9] truncate font-medium">{name}</div>
                          <div className="text-[#8A94A6] text-[11px] mt-0.5">
                            {platform} · Acquired: {date}
                          </div>
                        </div>
                        {browseUrl && (
                          <a
                            href={browseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 text-[11px] font-mono text-[#F59E0B] hover:underline shrink-0"
                          >
                            Browse Raster ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stac' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#12151E] p-3 rounded border border-[#222736]">
                <div>
                  <div className="text-xs font-medium text-[#F1F5F9]">
                    NASA CMR STAC SpatioTemporal Asset Catalog
                  </div>
                  <div className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                    Querying /api/stac-search with STAC 1.0 Spec
                  </div>
                </div>
                <button
                  onClick={handleQueryStac}
                  disabled={loading}
                  className="px-3 py-1.5 bg-[#222736] hover:bg-[#2C3345] text-[#F1F5F9] rounded text-xs font-medium border border-[#222736] hover:border-[#F59E0B] transition disabled:opacity-50 font-mono"
                >
                  {loading ? 'Querying STAC...' : 'Re-Query'}
                </button>
              </div>

              {queryError && (
                <div className="p-3 bg-red-950/40 border border-red-800/40 rounded text-xs text-red-300">
                  {queryError}
                </div>
              )}

              {stacResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#8A94A6]">
                    STAC Features Returned ({stacResults.length}):
                  </div>
                  {stacResults.map((feat: any, i: number) => {
                    const id = feat.id || `Item ${i + 1}`;
                    const time = feat.properties?.datetime || feat.properties?.start_time || '2024';
                    const platform = feat.properties?.platform || feat.properties?.title || 'NISAR / ALOS';
                    const dataHref = feat.assets?.data?.href || feat.links?.[0]?.href;

                    return (
                      <div
                        key={i}
                        className="p-3 bg-[#12151E] border border-[#222736] rounded flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[#F1F5F9] truncate font-medium">{id}</div>
                          <div className="text-[#8A94A6] text-[11px] mt-0.5">
                            {platform} · Datetime: {time}
                          </div>
                        </div>
                        {dataHref && (
                          <a
                            href={dataHref}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 text-[11px] font-mono text-[#F59E0B] hover:underline shrink-0"
                          >
                            STAC Asset ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#222736] bg-[#12151E]/40 flex justify-between items-center text-xs">
          <span className="text-[#8A94A6] font-mono text-[11px]">NASA Earth Science Data Systems (ESDIS)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#222736] hover:bg-[#2c3345] text-[#F1F5F9] text-xs font-medium rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
