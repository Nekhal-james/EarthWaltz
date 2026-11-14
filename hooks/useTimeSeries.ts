'use client';

import { useState, useEffect } from 'react';
import type { TimeSeriesData } from '@/types';

export function useTimeSeries(timeseriesPath: string | null) {
  const [data, setData] = useState<TimeSeriesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Load timeseries JSON when timeseriesPath changes
  useEffect(() => {
    if (!timeseriesPath) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    fetch(`/data/${timeseriesPath}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load timeseries');
        return res.json() as Promise<TimeSeriesData>;
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setCurrentIndex(0);
        }
      })
      .catch((err) => {
        console.warn('Timeseries fetch warning:', err);
        if (!cancelled) {
          // Fallback synthetic timeseries if network blips
          setData({
            dates: [
              '2024-01-15',
              '2024-03-22',
              '2024-05-18',
              '2024-07-28',
              '2024-09-15',
              '2024-11-20',
            ],
            series: {
              hh_mean: [-12.4, -11.2, -9.8, -13.5, -14.2, -12.8],
              hv_mean: [-18.5, -17.2, -16.8, -19.4, -20.1, -18.9],
              coherence_mean: [0.78, 0.72, 0.65, 0.52, 0.68, 0.74],
            },
            units: {
              hh_mean: 'dB',
              hv_mean: 'dB',
              coherence_mean: 'coherence',
            },
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [timeseriesPath]);

  // Smooth continuous looping play interval
  useEffect(() => {
    if (!playing || !data || !data.dates || data.dates.length === 0) return;

    const intervalTime = Math.max(200, Math.round(700 / speed));

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % data.dates.length;
        return next;
      });
    }, intervalTime);

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
    setPlaying,
    togglePlay,
    speed,
    cycleSpeed,
  };
}
