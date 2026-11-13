'use client';

import { useState, useEffect, useRef } from 'react';
import type { StudyArea } from '@/types';
import { useSonification } from '@/hooks/useSonification';
import { useTimeSeries } from '@/hooks/useTimeSeries';

interface InspectorSidebarProps {
  area: StudyArea;
  activeLayerKey: string;
  onSelectLayer: (key: string) => void;
  ancillaryVisible: string[];
  onToggleAncillary: (layerId: string) => void;
}

const FREQUENCY_NOTES: Record<string, string> = {
  'L-Band': 'Penetrates dense forest canopy and deep soil layers to map ground deformation and standing water.',
  'S-Band': 'Penetrates light foliage; highly sensitive to crop morphology, paddy growth stages, and surface roughness.',
  'C-Band': 'Scatters off upper canopy crowns and rough surfaces; ideal for burn scar detection and all-weather flood mapping.',
};

const ANCILLARY_LAYERS = [
  { id: 'population', label: 'Human Settlements (GHSL Footprint)' },
  { id: 'agriculture', label: 'Agriculture (Crop & Paddy Mask)' },
  { id: 'infrastructure', label: 'Infrastructure (Roads & Transport Corridors)' },
];

export default function InspectorSidebar({
  area,
  activeLayerKey,
  onSelectLayer,
  ancillaryVisible,
  onToggleAncillary,
}: InspectorSidebarProps) {
  // Determine selected frequency tab (defaults to L-Band 24cm)
  const [selectedBand, setSelectedBand] = useState<string>('L-Band');

  // Sonification controls
  const { data: timeseriesData } = useTimeSeries(area.timeseries);
  const { play, stop, isPlaying, analyserRef } = useSonification();
  const [sonificationStep, setSonificationStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync selected frequency when changing study area
  useEffect(() => {
    if (activeLayerKey.startsWith('sband')) setSelectedBand('S-Band');
    else if (activeLayerKey.startsWith('cband')) setSelectedBand('C-Band');
    else setSelectedBand('L-Band');
  }, [activeLayerKey, area.id]);

  // Sonification timer step
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeseriesData && timeseriesData.dates.length > 0) {
      timer = setInterval(() => {
        setSonificationStep((prev) => {
          const next = (prev + 1) % timeseriesData.dates.length;
          const hhVal = timeseriesData.series.hh_mean?.[next] ?? -12;
          const cohVal = timeseriesData.series.coherence_mean?.[next] ?? 0.7;
          play(hhVal, cohVal);
          return next;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeseriesData, play]);

  // Mini-waveform visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#F59E0B';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else {
        // Flat resting line
        ctx.strokeStyle = '#222736';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, analyserRef]);

  const handleSonificationToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      if (timeseriesData && timeseriesData.dates.length > 0) {
        const hhVal = timeseriesData.series.hh_mean?.[sonificationStep] ?? -12;
        const cohVal = timeseriesData.series.coherence_mean?.[sonificationStep] ?? 0.7;
        play(hhVal, cohVal);
      } else {
        play(-10, 0.8);
      }
    }
  };

  const layerKeys = Object.keys(area.layers);

  // Available bands for this specific study area
  const bands = area.frequencies.map((f) => f.band);

  const handleFrequencySelect = (band: string) => {
    setSelectedBand(band);
    if (band === 'S-Band') {
      const sKey = layerKeys.find((k) => k.startsWith('sband'));
      if (sKey) onSelectLayer(sKey);
    } else if (band === 'C-Band') {
      const cKey = layerKeys.find((k) => k.startsWith('cband'));
      if (cKey) onSelectLayer(cKey);
    } else {
      const lKey = layerKeys.find((k) => !k.startsWith('sband') && !k.startsWith('cband')) || 'hh';
      onSelectLayer(lKey);
    }
  };

  return (
    <aside className="w-80 h-[calc(100vh-3.5rem)] bg-[#090A0F]/95 backdrop-blur-md border-r border-[#222736] flex flex-col z-30 overflow-y-auto select-none">
      {/* SECTION A: STUDY AREA CONTEXT & PROVENANCE */}
      <section className="p-4 border-b border-[#222736] flex flex-col gap-2.5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase">
              Study Area
            </span>
            {area.hometown && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12151E] border border-[#222736] text-[#F59E0B]">
                Hometown Focus
              </span>
            )}
          </div>
          <h2 className="text-base font-semibold text-[#F1F5F9] mt-0.5">{area.name}</h2>
          <p className="text-xs text-[#8A94A6] mt-0.5">{area.phenomenon}</p>
        </div>

        {/* 2-Sentence Plain-English Scientific Narrative */}
        <p className="text-xs text-[#8A94A6] leading-relaxed">
          {area.narrative || area.description}
        </p>

        {/* Provenance Row */}
        <div className="bg-[#12151E] border border-[#222736] rounded p-2.5 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8A94A6] uppercase">NASA / ISRO Provenance</span>
            <span className="font-mono text-[10px] text-[#F59E0B]">
              {area.provenance?.orbit_direction || 'Ascending'}
            </span>
          </div>

          <div className="font-mono text-[11px] text-[#F1F5F9] truncate" title={area.provenance?.granule_id}>
            ID: {area.provenance?.granule_id || 'ALAV2A278633410'}
          </div>

          <div className="text-[11px] text-[#8A94A6] truncate">
            {area.provenance?.platform || 'NISAR L-Band (24 cm)'}
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-[#222736] text-[11px]">
            <a
              href={area.provenance?.vertex_url || 'https://search.asf.alaska.edu/'}
              target="_blank"
              rel="noreferrer"
              className="text-[#F59E0B] hover:underline"
            >
              ASF Vertex ↗
            </a>
            <a
              href={area.provenance?.earthdata_search_url || 'https://search.earthdata.nasa.gov/'}
              target="_blank"
              rel="noreferrer"
              className="text-[#8A94A6] hover:text-[#F1F5F9] hover:underline"
            >
              Earthdata Search ↗
            </a>
          </div>
        </div>
      </section>

      {/* SECTION B: RADAR CHANNEL & FREQUENCY */}
      <section className="p-4 border-b border-[#222736] flex flex-col gap-3">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase">
            Radar Frequency Band
          </span>
          {/* Frequency Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#12151E] border border-[#222736] rounded p-0.5 mt-1.5">
            {['L-Band', 'S-Band', 'C-Band'].map((band) => {
              const isAvailable = bands.some((b) => b.toLowerCase().includes(band.toLowerCase()));
              const isSelected = selectedBand === band;
              return (
                <button
                  key={band}
                  onClick={() => handleFrequencySelect(band)}
                  disabled={!isAvailable}
                  className={`py-1 text-[11px] font-medium rounded transition-colors text-center ${
                    isSelected
                      ? 'bg-[#222736] text-[#F59E0B]'
                      : isAvailable
                      ? 'text-[#8A94A6] hover:text-[#F1F5F9]'
                      : 'text-[#8A94A6]/30 cursor-not-allowed'
                  }`}
                >
                  {band}
                </button>
              );
            })}
          </div>

          {/* Plain-English Penetration Note */}
          <p className="text-[11px] text-[#8A94A6] leading-snug mt-2 italic">
            {FREQUENCY_NOTES[selectedBand] || FREQUENCY_NOTES['L-Band']}
          </p>
        </div>

        {/* Radio-style List for Polarization Channels */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase">
            Radar Channels
          </span>
          <div className="flex flex-col gap-1">
            {layerKeys.map((key) => {
              const layer = area.layers[key];
              const isSelected = key === activeLayerKey;
              return (
                <button
                  key={key}
                  onClick={() => onSelectLayer(key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors border ${
                    isSelected
                      ? 'bg-[#12151E] border-[#F59E0B]/50 text-[#F1F5F9]'
                      : 'border-transparent text-[#8A94A6] hover:bg-[#12151E]/60 hover:text-[#F1F5F9]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Clean radio indicator */}
                    <div
                      className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#F59E0B]' : 'border-[#222736]'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />}
                    </div>
                    <span className="text-xs truncate">{layer.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#8A94A6] shrink-0 ml-2">
                    {layer.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION C: CONTEXT OVERLAYS & SURFACE SONIFICATION */}
      <section className="p-4 flex flex-col gap-3.5">
        {/* Context Overlays */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase">
            Context Overlays
          </span>
          <div className="flex flex-col gap-1">
            {ANCILLARY_LAYERS.map((layer) => {
              const isChecked = ancillaryVisible.includes(layer.id);
              return (
                <label
                  key={layer.id}
                  className="flex items-center gap-2.5 py-1 px-1 rounded hover:bg-[#12151E] cursor-pointer text-xs text-[#8A94A6] hover:text-[#F1F5F9] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleAncillary(layer.id)}
                    className="w-3.5 h-3.5 rounded border-[#222736] bg-[#12151E] text-[#F59E0B] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="truncate">{layer.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Surface Sonification Single-Row Player */}
        <div className="border-t border-[#222736] pt-3 flex flex-col gap-2">
          <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase">
            Surface Sonification
          </span>

          <div className="bg-[#12151E] border border-[#222736] rounded p-2.5 flex items-center justify-between gap-3">
            <button
              onClick={handleSonificationToggle}
              className={`px-3 py-1 text-xs font-medium rounded border transition-colors shrink-0 ${
                isPlaying
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]'
                  : 'bg-[#222736] text-[#F1F5F9] border-[#222736] hover:border-[#8A94A6]'
              }`}
            >
              {isPlaying ? 'Pause Audio' : 'Play Audio'}
            </button>

            {/* Mini Waveform Visualizer */}
            <canvas
              ref={canvasRef}
              width={110}
              height={26}
              className="bg-[#090A0F] border border-[#222736] rounded shrink-0"
            />
          </div>

          <p className="text-[10px] text-[#8A94A6] leading-tight">
            Synthesizes radar backscatter timeseries into audio frequency (60 Hz – 1.2 kHz).
          </p>
        </div>
      </section>
    </aside>
  );
}
