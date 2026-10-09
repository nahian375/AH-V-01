/**
 * ASTRA Health - Deterministic Dual Health Index Engine
 * 
 * Computes:
 * 1. Physical Health Index (0-100) from Cardiovascular, Respiratory, Fitness, and Physical Recovery
 * 2. Mental Health Index (0-100) from Cognitive, Sleep/Recovery, Mood, and Stress/Fatigue
 * 
 * Safety & Transparency Principles:
 * - Deterministic, rule-based composite scoring based on personal 14-day rolling baselines.
 * - Non-diagnostic: labeled as monitoring indexes for astronaut trend awareness.
 * - Dynamic: reacts immediately to telemetry drifts, check-ins, and simulation events.
 */

import { HealthMeasurement, MetricBaseline, DailyCheckIn, CognitiveTaskResult } from '../types/health';

export interface HealthStatusInfo {
  label: 'STABLE' | 'MONITOR' | 'ATTENTION' | 'CRITICAL';
  textColor: string;
  badgeBg: string;
  dotColor: string;
  barColor: string;
}

export interface PhysicalHealthSystemData {
  index: number;
  status: HealthStatusInfo;
  baselineRange: string; // e.g. "82–88"
  baselineMin: number;
  baselineMax: number;
  trend: 'STABLE' | 'UP' | 'DOWN';
  trendLabel: string; // e.g. "→ Stable" | "↑ Improving" | "↓ Declining"
  supportingText: string;
  
  // Key Indicators
  cardiovascular: {
    heartRate: number; // e.g. 78 bpm
    hrv: number; // e.g. 44 ms
    trendSymbol: '↑' | '↓' | '→';
    status: 'Normal' | 'Monitor' | 'Attention';
  };
  respiratory: {
    spo2: number; // e.g. 98%
    respiratoryRate: number; // e.g. 16 br/min
    status: 'Normal' | 'Monitor' | 'Attention';
  };
  fitness: {
    exerciseDurationMinutes: number; // e.g. 42 min
    performancePercent: number; // e.g. 72%
    status: 'Normal' | 'Monitor' | 'Attention';
  };
}

export interface MentalHealthSystemData {
  index: number;
  status: HealthStatusInfo;
  baselineRange: string; // e.g. "80–86"
  baselineMin: number;
  baselineMax: number;
  trend: 'STABLE' | 'UP' | 'DOWN';
  trendLabel: string;
  supportingText: string;
  
  // Key Indicators
  cognitive: {
    reactionTimeMs: number; // e.g. 248 ms
    attentionPercent: number; // e.g. 82%
    workingMemoryPercent: number; // e.g. 88%
    status: 'Normal' | 'Monitor' | 'Attention';
  };
  sleepRecovery: {
    sleepFormatted: string; // e.g. "6h 18m"
    sleepMinutes: number;
    recoveryPercent: number; // e.g. 68%
    status: 'Normal' | 'Monitor' | 'Attention';
  };
  wellbeing: {
    moodLabel: 'Optimal' | 'Stable' | 'Guarded' | 'Strained';
    stressPercent: number; // e.g. 32%
    status: 'Normal' | 'Monitor' | 'Attention';
  };
}

export function getStatusStyle(label: 'STABLE' | 'MONITOR' | 'ATTENTION' | 'CRITICAL'): HealthStatusInfo {
  switch (label) {
    case 'STABLE':
      return {
        label: 'STABLE',
        textColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300',
        dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
        barColor: 'from-emerald-500 to-teal-400',
      };
    case 'MONITOR':
      return {
        label: 'MONITOR',
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-950/60 border-amber-800/80 text-amber-300',
        dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
        barColor: 'from-amber-400 to-yellow-500',
      };
    case 'ATTENTION':
      return {
        label: 'ATTENTION',
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-950/70 border-amber-700/80 text-amber-200',
        dotColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]',
        barColor: 'from-amber-500 to-orange-500',
      };
    case 'CRITICAL':
      return {
        label: 'CRITICAL',
        textColor: 'text-rose-400',
        badgeBg: 'bg-rose-950/80 border-rose-700/80 text-rose-200',
        dotColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse',
        barColor: 'from-rose-500 to-red-600',
      };
  }
}

