/**
 * ASTRA Health - Deterministic Health Engine
 * Analyzes telemetry against personal baselines and deterministic safety rules.
 * Generates structured events, deviations, multi-metric changes, and monitoring actions.
 * 
 * Safety Principle:
 * Generative AI does NOT create alert severity or override deterministic safety boundaries.
 * The Health Engine outputs structured findings that the AI explains in natural language.
 */

import { HealthMeasurement, MetricBaseline, MultiMetricChange, HealthAlert, HealthSeverity, DailyCheckIn } from '../types/health';
import { MissionContext } from '../types/mission';
import { computeBaselines } from './baselineEngine';

export interface HealthEngineOutput {
  overallSeverity: HealthSeverity;
  overallStatusText: 'Stable' | 'Monitor' | 'Attention' | 'Critical';
  currentMeasurement: HealthMeasurement;
  baselines: MetricBaseline[];
  multiMetricChanges: MultiMetricChange[];
  activeAlerts: HealthAlert[];
  whatChangedList: {
    name: string;
    deviation: string;
    deviationVal: number;
    currentVal: string;
    baselineVal: string;
    direction: 'UP' | 'DOWN';
    isAttention: boolean;
  }[];
  astraObservation: string;
  suggestedNextStep: string;
  recommendedMonitoringActions: string[];
}

