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
      if (res.ok) {
        const data = await res.json();
        const results = data?.results || [];
        setLiveResults(results);
      } else {
        setLiveResults([]);
      }
    } catch {
      /* silent fallback, never console.error */
      setLiveResults([]);
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
      if (res.ok) {
        const data = await res.json();
        const features = data?.features || [];
        setStacResults(features);
      } else {
        setStacResults([]);
      }
    } catch {
      /* silent fallback, never console.error */
      setStacResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111210]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111210] border border-[#242522] rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#242522] bg-[#111210]">
          <div>
            <h3 className="text-sm font-semibold text-[#F3F2EE]">
              NASA mission resources & live STAC explorer
            </h3>
            <p className="text-xs text-[#9A9B94] mt-0.5">
              Target: {activeArea.name} ({bbox.map((v) => v.toFixed(2)).join(', ')})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[#9A9B94] hover:text-[#F3F2EE] px-2 py-1 rounded border border-[#242522] hover:bg-[#181916] transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#242522] px-5 bg-[#181916]/50">
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'resources'
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-[#9A9B94] hover:text-[#F3F2EE]'
            }`}
          >
            Mission documentation
          </button>
          <button
            onClick={() => {
              setActiveTab('asf');
              if (liveResults.length === 0) handleQueryAsf();
            }}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'asf'
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-[#9A9B94] hover:text-[#F3F2EE]'
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
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-[#9A9B94] hover:text-[#F3F2EE]'
            }`}
          >
            NASA CMR STAC catalog
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
                  className="p-3 bg-[#181916] hover:bg-[#242522] border border-[#242522] hover:border-[#10B981]/50 rounded-md transition group block"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#F3F2EE] group-hover:text-[#10B981] transition-colors">
                      {r.name} ↗
                    </span>
                    <span className="text-[9px] bg-[#242522] text-[#9A9B94] px-1.5 py-0.5 rounded font-mono">
                      {r.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9A9B94] leading-relaxed">{r.desc}</p>
                </a>
              ))}
            </div>
          )}

          {activeTab === 'asf' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#181916] p-3 rounded-md border border-[#242522]">
                <div>
                  <div className="text-xs font-medium text-[#F3F2EE]">
                    Query NASA ASF DAAC Archive for {activeArea.name}
                  </div>
                  <div className="text-[11px] text-[#9A9B94] font-mono mt-0.5 tabular-nums">
                    Bounding box: [{bbox.join(', ')}]
                  </div>
                </div>
                <button
                  onClick={handleQueryAsf}
                  disabled={loading}
                  className="px-3 py-1.5 bg-[#242522] hover:bg-[#2C3345] text-[#F3F2EE] rounded-md text-xs font-medium border border-[#242522] hover:border-[#10B981] transition disabled:opacity-50"
                >
                  {loading ? 'Querying ASF...' : 'Re-Query'}
                </button>
              </div>

              {queryError && (
                <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-md text-xs text-red-300">
                  {queryError}
                </div>
              )}

              {liveResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#9A9B94]">
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
                        className="p-3 bg-[#181916] border border-[#242522] rounded-md flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[#F3F2EE] truncate font-medium">{name}</div>
                          <div className="text-[#9A9B94] text-[11px] mt-0.5">
                            {platform} · Acquired: {date}
                          </div>
                        </div>
                        {browseUrl && (
                          <a
                            href={browseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 text-[11px] text-[#10B981] hover:underline shrink-0"
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
              <div className="flex items-center justify-between bg-[#181916] p-3 rounded-md border border-[#242522]">
                <div>
                  <div className="text-xs font-medium text-[#F3F2EE]">
                    NASA CMR STAC SpatioTemporal Asset Catalog
                  </div>
                  <div className="text-[11px] text-[#9A9B94] font-mono mt-0.5">
                    Querying /api/stac-search with STAC 1.0 Spec
                  </div>
                </div>
                <button
                  onClick={handleQueryStac}
                  disabled={loading}
                  className="px-3 py-1.5 bg-[#242522] hover:bg-[#2C3345] text-[#F3F2EE] rounded-md text-xs font-medium border border-[#242522] hover:border-[#10B981] transition disabled:opacity-50"
                >
                  {loading ? 'Querying STAC...' : 'Re-Query'}
                </button>
              </div>

              {queryError && (
                <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-md text-xs text-red-300">
                  {queryError}
                </div>
              )}

              {stacResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#9A9B94]">
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
                        className="p-3 bg-[#181916] border border-[#242522] rounded-md flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[#F3F2EE] truncate font-medium">{id}</div>
                          <div className="text-[#9A9B94] text-[11px] mt-0.5">
                            {platform} · Datetime: {time}
                          </div>
                        </div>
                        {dataHref && (
                          <a
                            href={dataHref}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 text-[11px] text-[#10B981] hover:underline shrink-0"
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
        <div className="px-5 py-3 border-t border-[#242522] bg-[#181916]/50 flex justify-between items-center text-xs">
          <span className="text-[#9A9B94] text-[11px]">NASA Earth Science Data Systems (ESDIS)</span>
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
