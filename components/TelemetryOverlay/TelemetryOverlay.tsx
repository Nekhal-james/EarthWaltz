'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import type { LayerInfo, StudyArea } from '@/types';

interface TelemetryOverlayProps {
  activeLayer: LayerInfo | null;
  area: StudyArea;
  cursorCoords?: { lat: number; lng: number } | null;
}

export default function TelemetryOverlay({ activeLayer, area, cursorCoords }: TelemetryOverlayProps) {
  const telemetryPath = activeLayer?.telemetry ?? null;
  const coherencePath = area.layers.coherence?.telemetry ?? null;

  const { data: primaryData, lookup: primaryLookup, loading: primaryLoading } = useTelemetry(telemetryPath);
  const { data: cohData, lookup: cohLookup } = useTelemetry(coherencePath);

  const [mouseNorm, setMouseNorm] = useState<{ x: number; y: number } | null>(null);

  // If map provides geographic cursorCoords, map them into [0,1] normalized bounds of the study area raster
  useEffect(() => {
    if (cursorCoords) {
      const delta = 0.5;
      const west = area.lng - delta;
      const east = area.lng + delta;
      const south = area.lat - delta;
      const north = area.lat + delta;

      const normX = (cursorCoords.lng - west) / (east - west);
      const normY = (north - cursorCoords.lat) / (north - south);

      if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
        setMouseNorm({ x: normX, y: normY });
        return;
      }
    }

    // Fallback: window mouse event
    const handleWindowMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = Math.max(0, Math.min(1, e.clientX / w));
      const ny = Math.max(0, Math.min(1, e.clientY / h));
      setMouseNorm({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, [cursorCoords, area]);

  const activeNorm = mouseNorm || { x: 0.5, y: 0.5 };
  const primaryVal = primaryLookup(activeNorm.x, activeNorm.y);
  const cohVal = cohLookup(activeNorm.x, activeNorm.y);

  // Calculate physics metrics
  const displayVal = primaryVal?.value ?? primaryData?.min ?? -12.5;
  const unit = primaryVal?.unit ?? primaryData?.unit ?? 'dB';
  const coherenceScore = cohVal?.value ?? (unit === 'coherence' ? displayVal : 0.72);

  // LOS Displacement calculation
  // For InSAR phase (rad): d = (lambda / 4pi) * phi. For NISAR L-band (lambda = 24cm), d = 1.91 * phi cm
  const losDisplacementCm = useMemo(() => {
    if (unit === 'rad') {
      return (displayVal * 1.91).toFixed(2);
    }
    if (unit === 'm') {
      return (displayVal * 100).toFixed(1);
    }
    return null;
  }, [displayVal, unit]);

  // Scattering Mechanism classification
  const mechanism = useMemo(() => {
    if (unit === 'rad') {
      return {
        label: 'Interferometric Phase Fringe',
        sub: 'Centimetric Surface Deformation',
        color: 'bg-indigo-900/70 text-indigo-300 border-indigo-500/50',
      };
    }
    if (unit === 'm') {
      return {
        label: 'Glacier Flow Vector (GOFF)',
        sub: 'Ground Offset Displacement',
        color: 'bg-blue-900/70 text-blue-300 border-blue-500/50',
      };
    }
    if (unit === 'coherence') {
      if (displayVal > 0.75) {
        return {
          label: 'High Coherence (Stable Rock / Urban)',
          sub: 'Low Temporal Decorrelation',
          color: 'bg-emerald-900/70 text-emerald-300 border-emerald-500/50',
        };
      }
      if (displayVal > 0.4) {
        return {
          label: 'Moderate Coherence (Sparse Veg / Crops)',
          sub: 'Partial Backscatter Stability',
          color: 'bg-amber-900/70 text-amber-300 border-amber-500/50',
        };
      }
      return {
        label: 'Decorrelated (Open Water / Dense Canopy)',
        sub: 'High Signal Phase Randomization',
        color: 'bg-rose-900/70 text-rose-300 border-rose-500/50',
      };
    }

    const isHV = (activeLayer?.image || '').toLowerCase().includes('hv') || (activeLayer?.label || '').toLowerCase().includes('hv');

    // Backscatter dB physics classification
    if (isHV) {
      if (displayVal < -22.5) {
        return {
          label: 'Specular Reflection (Smooth Water)',
          sub: 'Zero Cross-Pol Depolarization',
          color: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/50',
        };
      }
      if (displayVal >= -14.5) {
        return {
          label: 'Dense Canopy Volume Scattering',
          sub: 'Multi-Story Forest Depolarization',
          color: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50',
        };
      }
      return {
        label: 'Surface / Low-Biomass Agricultural Scatter',
        sub: 'Moderate Crop & Soil Roughness Scatter',
        color: 'bg-[#181916] text-[#E2E8F0] border-[#242522]',
      };
    }

    if (displayVal > -8.0) {
      return {
        label: 'Double-Bounce (Flooded Forest / Urban)',
        sub: 'Corner Reflector Enhancement',
        color: 'bg-amber-950/70 text-amber-300 border-amber-800/50',
      };
    }
    if (displayVal > -14.0) {
      return {
        label: 'Plains / Agricultural Backscatter',
        sub: 'Moderate Diffuse Surface Return',
        color: 'bg-[#181916] text-[#E2E8F0] border-[#242522]',
      };
    }
    if (displayVal < -18.0) {
      return {
        label: 'Specular Reflection (Smooth Water)',
        sub: 'Radar Pulse Deflected Away',
        color: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/50',
      };
    }
    return {
      label: 'Rough Surface / Diffuse Scattering',
      sub: 'Isotropic Soil & Low Vegetation',
      color: 'bg-stone-900 text-stone-300 border-stone-700',
    };
  }, [displayVal, unit, activeLayer]);

  const latFormatted = cursorCoords
    ? `${Math.abs(cursorCoords.lat).toFixed(4)}°${cursorCoords.lat >= 0 ? 'N' : 'S'}`
    : `${Math.abs(area.lat).toFixed(4)}°${area.lat >= 0 ? 'N' : 'S'}`;

  const lngFormatted = cursorCoords
    ? `${Math.abs(cursorCoords.lng).toFixed(4)}°${cursorCoords.lng >= 0 ? 'E' : 'W'}`
    : `${Math.abs(area.lng).toFixed(4)}°${area.lng >= 0 ? 'E' : 'W'}`;

  return (
    <div className="absolute top-16 right-48 z-20 pointer-events-none">
      <div className="bg-[#111827]/95 backdrop-blur-md border border-[#374151] rounded-xl px-4 py-3 shadow-2xl min-w-[270px]">
        {/* Header with live sensor badge */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#1f2937]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span className="text-[10px] uppercase tracking-wider text-gray-300 font-bold font-mono">
              SAR Pixel Telemetry
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded px-1.5 py-0.2">
            NISAR L2
          </span>
        </div>

        {/* Primary Measurement */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-gray-400 font-mono">
            {activeLayer?.label || 'Backscatter'}:
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-[#f59e0b]">
              {displayVal.toFixed(2)}
            </span>
            <span className="text-xs font-mono font-bold text-gray-300">
              {unit}
            </span>
          </div>
        </div>

        {/* Dynamic Scattering Mechanism Pill */}
        <div className={`mb-2.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold leading-tight ${mechanism.color}`}>
          <div className="flex items-center gap-1 mb-0.5">
            <span>⚡</span>
            <span>{mechanism.label}</span>
          </div>
          <p className="text-[9px] opacity-80 font-normal pl-4">{mechanism.sub}</p>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#0a0e1a]/80 p-2 rounded-lg border border-[#1f2937]">
          <div>
            <span className="text-gray-400 block text-[9px]">Coordinates:</span>
            <span className="text-gray-200 font-semibold">{latFormatted}, {lngFormatted}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[9px]">Coherence (γ):</span>
            <span className="text-[#10b981] font-semibold">{coherenceScore.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[9px]">LOS Displacement:</span>
            <span className="text-[#d946ef] font-semibold">
              {losDisplacementCm !== null ? `${losDisplacementCm} cm` : '±0.0 cm (Static)'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[9px]">Target:</span>
            <span className="text-gray-300 font-semibold truncate block" title={area.name}>
              {area.name.split(',')[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
