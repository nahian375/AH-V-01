/**
 * ASTRA Health - Space Context Engine Data Models
 * Structures physiological telemetry, mission environment, personal baselines,
 * radiation dosimetry, and spaceflight hazard domains.
 */

import { AstronautProfile } from './profile';
import { MissionContext } from './mission';
import { HealthMeasurement, MetricBaseline, MultiMetricChange, HealthAlert, DailyCheckIn, RadiationMeasurement } from './health';
import { ActivityRecord, DailyActivitySummary } from './activity';
import { NasaRadiationContext, NasaSpaceWeatherEvent } from './nasa';

export type SpaceflightHazard = 
  | 'SPACE_RADIATION'
  | 'ISOLATION_CONFINEMENT'
  | 'DISTANCE_FROM_EARTH'
  | 'GRAVITY_FIELDS'
  | 'HOSTILE_CLOSED_ENVIRONMENTS';

export interface SpaceRiskContextItem {
  hazard: SpaceflightHazard;
  title: string;
  category: string;
  status: 'MONITORING' | 'STABLE' | 'ELEVATED' | 'PROTECTED';
  details: string;
  operationalMitigation: string;
}

export type AdaptationStatus = 'STABLE' | 'CHANGING' | 'MONITORING' | 'INSUFFICIENT_DATA';

export interface MissionAdaptationDomain {
  domain: 'CARDIOVASCULAR' | 'NEURAL' | 'SLEEP' | 'RECOVERY' | 'FITNESS' | 'BEHAVIORAL' | 'RADIATION' | 'RESPIRATORY';
  label: string;
  status: AdaptationStatus;
  primaryMetric: string;
  trendSummary: string;
  spaceflightConsideration: string;
}

export interface WhyAstraIsWatchingItem {
  id: string;
  metricLabel: string;
  category: 'PHYSICAL' | 'RECOVERY' | 'NEURAL' | 'RADIATION' | 'ALERT';
  observedChange: string;
  baselineComparison: string;
  spaceContextNote: string;
  severity: 'INFO' | 'WATCH' | 'ATTENTION';
}

export interface PreFlightBaselineComparison {
  metricKey: string;
  label: string;
  unit: string;
  preFlightValue: number;
  inFlight14dBaseline: number;
  currentValue: number;
  deltaFromInFlight: number;
  deltaFromPreFlight: number;
  status: 'STABLE' | 'MONITORING' | 'ATTENTION';
  adaptationNote: string;
}

export interface MissionHealthBrief {
  sol: number;
  generatedAt: string;
  physicalSummary: {
    cardioStatus: AdaptationStatus;
    respiratoryStatus: AdaptationStatus;
    recoveryStatus: AdaptationStatus;
    radiationStatus: AdaptationStatus;
  };
  neuralSummary: {
    reactionStatus: AdaptationStatus;
    sleepStatus: AdaptationStatus;
    attentionStatus: AdaptationStatus;
  };
  mentalSummary: {
    stressScore: number; // 1-5
    moodScore: number; // 1-5
    energyScore: number; // 1-5
  };
  missionContext: {
    phase: string;
    gravity: string;
    commsStatus: string;
    earthDelayMin: number;
    radiationStatus: string;
  };
  astraNote: string;
}

export interface WhyThisMattersItem {
  id: string;
  title: string;
  metric: string;
  spaceExplanation: string;
  missionRelevance: string;
  referenceSource: string;
}

export interface SpaceHealthContext {
  astronautProfile: AstronautProfile;
  missionContext: MissionContext;
  currentHealth: HealthMeasurement;
  baselines: MetricBaseline[];
  preFlightBaselines: PreFlightBaselineComparison[];
  recentChanges: MultiMetricChange[];
  activeAlerts: HealthAlert[];
  recentCheckIn?: DailyCheckIn;
  recentRadiation?: RadiationMeasurement;
  cumulativeRadiation_mSv: number;
  nasaRadiation?: NasaRadiationContext;
  nasaSpaceWeather?: NasaSpaceWeatherEvent[];
  recentActivities: ActivityRecord[];
  dailyActivitySummary?: DailyActivitySummary;
  whyAstraIsWatching: WhyAstraIsWatchingItem[];
  missionAdaptation: MissionAdaptationDomain[];
  spaceRisks: SpaceRiskContextItem[];
  missionHealthBrief: MissionHealthBrief;
  communicationStatus: 'ONLINE' | 'OFFLINE' | 'SIMULATED_LOSS';
  gravityEnvironment: string;
  generatedAt: string;
}
