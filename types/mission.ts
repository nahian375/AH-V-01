/**
 * ASTRA Health - Mission & Sync Types
 */

export interface MissionContext {
  missionId: string;
  name: string; // "MARS-01"
  sol: number; // 184
  missionPhase: 'Cruise' | 'Orbital Insertion' | 'Surface Ops' | 'Return Cruise';
  crewCount: number;
  communicationStatus: 'ONLINE' | 'OFFLINE' | 'SIMULATED_LOSS';
  earthCommsDelayMinutes: number; // e.g. 14.2 minutes for Mars transit
  radiationEnvironment: 'Deep Space Cruise (GCR + Solar Ambient)';
  metDays: number; // Mission Elapsed Time (e.g. 184 days)
  sleepScheduleWindow: string; // "22:00 - 06:00 UTC"
  exerciseScheduleWindow: string; // "09:30 - 11:30 UTC"
}

export type SyncStatus = 'IDLE' | 'OFFLINE' | 'SYNCING' | 'SYNC_COMPLETE' | 'ERROR';

export interface SyncQueueItem {
  id: string;
  tableName: 'healthMeasurements' | 'checkIns' | 'alerts' | 'cognitiveResults' | 'activities' | 'radiationMeasurements';
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  data: any;
  queuedAt: string;
  retryCount: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  sol: number;
  category: 'VITALS' | 'SLEEP' | 'EXERCISE' | 'ALERTS' | 'CHECK_IN' | 'AI';
  title: string;
  description: string;
  severity?: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  metricSnippet?: string;
  synced: boolean;
}

export type UserRole = 'Astronaut' | 'Medical Officer' | 'Mission Control' | 'Administrator';
