'use client';

import dynamic from 'next/dynamic';
import type { StudyArea, LayerInfo } from '@/types';

const Globe = dynamic(() => import('./Globe'), { ssr: false });

interface GlobeWrapperProps {
  areas: StudyArea[];
  activeArea: StudyArea;
  activeLayer: LayerInfo | null;
  flyTo: { lat: number; lng: number; zoom: number; bearing: number; pitch: number } | null;
  onAreaClick: (area: StudyArea) => void;
  ancillaryVisible: string[];
  onCursorMove?: (coords: { lat: number; lng: number } | null) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
}

export default function GlobeWrapper(props: GlobeWrapperProps) {
  return <Globe {...props} />;
}