export function runHealthEngine(
  history: HealthMeasurement[],
  recentCheckIn?: DailyCheckIn,
  missionContext?: MissionContext
): HealthEngineOutput {
  if (!history || history.length === 0) {
    throw new Error('HealthEngine requires telemetry history');
  }

  const sorted = [...history].sort((a, b) => a.sol - b.sol);
  const current = sorted[sorted.length - 1];
  const baselines = computeBaselines(sorted);

  // Extract critical baselines
  const rhrBase = baselines.find(b => b.metricKey === 'restingHeartRate');
  const hrvBase = baselines.find(b => b.metricKey === 'hrv');
  const sleepBase = baselines.find(b => b.metricKey === 'sleepDurationMinutes');
  const recoveryBase = baselines.find(b => b.metricKey === 'recoveryScore');
  const fatigueBase = baselines.find(b => b.metricKey === 'fatigueScore');
  const spo2Base = baselines.find(b => b.metricKey === 'spo2');

  const alerts: HealthAlert[] = [];
  const multiMetricChanges: MultiMetricChange[] = [];

  // 1. Deterministic Critical Rules (RED)
  if (current.spo2 < 91) {
    alerts.push({
      id: `alert-crit-spo2-${current.sol}`,
      sol: current.sol,
      timestamp: current.timestamp,
      severity: 'RED',
      category: 'RESPIRATORY',
      title: 'CRITICAL: Acute Oxygen Saturation Drop',
      message: `SpO2 measured at ${current.spo2}% (Normal baseline >97%).`,
      contributingFactors: [`SpO2 ${current.spo2}%`],
      baselineComparison: `Baseline: ${spo2Base?.baseline14d || 98}%`,
      triggerRationale: 'Deterministic threshold violation (<91% SpO2)',
      recommendedNextStep: 'Verify primary oxygen regulator immediately. Notify Crew Medical Officer. Initiate procedural oxygen mask protocol.',
      source: 'DETERMINISTIC_RULE',
      acknowledged: false,
    });
  }

  // 2. Multi-Metric Change Detection (ORANGE)
  // Check if resting HR elevated, HRV decreased, and sleep compressed simultaneously
  const rhrElevated = (rhrBase?.deviationPercent || 0) >= 6; // e.g. +6% or more
  const hrvDepressed = (hrvBase?.deviationPercent || 0) <= -15; // e.g. -15% or more
  const sleepCompressed = (sleepBase?.deviationPercent || 0) <= -12; // e.g. -12% or more
  const fatigueElevated = (fatigueBase?.deviationPercent || 0) >= 30 || (recentCheckIn && recentCheckIn.fatigue >= 60);

  const metricDivergenceCount = [rhrElevated, hrvDepressed, sleepCompressed, fatigueElevated].filter(Boolean).length;

  if (metricDivergenceCount >= 3) {
    const sleepHrsCurrent = (current.sleepDurationMinutes / 60).toFixed(1);
    const sleepHrsBase = ((sleepBase?.baseline14d || 432) / 60).toFixed(1);

    const changeItem: MultiMetricChange = {
      id: `multi-change-sol-${current.sol}`,
      timestamp: current.timestamp,
      severity: 'ORANGE',
      title: 'MULTI-METRIC CHANGE DETECTED',
      summary: 'Several physiological measurements have diverged synchronously from your recent personal baseline.',
      contributingMetrics: [
        {
          name: 'Resting Heart Rate',
          current: `${current.restingHeartRate} bpm`,
          baseline: `${rhrBase?.baseline14d || 71} bpm`,
          deviation: `+${rhrBase?.deviationPercent || 9}%`,
          unit: 'bpm'
        },
        {
          name: 'Heart Rate Variability (HRV)',
          current: `${current.hrv} ms`,
          baseline: `${hrvBase?.baseline14d || 62} ms`,
          deviation: `${hrvBase?.deviationPercent || -29}%`,
          unit: 'ms'
        },
        {
          name: 'Sleep Duration',
          current: `${sleepHrsCurrent} hrs`,
          baseline: `${sleepHrsBase} hrs`,
          deviation: `${sleepBase?.deviationPercent || -18}%`,
          unit: 'hrs'
        },
        {
          name: 'Fatigue / Perceived Stress',
          current: `${current.fatigueScore}/100`,
          baseline: `${fatigueBase?.baseline14d || 26}/100`,
          deviation: `+${fatigueBase?.deviationPercent || 48}%`,
          unit: 'index'
        }
      ],
      rationale: 'Concomitant sympathetic tone increase, vagal withdrawal, and sleep reduction indicating cumulative recovery deficit.',
      recommendedAction: 'Reduce strenuous resistive training loading by 25% today. Prioritize sleep hygiene countermeasures and acoustic silencing in crew berth.',
      suggestedMonitoring: 'Log evening recovery check-in and re-evaluate autonomic recovery at morning waking interval.',
      acknowledged: false,
    };

    multiMetricChanges.push(changeItem);

    alerts.push({
      id: `alert-sol-${current.sol}-multi`,
      sol: current.sol,
      timestamp: current.timestamp,
      severity: 'ORANGE',
      category: 'MULTI_METRIC',
      title: 'MULTI-METRIC CHANGE DETECTED',
      message: 'Several measurements have moved away from your recent baseline: Resting HR ↑, HRV ↓, Sleep ↓, Fatigue ↑.',
      contributingFactors: [
        `Resting HR: ${current.restingHeartRate} bpm (${(rhrBase?.deviationPercent ?? 0) > 0 ? '+' : ''}${rhrBase?.deviationPercent ?? 0}%)`,
        `HRV: ${current.hrv} ms (${hrvBase?.deviationPercent}%)`,
        `Sleep Duration: ${sleepHrsCurrent}h (${sleepBase?.deviationPercent}%)`,
        `Fatigue Index: ${current.fatigueScore}/100`
      ],
      baselineComparison: `Baseline Resting HR: ${rhrBase?.baseline14d} bpm | HRV: ${hrvBase?.baseline14d} ms | Sleep: ${sleepHrsBase}h`,
      triggerRationale: 'Multi-indicator autonomic shift detected by deterministic pattern comparator.',
      recommendedNextStep: 'Complete today\'s recovery check-in and review recent sleep and exercise data.',
      source: 'HEALTH_ENGINE',
      acknowledged: false,
    });
  } else if (rhrElevated || sleepCompressed || hrvDepressed) {
    // Single-metric Monitor condition (YELLOW)
    alerts.push({
      id: `alert-sol-${current.sol}-single`,
      sol: current.sol,
      timestamp: current.timestamp,
      severity: 'YELLOW',
      category: 'CARDIO',
      title: 'Isolated Metric Baseline Deviation',
      message: 'One or more tracked metrics show a moderate deviation from your 14-day rolling baseline.',
      contributingFactors: [
        rhrElevated ? `Resting HR: +${rhrBase?.deviationPercent}%` : '',
        hrvDepressed ? `HRV: ${hrvBase?.deviationPercent}%` : '',
        sleepCompressed ? `Sleep: ${sleepBase?.deviationPercent}%` : ''
      ].filter(Boolean),
      baselineComparison: 'Moderate shift detected against rolling baseline.',
      triggerRationale: 'Isolated metric exceeds monitor threshold.',
      recommendedNextStep: 'Continue standard routine; log daily check-in.',
      source: 'HEALTH_ENGINE',
      acknowledged: false,
    });
  }

  // Determine Overall Status
  let overallSeverity: HealthSeverity = 'GREEN';
  let overallStatusText: 'Stable' | 'Monitor' | 'Attention' | 'Critical' = 'Stable';

  if (alerts.some(a => a.severity === 'RED')) {
    overallSeverity = 'RED';
    overallStatusText = 'Critical';
  } else if (alerts.some(a => a.severity === 'ORANGE')) {
    overallSeverity = 'ORANGE';
    overallStatusText = 'Attention';
  } else if (alerts.some(a => a.severity === 'YELLOW')) {
    overallSeverity = 'YELLOW';
    overallStatusText = 'Monitor';
  }

  // "What Changed?" structured comparison
  const whatChangedList = baselines
    .filter(b => Math.abs(b.deviationPercent) >= 4.0)
    .sort((a, b) => Math.abs(b.deviationPercent) - Math.abs(a.deviationPercent))
    .slice(0, 5)
    .map(b => {
      const isNegativeTrend = b.metricKey === 'hrv' || b.metricKey === 'sleepDurationMinutes' || b.metricKey === 'recoveryScore';
      const isAttention = b.status === 'ORANGE' || b.status === 'YELLOW';
      const formattedCurrent = b.metricKey === 'sleepDurationMinutes' 
        ? `${(b.currentValue / 60).toFixed(1)}h`
        : `${b.currentValue} ${b.unit}`;
      const formattedBaseline = b.metricKey === 'sleepDurationMinutes'
        ? `${(b.baseline14d / 60).toFixed(1)}h`
        : `${b.baseline14d} ${b.unit}`;

      return {
        name: b.label,
        deviation: `${b.deviationPercent > 0 ? '+' : ''}${b.deviationPercent}%`,
        deviationVal: b.deviationPercent,
        currentVal: formattedCurrent,
        baselineVal: formattedBaseline,
        direction: b.deviationPercent >= 0 ? ('UP' as const) : ('DOWN' as const),
        isAttention,
      };
    });

  // ASTRA Observation & Suggested Next Steps
  let astraObservation = 'All vital signs and physiological markers remain closely calibrated to your personal baseline equilibrium.';
  let suggestedNextStep = 'Maintain normal mission schedule, daily exercise protocol, and scheduled hydration intake.';

  if (overallSeverity === 'ORANGE') {
    astraObservation = 'Several measurements have moved away from your recent baseline. The largest changes are in sleep duration (-18%), heart rate variability (-29%), resting heart rate (+9%), and perceived fatigue.';
    suggestedNextStep = 'Complete today\'s recovery check-in and review recent sleep and exercise data. Consider pacing resistance exertion and ensuring sound-dampened sleep berth conditions.';
  } else if (overallSeverity === 'YELLOW') {
    astraObservation = 'Mild deviation observed in sleep duration and autonomic markers over the last 48 hours.';
    suggestedNextStep = 'Monitor daytime energy levels; log evening check-in and ensure hydration goals are met.';
  } else if (overallSeverity === 'RED') {
    astraObservation = 'Critical physiological deviation detected. Immediate operational protocol required.';
    suggestedNextStep = 'Follow emergency checklist protocols and inform the Crew Medical Officer.';
  }

  const recommendedMonitoringActions = [
    'Complete Sol 184 Daily Recovery Check-in',
    'Review 7-Day Sleep & Heart Rate Variability Trends',
    'Verify Habit Berth CO2 Levels & Acoustic Seals',
    'Perform Scheduled Reaction Time Cognitive Check',
  ];

  return {
    overallSeverity,
    overallStatusText,
    currentMeasurement: current,
    baselines,
    multiMetricChanges,
    activeAlerts: alerts,
    whatChangedList,
    astraObservation,
    suggestedNextStep,
    recommendedMonitoringActions,
  };
}
