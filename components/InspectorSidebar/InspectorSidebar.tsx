'use client';

import { useState, useEffect, useRef } from 'react';
import type { StudyArea } from '@/types';
import { useSonification } from '@/hooks/useSonification';
import { useTimeSeries } from '@/hooks/useTimeSeries';

interface BandSpec {
  wavelength: string;
  frequency: string;
  depth: string;
  scatterers: string;
  note: string;
}

const BAND_SPECS: Record<string, BandSpec> = {
  'L-Band': {
    wavelength: '24.0 cm',
    frequency: '1.25 GHz',
    depth: '~1.5 m (Soil & Full Forest Canopy)',
    scatterers: 'Trunks, soil moisture, sub-canopy standing water',
    note: 'Deepest penetration. Penetrates dense forest canopy and deep soil layers to map ground deformation and hidden standing water.',
  },
  'S-Band': {
    wavelength: '9.3 cm',
    frequency: '3.20 GHz',
    depth: '~30 cm (Crop Foliage & Upper Canopy)',
    scatterers: 'Crop stalks, leaf clusters, paddy morphology',
    note: 'Moderate penetration. Highly sensitive to crop morphology, paddy growth stages, leaf water content, and surface roughness.',
  },
  'C-Band': {
    wavelength: '5.6 cm',
    frequency: '5.40 GHz',
    depth: '~5 cm (Top of Canopy & Rough Surface)',
    scatterers: 'Canopy crowns, rough soil, burn scars, surface ripples',
    note: 'Surface scatterer. Scatters off upper canopy crowns and rough surfaces; ideal for burn scar detection and all-weather flood mapping.',
  },
};

const ANCILLARY_LAYERS = [
  { id: 'population', label: 'Human settlements (GHSL footprint)' },
  { id: 'agriculture', label: 'Agriculture (Crop & paddy mask)' },
  { id: 'infrastructure', label: 'Infrastructure (Roads & transport corridors)' },
];

interface InspectorSidebarProps {
  area: StudyArea;
  activeLayerKey: string;
  onSelectLayer: (key: string) => void;
  ancillaryVisible: string[];
  onToggleAncillary: (layerId: string) => void;
  selectedBand?: string;
  onSelectBand?: (band: string) => void;
}

