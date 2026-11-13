'use client';

import { useState, useEffect, useRef } from 'react';
import { useSonification } from '@/hooks/useSonification';
import { useTimeSeries } from '@/hooks/useTimeSeries';

interface SonificationEngineProps {
  timeseriesPath: string | null;
}

export default function SonificationEngine({ timeseriesPath }: SonificationEngineProps) {
  const { data } = useTimeSeries(timeseriesPath);
  const { play, stop, isPlaying, analyserRef } = useSonification();
  const [activeStep, setActiveStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && data && data.dates.length > 0) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          const next = (prev + 1) % data.dates.length;
          const hhVal = data.series.hh_mean?.[next] ?? -12;
          const cohVal = data.series.coherence_mean?.[next] ?? 0.7;
          play(hhVal, cohVal);
          return next;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, data, play]);

  // Canvas visualizer animation loop
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

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#f59e0b';
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
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1.5;
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

  const handleToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      if (data && data.dates.length > 0) {
        const hhVal = data.series.hh_mean?.[activeStep] ?? -12;
        const cohVal = data.series.coherence_mean?.[activeStep] ?? 0.7;
        play(hhVal, cohVal);
      } else {
        play(-10, 0.8);
      }
    }
  };

  return (
    <div className="bg-[#111827]/90 backdrop-blur-md border border-[#374151] rounded-xl p-3 shadow-xl w-64">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎵</span>
          <span className="text-xs font-semibold text-gray-200">SAR Sonification</span>
        </div>
        <button
          onClick={handleToggle}
          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
            isPlaying
              ? 'bg-[#d946ef] text-white animate-pulse'
              : 'bg-[#f59e0b] hover:bg-[#d97706] text-black'
          }`}
        >
          {isPlaying ? '⏹ Pause' : '▶ Play Waltz'}
        </button>
      </div>

      <div className="bg-[#0a0e1a] rounded border border-[#1f2937] p-1 mb-2 overflow-hidden">
        <canvas ref={canvasRef} width={240} height={36} className="w-full h-9 block" />
      </div>

      <div className="flex justify-between text-[10px] text-gray-400">
        <span>dB → Pitch (110–880Hz)</span>
        <span>Coh → Vol</span>
      </div>
    </div>
  );
}

