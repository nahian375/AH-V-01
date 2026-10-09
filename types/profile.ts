/**
 * ASTRA Health - Astronaut Profile & Mission Identity Data Models
 * Spaceflight-tailored personal health identity, body physiology, and mission context.
 */

export interface AstronautIdentity {
  fullName: string;
  preferredName?: string;
  astronautId: string;
  callSign?: string;
  role: string;
  crewPosition?: string;
  agency?: string;
  avatarUrl?: string; // Data URL for local/offline avatar image
  age?: number; // Validated numeric age in years (18-85)
  bloodGroup?: string; // 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'
  bloodGroupVerification?: 'Verified pre-flight' | 'UNVERIFIED';
  lastUpdated?: string;
}

export interface BodyPhysiology {
  heightCm?: number; // In centimeters (e.g. 178)
  baselineWeightKg?: number; // Pre-flight Earth baseline mass in kg (e.g. 72)
  currentWeightKg?: number; // Current in-flight recorded mass in kg (e.g. 71.4)
  lastWeightUpdateSol?: number;
  heightVerification?: 'Baseline recorded pre-flight' | 'UNVERIFIED';
  weightVerification?: string; // e.g. "Updated: Sol 42" or "Baseline recorded pre-flight"
}

export interface MissionIdentityInfo {
  missionName: string;
  missionId?: string;
  startDate?: string;
  durationDays?: number; // Total mission duration in days (e.g. 180 or 540)
  currentMissionDay?: number; // Current day/sol (e.g. 47)
  destination?: string; // e.g. "Mars"
  phase?: string; // e.g. "Transit", "Deep Space Cruise"
  gravityEnvironment?: 'Microgravity' | '0.38g (Mars)' | 'Lunar (0.16g)' | '1g (Earth Reference)';
  communicationStatus?: 'ONLINE' | 'OFFLINE' | 'COMMUNICATION_DELAY';
  crewAssignment?: string;
  status?: 'HEALTH MONITORING ACTIVE' | 'ACTIVE' | 'PLANNED' | 'STANDBY' | 'COMPLETED';
}

export interface MetricBaselineComparison {
  metricKey: string;
  label: string;
  unit: string;
  preFlightValue: number;
  inFlightBaseline: number;
  currentValue: number;
  differenceFromInFlight: number; // currentValue - inFlightBaseline
  differenceFromPreFlight: number; // currentValue - preFlightValue
  status: 'Stable' | 'Changing' | 'Monitoring' | 'Insufficient Data';
  note?: string;
}

export interface PersonalSpaceBaseline {
  restingHeartRate: MetricBaselineComparison;
  hrv: MetricBaselineComparison;
  sleepDuration: MetricBaselineComparison;
  bloodPressureSystolic: MetricBaselineComparison;
  spo2: MetricBaselineComparison;
  coreTemperature: MetricBaselineComparison;
  lastCalculatedSol: number;
  explanation: string;
}

export interface AstronautPreferences {
  units: 'metric' | 'imperial';
  timeFormat: '12h' | '24h';
  dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  temperatureUnit?: 'celsius' | 'fahrenheit';
  reducedMotion?: boolean;
  fontSize?: 'normal' | 'large';
  highContrast?: boolean;
  healthReminders?: boolean;
  measurementReminders?: boolean;
  missionAlerts?: boolean;
  aiNotifications?: boolean;
  aiMode?: 'auto' | 'online' | 'offline';
  voiceInteraction?: boolean;
  responseStyle?: 'concise' | 'detailed' | 'clinical';
}

export type ProfileSyncStatus = 'synced' | 'pending' | 'local';

export interface AstronautProfile {
  id: string;
  isConfigured: boolean;
  identity: AstronautIdentity;
  body?: BodyPhysiology;
  mission: MissionIdentityInfo;
  personalBaseline?: PersonalSpaceBaseline;
  preferences: AstronautPreferences;
  createdAt: string;
  updatedAt: string;
  syncStatus: ProfileSyncStatus;
}

export const SUPPORTED_BLOOD_GROUPS = [
  'O+',
  'O-',
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
] as const;

export type SupportedBloodGroup = typeof SUPPORTED_BLOOD_GROUPS[number];
