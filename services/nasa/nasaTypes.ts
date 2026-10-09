/**
 * ASTRA Health - NASA Data Architecture Types
 * Standardized data models for NASA OSDR RadLab, NASA DONKI, and NASA OSDR Biological Data.
 */

export interface NasaRadiationContext {
  id: string;
  spacecraft?: string;
  instrument?: string;
  timestamp: string; // ISO UTC
  absorbedDoseRate?: number; // µGy/day or µGy/hr
  doseEquivalentRate?: number; // µSv/day or µSv/hr
  flux?: number; // particles / (cm² · s · sr)
  latitude?: number;
  longitude?: number;
  altitude?: number;
  missionPhase?: string;
  source: 'NASA_RADLAB';
  fetchedAt: string;
  dataStatus: 'live' | 'cached' | 'unavailable';
  rawRecord?: any;
}

export interface NasaRadiationTrendPoint {
  timestamp: string;
  absorbedDoseRate: number; // µGy/day
  doseEquivalentRate: number; // µSv/day
  flux: number; // particles/(cm²·s·sr)
  instrument: string;
  spacecraft: string;
}

export interface NasaRadiationTrend {
  range: '24H' | '7D' | '30D';
  spacecraft: string;
  instrument: string;
  averageDoseRate_uGy_day: number;
  averageDoseEquivalent_uSv_day: number;
  peakDoseEquivalent_uSv_day: number;
  points: NasaRadiationTrendPoint[];
  lastUpdated: string;
}

export interface NasaSpaceWeatherEvent {
  id: string;
  type: 'CME' | 'FLARE' | 'SEP' | 'GEOMAGNETIC_STORM' | 'SOLAR_WIND';
  eventID: string;
  startTime: string;
  endTime?: string;
  sourceLocation?: string;
  speed?: number; // km/s
  halfAngle?: number;
  direction?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  catalog?: string;
  source: 'NASA_DONKI';
  fetchedAt: string;
  link?: string;
  instruments?: string[];
  associatedAnalysis?: {
    speed?: number;
    type?: string;
    halfAngle?: number;
    direction?: string;
    isEarthFacing?: boolean;
  };
}

export interface NasaResearchItem {
  id: string;
  accession: string; // e.g. "OSD-37", "OSD-137", "OSD-452"
  title: string;
  topic: 
    | 'Cardiovascular' 
    | 'Bone' 
    | 'Muscle' 
    | 'Radiation' 
    | 'Sleep' 
    | 'Circadian' 
    | 'Immune' 
    | 'Cognition' 
    | 'Behavioral Health' 
    | 'Exercise';
  summary: string;
  keyFindings: string[];
  missionOrPayload?: string;
  species?: string;
  source: 'NASA_OSDR';
  publicationUrl?: string;
  retrievedAt: string;
}

export interface NasaConnectionStatus {
  radLab: 'connected' | 'cached' | 'unavailable';
  donki: 'connected' | 'cached' | 'unavailable';
  osdr: 'connected' | 'cached' | 'unavailable';
  lastSuccessfulSync?: string;
  activeEndpoints: {
    radLabUrl: string;
    donkiUrl: string;
    osdrUrl: string;
  };
}

export interface CachedNasaData<T> {
  source: 'NASA_RADLAB' | 'NASA_DONKI' | 'NASA_OSDR';
  data: T;
  fetchedAt: string;
  expiresAt: string;
  status: 'live' | 'cached' | 'expired';
}
