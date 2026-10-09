/**
 * ASTRA Health - 30-Day Astronaut Telemetry Simulation Dataset
 * Commander Sarah Chen, Mission MARS-01
 * Sol 155 to Sol 184 (Current Sol)
 * 
 * Realistic physiological model:
 * Days 1-20 (Sol 155-174): Stable equilibrium baseline
 * Days 21-24 (Sol 175-178): Sleep compression drift begins
 * Days 23-27 (Sol 177-181): Fatigue and autonomic strain accumulate
 * Days 24-28 (Sol 178-184): Resting HR elevates, HRV decreases, Recovery depresses
 * Sol 184 (Today): Multi-metric deviation detected for monitoring
 */

import { HealthMeasurement } from '../types/health';

export function generateInitialTelemetry(): HealthMeasurement[] {
  const measurements: HealthMeasurement[] = [];
  const currentSol = 184;

  for (let i = 29; i >= 0; i--) {
    const sol = currentSol - i;
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString();

    // Baseline values
    let restingHr = 69 + Math.round((Math.sin(sol * 0.7) * 2));
    let hrv = 64 + Math.round((Math.cos(sol * 0.5) * 4));
    let sleepMinutes = 435 + Math.round((Math.sin(sol * 0.9) * 20)); // ~7.25h
    let sleepQuality = 84 + Math.round((Math.sin(sol * 0.4) * 5));
    let recoveryScore = 84 + Math.round((Math.cos(sol * 0.6) * 4));
    let fatigueScore = 24 + Math.round((Math.sin(sol * 0.3) * 5));
    let systolic = 118 + Math.round((Math.sin(sol * 0.4) * 3));
    let diastolic = 76 + Math.round((Math.cos(sol * 0.4) * 2));
    let spo2 = 98.4 + (Math.sin(sol) * 0.4);
    let respRate = 13.5 + (Math.cos(sol * 0.3) * 0.5);
    let exerciseMins = 120 + Math.round((Math.sin(sol * 0.8) * 10)); // 2hr mandatory microgravity countermeasure
    let resistanceKg = 1420 + Math.round((Math.cos(sol * 0.5) * 40));
    let aerobicWatts = 185 + Math.round((Math.sin(sol * 0.5) * 10));
    let dailyRad_uSv = 420 + Math.round((Math.sin(sol * 0.2) * 35)); // deep space cruise ambient
    let cumulativeRad_mSv = 76.5 + ((30 - i) * 0.42);

    // Realistic health drift scenario in the last 7-10 days
    if (sol >= 175 && sol <= 178) {
      // Sleep compression begins
      const progress = (sol - 174) / 4;
      sleepMinutes = Math.round(sleepMinutes - (progress * 50)); // down towards 6.2h
      sleepQuality = Math.round(sleepQuality - (progress * 12));
      fatigueScore = Math.round(fatigueScore + (progress * 16));
    } else if (sol >= 179) {
      // Days 25-30: Cumulative autonomic & recovery depression
      const progress = Math.min(1.0, (sol - 178) / 6);
      restingHr = Math.round(71 + (progress * 10)); // reaches 81 bpm (+9%)
      hrv = Math.round(63 - (progress * 19)); // drops to 44 ms (-29%)
      sleepMinutes = Math.round(430 - (progress * 76)); // drops to 354 mins (5h 54m, -18%)
      sleepQuality = Math.round(82 - (progress * 24)); // drops to 58
      recoveryScore = Math.round(83 - (progress * 35)); // drops to 48
      fatigueScore = Math.round(26 + (progress * 42)); // rises to 68
      systolic = Math.round(118 + (progress * 5)); // slight reactive elevation 123
      diastolic = Math.round(76 + (progress * 4)); // 80
      exerciseMins = Math.round(120 - (progress * 15)); // 105 mins due to fatigue
    }

    measurements.push({
      id: `telemetry-sol-${sol}`,
      timestamp: dateStr,
      sol,
      crewId: 'sarah-chen',
      heartRate: restingHr + 6,
      restingHeartRate: restingHr,
      hrv,
      bloodPressureSystolic: systolic,
      bloodPressureDiastolic: diastolic,
      spo2: Number(spo2.toFixed(1)),
      respiratoryRate: Number(respRate.toFixed(1)),
      sleepDurationMinutes: sleepMinutes,
      sleepQuality,
      sleepConsistency: 88 - (sol >= 179 ? 18 : 0),
      recoveryScore,
      fatigueScore,
      exerciseDurationMinutes: exerciseMins,
      resistanceLoadKg: resistanceKg,
      aerobicOutputWatts: aerobicWatts,
      coreTemperature: 36.8 + (sol >= 181 ? 0.2 : 0),
      hydrationIndex: 92 - (sol >= 181 ? 8 : 0),
      dailyRadiation_uSv: dailyRad_uSv,
      cumulativeRadiation_mSv: Number(cumulativeRad_mSv.toFixed(2)),
      reactionTimeMs: sol >= 180 ? 275 : 235,
      memoryScore: sol >= 180 ? 84 : 94,
      attentionScore: sol >= 180 ? 81 : 92,
      isSimulated: true,
    });
  }

  return measurements;
}
