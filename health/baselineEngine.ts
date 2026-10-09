/**
 * ASTRA Health - Baseline Engine
 * Calculates 7-day, 14-day, and 30-day personal baseline metrics.
 * Compares current measurements against the astronaut's own baseline.
 */

import { HealthMeasurement, MetricBaseline, HealthSeverity } from '../types/health';

interface MetricDef {
  key: keyof HealthMeasurement;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  thresholdMonitorPercent: number;
  thresholdAttentionPercent: number;
}

const METRIC_DEFS: MetricDef[] = [
  { key: 'restingHeartRate', label: 'Resting Heart Rate', unit: 'bpm', higherIsBetter: false, thresholdMonitorPercent: 6, thresholdAttentionPercent: 10 },
  { key: 'hrv', label: 'Heart Rate Variability', unit: 'ms', higherIsBetter: true, thresholdMonitorPercent: 15, thresholdAttentionPercent: 25 },
  { key: 'sleepDurationMinutes', label: 'Sleep Duration', unit: 'min', higherIsBetter: true, thresholdMonitorPercent: 12, thresholdAttentionPercent: 18 },
  { key: 'recoveryScore', label: 'Recovery Score', unit: '/100', higherIsBetter: true, thresholdMonitorPercent: 15, thresholdAttentionPercent: 25 },
  { key: 'fatigueScore', label: 'Fatigue Index', unit: '/100', higherIsBetter: false, thresholdMonitorPercent: 25, thresholdAttentionPercent: 45 },
  { key: 'bloodPressureSystolic', label: 'Systolic BP', unit: 'mmHg', higherIsBetter: false, thresholdMonitorPercent: 8, thresholdAttentionPercent: 15 },
  { key: 'spo2', label: 'Blood Oxygen (SpO2)', unit: '%', higherIsBetter: true, thresholdMonitorPercent: 2, thresholdAttentionPercent: 4 },
  { key: 'respiratoryRate', label: 'Respiratory Rate', unit: 'br/min', higherIsBetter: false, thresholdMonitorPercent: 15, thresholdAttentionPercent: 25 },
  { key: 'exerciseDurationMinutes', label: 'Daily Exercise', unit: 'min', higherIsBetter: true, thresholdMonitorPercent: 15, thresholdAttentionPercent: 25 },
  { key: 'dailyRadiation_uSv', label: 'Daily Radiation', unit: 'µSv', higherIsBetter: false, thresholdMonitorPercent: 20, thresholdAttentionPercent: 40 },
];

export function computeBaselines(history: HealthMeasurement[]): MetricBaseline[] {
  if (!history || history.length === 0) return [];

  // Sort by sol ascending
  const sorted = [...history].sort((a, b) => a.sol - b.sol);
  const current = sorted[sorted.length - 1];

  const last7 = sorted.slice(-7);
  const last14 = sorted.slice(-14);
  const last30 = sorted.slice(-30);

  return METRIC_DEFS.map((def) => {
    const currentValue = Number(current[def.key] ?? 0);
    
    const avg7 = calculateAverage(last7, def.key);
    const avg14 = calculateAverage(last14, def.key);
    const avg30 = calculateAverage(last30, def.key);

    // Primary comparison against 14-day rolling baseline
    const referenceBaseline = avg14 > 0 ? avg14 : avg7;
    const diff = currentValue - referenceBaseline;
    const deviationPercent = referenceBaseline > 0 ? Number(((diff / referenceBaseline) * 100).toFixed(1)) : 0;

    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    if (deviationPercent > 2.5) trend = 'UP';
    else if (deviationPercent < -2.5) trend = 'DOWN';

    // Status evaluation based on directionality and threshold
    const absDev = Math.abs(deviationPercent);
    const isDegraded = def.higherIsBetter ? (deviationPercent < 0) : (deviationPercent > 0);

    let status: HealthSeverity = 'GREEN';
    if (isDegraded) {
      if (absDev >= def.thresholdAttentionPercent) {
        status = 'ORANGE';
      } else if (absDev >= def.thresholdMonitorPercent) {
        status = 'YELLOW';
      }
    }

    return {
      metricKey: def.key as string,
      label: def.label,
      unit: def.unit,
      currentValue: Number(currentValue.toFixed(1)),
      baseline7d: Number(avg7.toFixed(1)),
      baseline14d: Number(avg14.toFixed(1)),
      baseline30d: Number(avg30.toFixed(1)),
      deviationPercent,
      trend,
      status,
    };
  });
}

function calculateAverage(data: HealthMeasurement[], key: keyof HealthMeasurement): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
  return sum / data.length;
}
