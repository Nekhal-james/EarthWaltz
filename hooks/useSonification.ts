'use client';

import { useRef, useCallback, useState, useEffect } from 'react';

export function useSonification() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      const osc = ctxRef.current.createOscillator();
      const gain = ctxRef.current.createGain();
      const analyser = ctxRef.current.createAnalyser();
      analyser.fftSize = 256;
      osc.type = 'sine';
      osc.frequency.value = 220;
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctxRef.current.destination);
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      analyserRef.current = analyser;
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (dbValue: number, coherence: number) => {
      const ctx = ensureContext();
      if (ctx.state === 'suspended') ctx.resume();
      // Map dB range [-25, 5] to frequency [110, 880] Hz
      const normalized = Math.max(0, Math.min(1, (dbValue + 25) / 30));
      const freq = 110 + normalized * 770;
      if (oscRef.current) {
        oscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
      }
      // Map coherence [0, 1] to volume [0, 0.3]
      if (gainRef.current) {
        gainRef.current.gain.setTargetAtTime(
          Math.max(0, Math.min(0.3, coherence * 0.3)),
          ctx.currentTime,
          0.05
        );
      }
      setIsPlaying(true);
    },
    [ensureContext]
  );

  const stop = useCallback(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.05);
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, []);

  return { play, stop, isPlaying, analyserRef };
}