/**
 * Computes the Physical Health Index and sub-indicator matrix.
 */
export function computePhysicalHealthSystem(
  current: HealthMeasurement,
  baselines: MetricBaseline[] = [],
  history: HealthMeasurement[] = []
): PhysicalHealthSystemData {
  const rhrBase = baselines.find(b => b.metricKey === 'restingHeartRate')?.baseline14d || 71;
  const hrvBase = baselines.find(b => b.metricKey === 'hrv')?.baseline14d || 62;
  const spo2Base = baselines.find(b => b.metricKey === 'spo2')?.baseline14d || 98.4;
  const exerciseBase = baselines.find(b => b.metricKey === 'exerciseDurationMinutes')?.baseline14d || 45;

  const currentRhr = current.restingHeartRate || 74;
  const currentHrv = current.hrv || 50;
  const currentSpo2 = current.spo2 || 98;
  const currentRespRate = current.respiratoryRate || 16;
  const currentExercise = current.exerciseDurationMinutes || 42;

  // 1. Cardiovascular Score (35% weight)
  // Evaluates resting heart rate variance and HRV tolerance
  const rhrDev = ((currentRhr - rhrBase) / rhrBase) * 100;
  const rhrScore = Math.max(30, Math.min(100, 100 - Math.max(0, rhrDev - 3) * 2.8));
  
  const hrvDev = ((currentHrv - hrvBase) / hrvBase) * 100;
  const hrvScore = Math.max(25, Math.min(100, 100 + Math.min(0, hrvDev + 5) * 1.8));
  const cardioScore = rhrScore * 0.55 + hrvScore * 0.45;

  // 2. Respiratory Score (25% weight)
  let spo2Score = 100;
  if (currentSpo2 < 92) spo2Score = 20;
  else if (currentSpo2 < 95) spo2Score = 55;
  else if (currentSpo2 < 97) spo2Score = 80;
  else spo2Score = 98;

  const respRateScore = (currentRespRate >= 12 && currentRespRate <= 18) ? 100 : 80;
  const respScore = spo2Score * 0.7 + respRateScore * 0.3;

  // 3. Fitness & Activity Score (25% weight)
  const exerciseScore = Math.min(100, (currentExercise / exerciseBase) * 95);
  const physicalPerformance = Math.min(100, Math.max(40, (current.hydrationIndex || 85) * 0.5 + (exerciseScore * 0.5)));

  // 4. Physical Recovery Component (15% weight)
  const physicalRecoveryScore = current.recoveryScore || 68;

  // Composite Physical Index (0-100)
  const rawIndex = Math.round(
    cardioScore * 0.35 +
    respScore * 0.25 +
    physicalPerformance * 0.25 +
    physicalRecoveryScore * 0.15
  );
  const index = Math.max(10, Math.min(100, rawIndex));

  // Determine Status
  let statusLabel: 'STABLE' | 'MONITOR' | 'ATTENTION' | 'CRITICAL' = 'STABLE';
  if (currentSpo2 < 92 || index < 60) statusLabel = 'CRITICAL';
  else if (index < 70 || rhrDev > 12 || hrvDev < -22) statusLabel = 'ATTENTION';
  else if (index < 80 || rhrDev > 6 || hrvDev < -10) statusLabel = 'MONITOR';

  // Trend determination based on recent telemetry
  let trend: 'STABLE' | 'UP' | 'DOWN' = 'STABLE';
  let trendLabel = '→ Stable';
  if (history.length >= 3) {
    const prev = history[history.length - 2];
    if (prev) {
      const prevRhr = prev.restingHeartRate || 72;
      if (currentRhr > prevRhr + 3) {
        trend = 'DOWN';
        trendLabel = '↓ Declining';
      } else if (currentRhr < prevRhr - 3) {
        trend = 'UP';
        trendLabel = '↑ Improving';
      }
    }
  }

  // Supporting narrative
  let supportingText = 'Within your recent personal baseline.';
  if (statusLabel === 'ATTENTION') {
    supportingText = 'Cardiovascular strain and recovery divergence detected.';
  } else if (statusLabel === 'MONITOR') {
    supportingText = 'Resting heart rate variance slightly above 14-day baseline.';
  } else if (statusLabel === 'CRITICAL') {
    supportingText = 'Critical threshold event requires immediate operational review.';
  }

  // Sub-indicator statuses
  const rhrStatus: 'Normal' | 'Monitor' | 'Attention' = 
    rhrDev > 10 ? 'Attention' : rhrDev > 5 ? 'Monitor' : 'Normal';
  const spo2Status: 'Normal' | 'Monitor' | 'Attention' = 
    currentSpo2 < 95 ? 'Attention' : currentSpo2 < 97 ? 'Monitor' : 'Normal';
  const fitnessStatus: 'Normal' | 'Monitor' | 'Attention' = 
    currentExercise < 30 ? 'Monitor' : 'Normal';

  return {
    index,
    status: getStatusStyle(statusLabel),
    baselineRange: '82–88',
    baselineMin: 82,
    baselineMax: 88,
    trend,
    trendLabel,
    supportingText,
    cardiovascular: {
      heartRate: currentRhr,
      hrv: currentHrv,
      trendSymbol: rhrDev > 3 ? '↑' : rhrDev < -3 ? '↓' : '→',
      status: rhrStatus,
    },
    respiratory: {
      spo2: currentSpo2,
      respiratoryRate: currentRespRate,
      status: spo2Status,
    },
    fitness: {
      exerciseDurationMinutes: currentExercise,
      performancePercent: Math.round(physicalPerformance),
      status: fitnessStatus,
    },
  };
}

