'use client';

import dynamic from 'next/dynamic';
import type { StudyArea, LayerInfo, BasemapStyle } from '@/types';

const Globe = dynamic(() => import('./Globe'), { ssr: false });

interface GlobeWrapperProps {
  areas: StudyArea[];
  activeArea: StudyArea;
  activeLayer: LayerInfo | null;
  onAreaClick: (area: StudyArea) => void;
  ancillaryVisible: string[];
  onCursorMove?: (coords: { lat: number; lng: number } | null) => void;
  basemap?: BasemapStyle;
  opacity?: number;
  captureTrigger?: number;
  onSnapshotExported?: (filename: string) => void;
  timelineIndex?: number;
  selectedBand?: string;
  isTimelinePlaying?: boolean;
  curtainPosition?: number;
  mode?: 'story' | 'instrument';
}

export default function GlobeWrapper(props: GlobeWrapperProps) {
  return <Globe {...props} />;
}
