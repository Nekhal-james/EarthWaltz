'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TelemetryData } from '@/types';

export function useTelemetry(telemetryPath: string | null) {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!telemetryPath) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const loadTelemetry = async () => {
      try {
        const res = await fetch(`/data/${telemetryPath}`);
        if (!res.ok) {
          if (!cancelled) setData(null);
          return;
        }
        const d = (await res.json()) as TelemetryData;
        if (!cancelled) setData(d);
      } catch {
        /* silent fallback, never console.error */
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTelemetry();
    return () => {
      cancelled = true;
    };
  }, [telemetryPath]);

  const lookup = useCallback(
    (normX: number, normY: number): { value: number; unit: string } | null => {
      if (!data || !data.data.length) return null;
      const gridRows = data.data.length;
      const gridCols = data.data[0].length;
      const col = Math.min(Math.floor(normX * gridCols), gridCols - 1);
      const row = Math.min(Math.floor(normY * gridRows), gridRows - 1);
      if (row < 0 || col < 0) return null;
      const value = data.data[row][col];
      if (value === null || value === undefined) return null;
      return { value, unit: data.unit };
    },
    [data]
  );

  return { data, loading, lookup };
}
