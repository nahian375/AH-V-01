/**
 * ASTRA Health - Core Health Types
 */

export type HealthSeverity = 'GREEN' | 'BLUE' | 'YELLOW' | 'ORANGE' | 'RED';
export type HealthStatusText = 'Stable' | 'Monitor' | 'Attention' | 'Critical';

export interface HealthMeasurement {
  id: string;
  timestamp: string; // ISO date
  sol: number; // Mars Sol day (e.g. 184)
  crewId: string;
  
  // Cardiovascular
  heartRate: number; // bpm
  restingHeartRate: number; // bpm
  hrv: number; // ms (RMSSD)
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  
  // Respiratory
  spo2: number; // %
  respiratoryRate: number; // breaths/min
  
  // Sleep & Recovery
  sleepDurationMinutes: number; // minutes
  sleepQuality: number; // 0 - 100
  sleepConsistency: number; // %
  recoveryScore: number; // 0 - 100
  fatigueScore: number; // 0 - 100
  
  // Fitness & Activity
  exerciseDurationMinutes: number;
  resistanceLoadKg: number;
  aerobicOutputWatts: number;
  coreTemperature: number; // Celsius
  hydrationIndex: number; // 0 - 100
  
  // Radiation
  dailyRadiation_uSv: number; // microSieverts
  cumulativeRadiation_mSv: number; // milliSieverts
  
  // Cognitive (recent test score)
  reactionTimeMs?: number;
  memoryScore?: number;
  attentionScore?: number;
  
  isSimulated?: boolean;
}

export type RadiationMeasurementType =
  | 'absorbedDose'
  | 'doseEquivalent'
  | 'doseRate'
  | 'cumulativeExposure';

export type RadiationUnit =
  | 'uSv'
  | 'mSv'
  | 'Sv'
  | 'uGy'
  | 'mGy'
  | 'Gy'
  | 'uSv/h'
  | 'mSv/h'
  | 'mGy/h';

export type RadiationSource =
  | 'personal_dosimeter'
  | 'manual'
  | 'sensor'
  | 'nasa'
  | 'imported';

export interface RadiationMeasurement {
  id: string;
  sol: number;
  timestamp: string; // ISO date-time of measurement
  measurementType: RadiationMeasurementType;
  value: number;
  unit: RadiationUnit;
  equivalent_mSv?: number; // Normalized dose equivalent in mSv if applicable
  doseRate_uSv_h?: number; // Optional instantaneous dose rate
  source: RadiationSource;
  instrumentId?: string; // e.g. "RAD-CREW-01", "BION-IV-SS"
  missionPhase?: string; // e.g. "Cruise", "EVA-03", "Habitat"
  locationContext?: string; // e.g. "Sleep Quarters", "Command Cupola"
  notes?: string;
  isSimulated?: boolean;
  syncStatus: 'pending' | 'synced';
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MetricBaseline {
  metricKey: string;
  label: string;
  unit: string;
  currentValue: number;
  baseline7d: number;
  baseline14d: number;
  baseline30d: number;
  deviationPercent: number; // e.g. +8.5 or -14.2
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: HealthSeverity;
  isSimulated?: boolean;
}

export interface MultiMetricChange {
  id: string;
  timestamp: string;
  severity: HealthSeverity;
  title: string;
  summary: string;
  contributingMetrics: {
    name: string;
    current: number | string;
    baseline: number | string;
    deviation: string;
    unit: string;
  }[];
  rationale: string;
  recommendedAction: string;
  suggestedMonitoring: string;
  acknowledged: boolean;
}

export interface DailyCheckIn {
  id: string;
  date?: string;
  timestamp: string;
  sol: number;
  crewId: string;

  // Structured Physical Inputs (3-Step Quick Check-In)
  physical?: {
    heartRate?: number;
    spo2?: number;
    exerciseMinutes?: number;
    recovery?: number; // 1 - 5 scale
  };

  // Structured Mental Inputs (3-Step Quick Check-In)
  mental?: {
    sleepDurationMinutes?: number;
    sleepHours?: number;
    sleepMinutes?: number;
    mood?: number; // 1 - 5 scale
    stress?: number; // 1 - 5 scale
    energy?: number; // 1 - 5 scale
    fatigue?: number; // 1 - 5 scale
  };

  // Normalized 0 - 100 values (for backwards compatibility and health engine scoring)
  energy: number; // 0 - 100
  stress: number; // 0 - 100
  fatigue: number; // 0 - 100
  mood: number; // 0 - 100
  sleepQuality: number; // 0 - 100
  subjectiveNotes?: string;
  healthEngineAnalysis?: string;

  // Status & Synchronization
  status?: 'completed' | 'in_progress';
  source?: 'astronaut' | 'ai_guided';
  syncStatus?: 'pending' | 'synced';
  synced: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Calculated snapshot of indexes for historical review
  physicalIndex?: number;
  mentalIndex?: number;
}

export interface CheckInSubmissionPayload {
  physical?: {
    heartRate?: number;
    spo2?: number;
    exerciseMinutes?: number;
    recovery?: number; // 1 - 5 scale
  };
  mental?: {
    sleepHours?: number;
    sleepMinutes?: number;
    sleepDurationMinutes?: number;
    mood?: number; // 1 - 5 scale
    stress?: number; // 1 - 5 scale
    energy?: number; // 1 - 5 scale
    fatigue?: number; // 1 - 5 scale
  };
  energy?: number;
  stress?: number;
  fatigue?: number;
  mood?: number;
  sleepQuality?: number;
  subjectiveNotes?: string;
  source?: 'astronaut' | 'ai_guided';
}

export interface HealthAlert {
  id: string;
  timestamp: string;
  sol: number;
  severity: HealthSeverity;
  category: 'CARDIO' | 'SLEEP' | 'MULTI_METRIC' | 'COGNITIVE' | 'RADIATION' | 'RESPIRATORY';
  title: string;
  message: string;
  contributingFactors: string[];
  baselineComparison: string;
  triggerRationale: string;
  recommendedNextStep: string;
  source: 'HEALTH_ENGINE' | 'DETERMINISTIC_RULE';
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface CognitiveTaskResult {
  id: string;
  taskType: 'REACTION' | 'MEMORY' | 'ATTENTION';
  timestamp: string;
  score: number; // ms for reaction, % for memory/attention
  baselineScore: number;
  deviationPercent: number;
  durationSeconds: number;
  sol: number;
}

export interface CrewMember {
  id: string;
  name: string;
  callsign: string;
  role: 'Commander' | 'Pilot' | 'Flight Engineer' | 'Payload Specialist';
  avatarInitials: string;
  status: HealthSeverity;
  statusText: HealthStatusText;
  keyMetricSummary: string;
  lastCheckInSol: number;
  restingHr: number;
  sleepHours: number;
  radiationCumulative_mSv: number;
}
