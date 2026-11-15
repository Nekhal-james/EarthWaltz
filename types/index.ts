export interface FrequencyInfo {
  band: string;
  wavelength_cm: number;
}

export interface LayerInfo {
  image: string;
  telemetry: string;
  label: string;
  unit: string;
}

export interface GranuleProvenance {
  granule_id: string;
  platform: string;
  sensor: string;
  beam_mode: string;
  polarization: string;
  acquisition_date: string;
  orbit_direction: 'Ascending' | 'Descending';
  track_frame: string;
  wkt_footprint: string;
  vertex_url: string;
  earthdata_search_url: string;
  official_docs_url: string;
  hdf5_spec_path?: string;
}

export interface StudyArea {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  zoom: number;
  bearing: number;
  pitch: number;
  phenomenon: string;
  description: string;
  sensors: string[];
  polarizations: string[];
  frequencies: FrequencyInfo[];
  hometown: boolean;
  bbox?: [number, number, number, number];
  default_layer?: string;
  provenance?: GranuleProvenance;
  layers: Record<string, LayerInfo>;
  optical_cloudy: string;
  timeseries: string;
  narrative: string;
}

export interface StudyAreasData {
  metadata?: {
    repository?: string;
    si_acknowledgment?: string;
  };
  areas: StudyArea[];
}

export interface TelemetryData {
  width: number;
  height: number;
  unit: string;
  min: number;
  max: number;
  nodata: number | null;
  bbox: [number, number, number, number];
  data: number[][];
}

export interface TimeSeriesData {
  dates: string[];
  series: Record<string, number[]>;
  units: Record<string, string>;
}

export type Polarization = 'HH' | 'HV' | 'VV' | 'InSAR Phase' | 'Coherence' | 'Offset Tracking';

export type BasemapStyle = 'dark-matter' | 'gibs-truecolor' | 'esri-satellite' | 'positron';

export type AppMode = 'story' | 'instrument';
