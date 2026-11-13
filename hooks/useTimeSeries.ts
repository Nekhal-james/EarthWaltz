'use client';

import { useState, useEffect } from 'react';
import type { TimeSeriesData } from '@/types';

export function useTimeSeries(timeseriesPath: string | null) {
  const [data, setData] = useState<TimeSeriesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!timeseriesPath) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/data/${timeseriesPath}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json() as Promise<TimeSeriesData>;
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setCurrentIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [timeseriesPath]);

  useEffect(() => {
    if (!playing || !data) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= data.dates.length) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [playing, speed, data]);

  const togglePlay = () => setPlaying((p) => !p);
  const cycleSpeed = () => setSpeed((s) => (s >= 4 ? 1 : s * 2));

  return {
    data,
    loading,
    currentIndex,
    setCurrentIndex,
    playing,
    togglePlay,
    speed,
    cycleSpeed,
  };
}