/**
 * Computes the Mental Health Index and sub-indicator matrix.
 */
export function computeMentalHealthSystem(
  current: HealthMeasurement,
  baselines: MetricBaseline[] = [],
  checkIn?: DailyCheckIn,
  cognitiveTests: CognitiveTaskResult[] = []
): MentalHealthSystemData {
  const sleepBase = baselines.find(b => b.metricKey === 'sleepDurationMinutes')?.baseline14d || 432;
  const recoveryBase = baselines.find(b => b.metricKey === 'recoveryScore')?.baseline14d || 75;

  const currentSleepMinutes = current.sleepDurationMinutes || 378; // 6h 18m default
  const currentRecovery = current.recoveryScore || 68;

  // 1. Cognitive Performance (30% weight)
  // Reaction time nominal ~248ms, attention ~82%, working memory ~88%
  const reactionTime = current.reactionTimeMs || cognitiveTests.find(t => t.taskType === 'REACTION')?.score || 248;
  const attentionPercent = current.attentionScore || cognitiveTests.find(t => t.taskType === 'ATTENTION')?.score || 82;
  const workingMemoryPercent = current.memoryScore || cognitiveTests.find(t => t.taskType === 'MEMORY')?.score || 88;
  
  // Cognitive score mapping: 240ms = 100, 320ms = 60
  const reactionScore = Math.max(30, Math.min(100, 100 - Math.max(0, reactionTime - 240) * 0.45));
  const cognitiveScore = reactionScore * 0.35 + attentionPercent * 0.35 + workingMemoryPercent * 0.30;

  // 2. Sleep & Autonomic Recovery (30% weight)
  // 8h target (480 min), 14d base ~432 min (7h 12m)
  const sleepRatio = currentSleepMinutes / 480;
  const sleepScore = Math.min(100, Math.max(35, sleepRatio * 100));
  const sleepRecoveryScore = sleepScore * 0.5 + currentRecovery * 0.5;

  // 3. Subjective Wellbeing & Mood (20% weight)
  let moodScore = 80;
  let moodLabel: 'Optimal' | 'Stable' | 'Guarded' | 'Strained' = 'Stable';
  if (checkIn) {
    moodScore = checkIn.mood || 80;
    if (moodScore >= 85) moodLabel = 'Optimal';
    else if (moodScore >= 70) moodLabel = 'Stable';
    else if (moodScore >= 50) moodLabel = 'Guarded';
    else moodLabel = 'Strained';
  }

  // 4. Stress & Autonomic Fatigue (20% weight)
  // Lower stress is better
  let perceivedStress = 32;
  if (checkIn && typeof checkIn.stress === 'number') {
    perceivedStress = checkIn.stress;
  } else if (current.fatigueScore) {
    perceivedStress = Math.round(current.fatigueScore * 0.6 + 10);
  }
  const stressScore = Math.max(20, Math.min(100, 100 - perceivedStress));

  // Composite Mental Index (0-100)
  const rawIndex = Math.round(
    cognitiveScore * 0.30 +
    sleepRecoveryScore * 0.30 +
    moodScore * 0.20 +
    stressScore * 0.20
  );
  const index = Math.max(10, Math.min(100, rawIndex));

  // Determine Status
  let statusLabel: 'STABLE' | 'MONITOR' | 'ATTENTION' | 'CRITICAL' = 'STABLE';
  if (index < 55 || perceivedStress > 75) statusLabel = 'CRITICAL';
  else if (index < 70 || currentRecovery < 50 || perceivedStress > 55) statusLabel = 'ATTENTION';
  else if (index < 80 || currentSleepMinutes < 390 || currentRecovery < 70) statusLabel = 'MONITOR';

  // Sleep formatted string e.g. "6h 18m"
  const hours = Math.floor(currentSleepMinutes / 60);
  const mins = Math.round(currentSleepMinutes % 60);
  const sleepFormatted = `${hours}h ${mins}m`;

  // Trend determination
  let trend: 'STABLE' | 'UP' | 'DOWN' = 'STABLE';
  let trendLabel = '→ Stable';
  if (currentRecovery < recoveryBase - 8) {
    trend = 'DOWN';
    trendLabel = '↓ Mild Dip';
  } else if (currentRecovery > recoveryBase + 6) {
    trend = 'UP';
    trendLabel = '↑ Improving';
  }

  // Supporting narrative
  let supportingText = 'Within your recent personal baseline.';
  if (statusLabel === 'ATTENTION') {
    supportingText = 'Sleep compression and elevated fatigue impacting recovery.';
  } else if (statusLabel === 'MONITOR') {
    supportingText = 'Sleep opportunity compressed; cognitive vigilance remains resilient.';
  }

  // Sub-indicators statuses
  const cognitiveStatus: 'Normal' | 'Monitor' | 'Attention' = 
    reactionTime > 300 ? 'Monitor' : 'Normal';
  const sleepStatus: 'Normal' | 'Monitor' | 'Attention' = 
    currentSleepMinutes < 360 ? 'Attention' : currentSleepMinutes < 400 ? 'Monitor' : 'Normal';
  const wellbeingStatus: 'Normal' | 'Monitor' | 'Attention' = 
    perceivedStress > 50 ? 'Monitor' : 'Normal';

  return {
    index,
    status: getStatusStyle(statusLabel),
    baselineRange: '80–86',
    baselineMin: 80,
    baselineMax: 86,
    trend,
    trendLabel,
    supportingText,
    cognitive: {
      reactionTimeMs: Math.round(reactionTime),
      attentionPercent: Math.round(attentionPercent),
      workingMemoryPercent: Math.round(workingMemoryPercent),
      status: cognitiveStatus,
    },
    sleepRecovery: {
      sleepFormatted,
      sleepMinutes: currentSleepMinutes,
      recoveryPercent: currentRecovery,
      status: sleepStatus,
    },
    wellbeing: {
      moodLabel,
      stressPercent: perceivedStress,
      status: wellbeingStatus,
    },
  };
}

/**
 * Standard centralized API function for Physical Health Index
 */
export function calculatePhysicalHealthIndex(data: {
  current: HealthMeasurement;
  baselines?: MetricBaseline[];
  history?: HealthMeasurement[];
}): number {
  if (!data?.current) return 0;
  return computePhysicalHealthSystem(data.current, data.baselines || [], data.history || []).index;
}

/**
 * Standard centralized API function for Mental Health Index
 */
export function calculateMentalHealthIndex(data: {
  current: HealthMeasurement;
  baselines?: MetricBaseline[];
  checkIn?: DailyCheckIn;
  cognitiveTests?: CognitiveTaskResult[];
}): number {
  if (!data?.current) return 0;
  return computeMentalHealthSystem(data.current, data.baselines || [], data.checkIn, data.cognitiveTests || []).index;
}
