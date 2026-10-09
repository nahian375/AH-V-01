/**
 * ASTRA Health - Client NASA Data Types
 */

export interface NasaRadiationContext {
  id: string;
  spacecraft?: string;
  instrument?: string;
  timestamp: string; // ISO UTC
  absorbedDoseRate?: number; // µGy/day
  doseEquivalentRate?: number; // µSv/day
  flux?: number; // particles / (cm² · s · sr)
  latitude?: number;
  longitude?: number;
  altitude?: number;
  missionPhase?: string;
  source: 'NASA_RADLAB';
  fetchedAt: string;
  dataStatus: 'live' | 'cached' | 'CACHED' | 'ONLINE' | 'unavailable';
  status?: 'ONLINE' | 'CACHED';
  rawRecord?: any;
}

export interface NasaRadiationTrendPoint {
  timestamp: string;
  absorbedDoseRate: number;
  doseEquivalentRate: number;
  flux: number;
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
  status?: 'ONLINE' | 'CACHED';
  dataStatus?: 'live' | 'cached' | 'CACHED' | 'ONLINE';
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
  status?: 'ONLINE' | 'CACHED';
  dataStatus?: 'live' | 'cached' | 'CACHED' | 'ONLINE';
  instruments?: string[];
  associatedAnalysis?: {
    speed?: number;
    type?: string;
    halfAngle?: number;
    direction?: string;
    isEarthFacing?: boolean;
  };
}

export type NasaResearchTopic =
  | 'ALL'
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

export interface NasaResearchItem {
  id: string;
  accession: string;
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
  status?: 'ONLINE' | 'CACHED';
  dataStatus?: 'live' | 'cached' | 'CACHED' | 'ONLINE';
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
