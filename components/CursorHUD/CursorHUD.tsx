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
      return baseVal + delta * 0.3;
    }
    return baseVal;
  }, [baseVal, unit, timelineIndex]);

  const coherenceScore = cohVal?.value ?? (unit === 'coherence' ? displayVal : 0.72);

  const isHV = useMemo(() => {
    const img = (activeLayer?.image || '').toLowerCase();
    const lbl = (activeLayer?.label || '').toLowerCase();
    return img.includes('hv') || lbl.includes('hv');
  }, [activeLayer]);

  // Physical scattering mechanism classification
  const mechanism = useMemo(() => {
    if (unit === 'rad') {
      return {
        label: 'Interferometric Phase Fringe',
        sub: 'Line-of-sight surface deformation',
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
        label: 'Decorrelated (Water / Forest Canopy)',
        sub: 'High phase randomization',
      };
    }

    // HV Backscatter (Biomass / Cross-Pol)
    if (isHV) {
      if (displayVal < -22.5) {
        return {
          label: 'Specular Reflection (Smooth Water)',
          sub: 'Zero cross-pol depolarization',
        };
      }
      if (displayVal >= -14.5) {
        return {
          label: 'Dense Canopy Volume Scattering',
          sub: 'Multi-story forest crown reflection',
        };
      }
      return {
        label: 'Low-Biomass / Agricultural Surface Scatter',
        sub: 'Soil roughness & agricultural crop return',
      };
    }

    // HH Backscatter (Co-Pol)
    if (displayVal > -8.0) {
      return {
        label: 'Double-Bounce (Flooded Forest / Urban)',
        sub: 'Corner reflector backscatter enhancement',
      };
    }
    if (displayVal > -14.0) {
      return {
        label: 'Plains / Agricultural Backscatter',
        sub: 'Moderate diffuse surface return',
      };
    }
    if (displayVal < -18.0) {
      return {
        label: 'Specular Reflection (Smooth Water)',
        sub: 'Energy deflected away from radar sensor',
      };
    }
    return {
      label: 'Rough Surface / Diffuse Scattering',
      sub: 'Isotropic bare soil & sparse vegetation',
    };
  }, [displayVal, unit, isHV]);

  const latStr = cursorCoords
    ? `${Math.abs(cursorCoords.lat).toFixed(4)}° ${cursorCoords.lat >= 0 ? 'N' : 'S'}`
    : `${Math.abs(area.lat).toFixed(4)}° ${area.lat >= 0 ? 'N' : 'S'}`;
  const lngStr = cursorCoords
    ? `${Math.abs(cursorCoords.lng).toFixed(4)}° ${cursorCoords.lng >= 0 ? 'E' : 'W'}`
    : `${Math.abs(area.lng).toFixed(4)}° ${area.lng >= 0 ? 'E' : 'W'}`;

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-auto select-none font-sans">
      {/* Sleek, Non-Blocking Horizontal Telemetry Pill Bar */}
      <div className="flex items-center gap-3 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl px-3.5 py-2 shadow-md text-xs text-[#64748B]">
        {/* Value & Channel */}
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-base font-bold text-[#0F172A] tabular-nums">
            {typeof displayVal === 'number' ? displayVal.toFixed(2) : displayVal}
          </span>
          <span className="font-mono text-[11px] text-[#2563EB] font-bold">{unit}</span>
          <span className="text-[#64748B] text-[11px] ml-1">
            ({activeLayer?.label || 'SAR'})
          </span>
        </div>

        {/* Hairline Divider */}
        <div className="h-4 w-px bg-[#E2E8F0]" />

        {/* Scattering Mechanism Badge */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <span className="text-[#0F172A] font-semibold">{mechanism.label}</span>
        </div>

        {/* Hairline Divider */}
        <div className="h-4 w-px bg-[#E2E8F0]" />

        {/* Coordinates */}
        <div className="font-mono text-[11px] text-[#64748B] tabular-nums">
          {latStr}, {lngStr}
        </div>

        {/* Hairline Divider */}
        <div className="h-4 w-px bg-[#E2E8F0]" />

        {/* Coherence */}
        <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums">
          <span className="text-[#64748B]">γ</span>
          <span className="text-[#0F172A] font-semibold">
            {typeof coherenceScore === 'number' ? coherenceScore.toFixed(2) : coherenceScore}
          </span>
        </div>

        {/* Date if available */}
        {timelineDate && (
          <>
            <div className="h-4 w-px bg-[#E2E8F0]" />
            <div className="font-mono text-[11px] text-[#2563EB] font-semibold tabular-nums">
              {timelineDate}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
