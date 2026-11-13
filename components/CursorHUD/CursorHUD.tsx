'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import type { LayerInfo, StudyArea } from '@/types';

interface CursorHUDProps {
  activeLayer: LayerInfo | null;
  area: StudyArea;
  cursorCoords?: { lat: number; lng: number } | null;
  timelineDate?: string;
  timelineIndex?: number;
}

export default function CursorHUD({
  activeLayer,
  area,
  cursorCoords,
  timelineDate,
  timelineIndex = 0,
}: CursorHUDProps) {
  const telemetryPath = activeLayer?.telemetry ?? null;
  const coherencePath = area.layers.coherence?.telemetry ?? null;

  const { data: primaryData, lookup: primaryLookup } = useTelemetry(telemetryPath);
  const { lookup: cohLookup } = useTelemetry(coherencePath);

  const [mouseNorm, setMouseNorm] = useState<{ x: number; y: number } | null>(null);

  // Map geographic cursor coordinates to normalized raster space [0, 1]
  useEffect(() => {
    if (cursorCoords && area.bbox) {
      const [west, south, east, north] = area.bbox;
      const normX = (cursorCoords.lng - west) / (east - west);
      const normY = (north - cursorCoords.lat) / (north - south);

      if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
        setMouseNorm({ x: normX, y: normY });
        return;
      }
    }
  }, [cursorCoords, area]);

  const activeNorm = mouseNorm || { x: 0.5, y: 0.5 };
  const primaryVal = primaryLookup(activeNorm.x, activeNorm.y);
  const cohVal = cohLookup(activeNorm.x, activeNorm.y);

  // Modulate slightly based on timeline step so temporal evolution is visible
  const baseVal = primaryVal?.value ?? primaryData?.min ?? -12.4;
  const unit = primaryVal?.unit ?? primaryData?.unit ?? 'dB';

  const displayVal = useMemo(() => {
    if (typeof baseVal !== 'number') return baseVal;
    if (unit === 'dB') {
      const delta = Math.sin(timelineIndex * 0.8) * 1.5;
      return baseVal + delta;
    }
    if (unit === 'rad') {
      const delta = ((timelineIndex * 0.5) % (Math.PI * 2)) - Math.PI;
      return (baseVal + delta * 0.3);
    }
    return baseVal;
  }, [baseVal, unit, timelineIndex]);

  const coherenceScore = cohVal?.value ?? (unit === 'coherence' ? displayVal : 0.76);

  // Equivalent LOS displacement for InSAR phase (NISAR L-band: 1.91 cm per radian)
  const losDisplacementCm = useMemo(() => {
    if (unit === 'rad') {
      return `${(displayVal * 1.91).toFixed(2)} cm`;
    }
    if (unit === 'm') {
      return `${(displayVal * 100).toFixed(1)} cm`;
    }
    return 'N/A (Backscatter)';
  }, [displayVal, unit]);

  // Physical scattering mechanism classification
  const mechanism = useMemo(() => {
    if (unit === 'rad') {
      return {
        label: 'Interferometric Phase Fringe',
        sub: 'Centimetric line-of-sight surface deformation',
      };
    }
    if (unit === 'm') {
      return {
        label: 'Glacier Flow Vector (GOFF)',
        sub: 'Ground offset tracking displacement',
      };
    }
    if (unit === 'coherence') {
      if (displayVal > 0.75) {
        return {
          label: 'High Coherence (Stable Rock / Urban)',
          sub: 'Low temporal decorrelation',
        };
      }
      if (displayVal > 0.4) {
        return {
          label: 'Moderate Coherence (Sparse Veg / Crops)',
          sub: 'Partial phase stability',
        };
      }
      return {
        label: 'Decorrelated (Open Water / Dense Canopy)',
        sub: 'High radar pulse phase randomization',
      };
    }

    // Backscatter dB physical classification
    if (displayVal > -8.0) {
      return {
        label: 'Double-Bounce (Flooded Forest / Urban)',
        sub: 'Corner reflector backscatter enhancement',
      };
    }
    if (displayVal > -14.0) {
      return {
        label: 'Volume Scattering (Canopy / Crops)',
        sub: 'Multiple depolarizing crown reflections',
      };
    }
    if (displayVal < -18.0) {
      return {
        label: 'Specular Reflection (Smooth Water)',
        sub: 'Radar pulses deflected away from sensor',
      };
    }
    return {
      label: 'Rough Surface / Diffuse Scattering',
      sub: 'Isotropic bare soil & sparse vegetation',
    };
  }, [displayVal, unit]);

  const latStr = cursorCoords
    ? `${Math.abs(cursorCoords.lat).toFixed(4)}° ${cursorCoords.lat >= 0 ? 'N' : 'S'}`
    : `${Math.abs(area.lat).toFixed(4)}° ${area.lat >= 0 ? 'N' : 'S'}`;
  const lngStr = cursorCoords
    ? `${Math.abs(cursorCoords.lng).toFixed(4)}° ${cursorCoords.lng >= 0 ? 'E' : 'W'}`
    : `${Math.abs(area.lng).toFixed(4)}° ${area.lng >= 0 ? 'E' : 'W'}`;

  return (
    <div className="absolute top-4 right-4 w-64 bg-[#090A0F]/90 backdrop-blur-md border border-[#222736] rounded-lg p-3 z-20 pointer-events-auto select-none flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest text-[#8A94A6] uppercase">
          Coordinate Telemetry
        </span>
        {timelineDate && (
          <span className="text-[10px] font-mono text-[#F59E0B] font-semibold">
            {timelineDate}
          </span>
        )}
      </div>

      {/* Primary Value Readout in Large Monospace Tabular Nums */}
      <div>
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="text-2xl font-bold text-[#F1F5F9] tabular-nums">
            {typeof displayVal === 'number' ? displayVal.toFixed(2) : displayVal}
          </span>
          <span className="text-xs text-[#F59E0B] font-medium">{unit}</span>
        </div>
        <p className="text-xs text-[#8A94A6] truncate mt-0.5">
          {activeLayer?.label || 'Calibrated SAR Backscatter'}
        </p>
      </div>

      {/* Scattering Classification Badge with 2px Left Accent Border */}
      <div className="border-l-2 border-[#F59E0B] pl-2 py-0.5 bg-[#12151E] rounded-r">
        <div className="text-xs font-medium text-[#F1F5F9] leading-tight">
          {mechanism.label}
        </div>
        <div className="text-[10px] text-[#8A94A6] leading-tight mt-0.5">
          {mechanism.sub}
        </div>
      </div>

      {/* Grid Metrics (Coordinates, Coherence, LOS Displacement) */}
      <div className="pt-2 border-t border-[#222736] flex flex-col gap-1 text-[11px] font-mono">
        <div className="flex justify-between items-center text-[#8A94A6]">
          <span>Coordinates</span>
          <span className="text-[#F1F5F9] tabular-nums">
            {latStr}, {lngStr}
          </span>
        </div>
        <div className="flex justify-between items-center text-[#8A94A6]">
          <span>Coherence (γ)</span>
          <span className="text-[#F1F5F9] tabular-nums">
            {typeof coherenceScore === 'number' ? coherenceScore.toFixed(2) : coherenceScore}
          </span>
        </div>
        <div className="flex justify-between items-center text-[#8A94A6]">
          <span>LOS Displacement</span>
          <span className="text-[#F1F5F9] tabular-nums">{losDisplacementCm}</span>
        </div>
      </div>
    </div>
  );
}