export default function InspectorSidebar({
  area,
  activeLayerKey,
  onSelectLayer,
  ancillaryVisible,
  onToggleAncillary,
  selectedBand: propBand,
  onSelectBand,
}: InspectorSidebarProps) {
  // Determine selected frequency tab (defaults to L-Band 24cm)
  const [localBand, setLocalBand] = useState<string>('L-Band');
  const selectedBand = propBand || localBand;

  // Sonification controls
  const { data: timeseriesData } = useTimeSeries(area.timeseries);
  const { play, stop, isPlaying, analyserRef } = useSonification();
  const [sonificationStep, setSonificationStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync selected frequency when changing study area
  useEffect(() => {
    let band = 'L-Band';
    if (activeLayerKey.startsWith('sband')) band = 'S-Band';
    else if (activeLayerKey.startsWith('cband')) band = 'C-Band';
    setLocalBand(band);
    onSelectBand?.(band);
  }, [activeLayerKey, area.id, onSelectBand]);

  // Sonification timer step
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeseriesData?.dates?.length) {
      timer = setInterval(() => {
        setSonificationStep((prev) => (prev + 1) % timeseriesData.dates.length);
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeseriesData]);

  // Render audio waveform visualizer onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!running) return;
      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        dataArray.fill(0);
      }

      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255;
        const barHeight = Math.max(2, v * canvas.height);

        ctx.fillStyle = isPlaying ? '#2563EB' : '#CBD5E1';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, analyserRef]);

  const handleSonificationToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      const series =
        timeseriesData?.series?.hh_mean ||
        timeseriesData?.series?.hv_mean ||
        [-12, -11, -9, -7, -6, -8, -10, -11, -12];
      const meanDb = series[0] ?? -12;
      const meanCoh = timeseriesData?.series?.coherence_mean?.[0] ?? 0.72;
      play(meanDb, meanCoh);
    }
  };

  const layerKeys = Object.keys(area.layers);

  const handleFrequencySelect = (band: string) => {
    setLocalBand(band);
    onSelectBand?.(band);
    if (band === 'S-Band') {
      const sKey = layerKeys.find((k) => k.startsWith('sband'));
      if (sKey) onSelectLayer(sKey);
      else onSelectLayer('hh');
    } else if (band === 'C-Band') {
      const cKey = layerKeys.find((k) => k.startsWith('cband'));
      if (cKey) onSelectLayer(cKey);
      else onSelectLayer('hv');
    } else {
      const lKey = layerKeys.find((k) => !k.startsWith('sband') && !k.startsWith('cband')) || 'hh';
      onSelectLayer(lKey);
    }
  };

  return (
    <aside className="w-80 h-[calc(100vh-3.5rem)] bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col z-30 overflow-y-auto select-none font-sans shadow-sm">
      {/* SECTION A: STUDY AREA CONTEXT & PROVENANCE */}
      <section className="p-4 border-b border-[#E2E8F0] flex flex-col gap-2.5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B]">
              Study area
            </span>
            {area.hometown && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] font-semibold">
                Hometown Focus
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-[#0F172A] mt-0.5">{area.name}</h2>
          <p className="text-xs text-[#64748B] mt-0.5">{area.phenomenon}</p>
        </div>

        {/* Plain-English Scientific Narrative */}
        <p className="text-xs text-[#334155] leading-relaxed">
          {area.narrative || area.description}
        </p>

        {/* Provenance Card */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B]">Data provenance</span>
            <span className="text-[10px] text-[#2563EB] font-semibold">
              {area.provenance?.orbit_direction || 'Ascending'}
            </span>
          </div>

          <div className="font-mono text-[11px] text-[#0F172A] truncate tabular-nums" title={area.provenance?.granule_id}>
            ID: {area.provenance?.granule_id || 'ALAV2A278633410'}
          </div>

          <div className="text-[11px] text-[#64748B] truncate">
            {area.provenance?.platform || 'NISAR L-Band (24 cm)'}
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-[#E2E8F0] text-[11px]">
            <a
              href={area.provenance?.vertex_url || 'https://search.asf.alaska.edu/'}
              target="_blank"
              rel="noreferrer"
              className="text-[#2563EB] font-medium hover:underline"
            >
              ASF Vertex ↗
            </a>
            <a
              href={area.provenance?.earthdata_search_url || 'https://search.earthdata.nasa.gov/'}
              target="_blank"
              rel="noreferrer"
              className="text-[#64748B] hover:text-[#0F172A] hover:underline"
            >
              Earthdata Search ↗
            </a>
          </div>
        </div>
      </section>

      {/* SECTION B: RADAR CHANNEL & FREQUENCY */}
      <section className="p-4 border-b border-[#E2E8F0] flex flex-col gap-3">
        <div>
          <span className="text-[11px] font-semibold text-[#64748B]">
            Radar frequency
          </span>
          {/* Frequency Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-0.5 mt-1.5">
            {['L-Band', 'S-Band', 'C-Band'].map((band) => {
              const isSelected = selectedBand === band;
              return (
                <button
                  key={band}
                  onClick={() => handleFrequencySelect(band)}
                  className={`py-1 text-[11px] font-medium rounded-md transition-colors text-center ${
                    isSelected
                      ? 'bg-[#FFFFFF] text-[#0F172A] shadow-sm font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]/50'
                  }`}
                >
                  {band}
                </button>
              );
            })}
          </div>

          {/* Dynamic Frequency Physics Spec */}
          {BAND_SPECS[selectedBand] && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Wavelength:</span>
                <span className="font-mono text-[#2563EB] font-bold tabular-nums">
                  {BAND_SPECS[selectedBand].wavelength} ({BAND_SPECS[selectedBand].frequency})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Penetration depth:</span>
                <span className="text-[#0F172A] font-medium">{BAND_SPECS[selectedBand].depth}</span>
              </div>
              <p className="text-[10px] text-[#64748B] leading-snug pt-1.5 border-t border-[#E2E8F0]">
                {BAND_SPECS[selectedBand].note}
              </p>
            </div>
          )}
        </div>

        {/* Radio-style List for Polarization Channels */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-[#64748B]">
            Radar channels
          </span>
          <div className="flex flex-col gap-1">
            {layerKeys.map((key) => {
              const layer = area.layers[key];
              const isSelected = key === activeLayerKey;
              return (
                <button
                  key={key}
                  onClick={() => onSelectLayer(key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors border ${
                    isSelected
                      ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A] font-medium'
                      : 'border-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#2563EB]' : 'border-[#CBD5E1]'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                    </div>
                    <span className="text-xs truncate">{layer.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#64748B] shrink-0 ml-2">
                    {layer.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION C: CONTEXT OVERLAYS & SURFACE SONIFICATION */}
      <section className="p-4 pb-14 flex flex-col gap-3.5">
        {/* Context Overlays */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-[#64748B]">
            Map overlays
          </span>
          <div className="flex flex-col gap-1">
            {ANCILLARY_LAYERS.map((layer) => {
              const isChecked = ancillaryVisible.includes(layer.id);
              return (
                <label
                  key={layer.id}
                  className="flex items-center gap-2.5 py-1 px-1 rounded-md hover:bg-[#F8FAFC] cursor-pointer text-xs text-[#475569] hover:text-[#0F172A] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleAncillary(layer.id)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="truncate">{layer.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Surface Sonification Single-Row Player */}
        <div className="border-t border-[#E2E8F0] pt-3 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-[#64748B]">
            Audio sonification
          </span>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 flex items-center justify-between gap-3">
            <button
              onClick={handleSonificationToggle}
              className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors shrink-0 ${
                isPlaying
                  ? 'bg-[#EF4444] text-white border-[#EF4444]'
                  : 'bg-[#2563EB] text-white border-[#2563EB] hover:bg-[#1D4ED8]'
              }`}
            >
              {isPlaying ? 'Pause Audio' : 'Play Audio'}
            </button>

            {/* Mini Waveform Visualizer */}
            <canvas
              ref={canvasRef}
              width={110}
              height={26}
              className="bg-[#F1F5F9] border border-[#E2E8F0] rounded shrink-0"
            />
          </div>

          <p className="text-[10px] text-[#64748B] leading-tight">
            Synthesizes radar backscatter timeseries into audio frequency (60 Hz – 1.2 kHz).
          </p>
        </div>
      </section>
    </aside>
  );
}
