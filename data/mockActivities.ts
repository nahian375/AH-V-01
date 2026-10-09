/**
 * ASTRA Health - Initial Mock Activity Data
 * Realistic spaceflight exercise, hydration, nutrition, and operational tasks for Mars-01 cruise phase.
 */

import { ActivityRecord } from '../types/activity';

export function generateInitialActivities(): ActivityRecord[] {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  return [
    // Sol 184 (Today) Activities
    {
      id: 'act-sol-184-1',
      timestamp: new Date(now - 1.5 * ONE_HOUR).toISOString(),
      sol: 184,
      crewId: 'sarah-chen',
      category: 'HYDRATION',
      title: 'Electrolyte Hydration Pack',
      details: '500 ml electrolyte-balanced mineral water packet logged post-morning duty.',
      metrics: {
        volumeMl: 500,
      },
      loggedBy: 'ASTRONAUT',
      synced: true,
    },
    {
      id: 'act-sol-184-2',
      timestamp: new Date(now - 3.5 * ONE_HOUR).toISOString(),
      sol: 184,
      crewId: 'sarah-chen',
      category: 'EXERCISE',
      title: 'CEVIS Cycle Ergometer Aerobic Session',
      details: '45-minute continuous aerobic interval training at 180W. Avg HR: 138 bpm.',
      intensity: 'MODERATE',
      metrics: {
        durationMinutes: 45,
        watts: 180,
        calories: 380,
        heartRateAvg: 138,
        rpe: 6,
      },
      loggedBy: 'SENSOR_TELEMETRY',
      synced: true,
    },
    {
      id: 'act-sol-184-3',
      timestamp: new Date(now - 5 * ONE_HOUR).toISOString(),
      sol: 184,
      crewId: 'sarah-chen',
      category: 'NUTRITION',
      title: 'Mid-Sol Ration Pack #3 (High Protein)',
      details: 'Rehydrated chicken fajita pouch, freeze-dried quinoa, dried peach slices.',
      metrics: {
        calories: 820,
        volumeMl: 350,
      },
      loggedBy: 'ASTRONAUT',
      synced: true,
    },
    {
      id: 'act-sol-184-4',
      timestamp: new Date(now - 7 * ONE_HOUR).toISOString(),
      sol: 184,
      crewId: 'sarah-chen',
      category: 'TASK',
      title: 'Life Support ECLSS Filter Inspection',
      details: 'Verified differential pressure on secondary CO2 scrubber bed. Nominal 0.42 kPa.',
      metrics: {
        durationMinutes: 35,
        completionPct: 100,
      },
      loggedBy: 'ASTRONAUT',
      synced: true,
    },
    {
      id: 'act-sol-184-5',
      timestamp: new Date(now - 9 * ONE_HOUR).toISOString(),
      sol: 184,
      crewId: 'sarah-chen',
      category: 'MINDFULNESS',
      title: 'Guided Respiration & Biofeedback',
      details: '15-minute 4-4-4-4 diaphragmatic box breathing cycle to reduce sympathetic tone.',
      metrics: {
        durationMinutes: 15,
        heartRateAvg: 64,
      },
      loggedBy: 'ASTRA_AI',
      synced: true,
    },
    {
      id: 'act-sol-184-6',
      timestamp: new Date(now - 11 * ONE_HOUR).toISOString(),
      sol: 184,
      crewId: 'sarah-chen',
      category: 'HYDRATION',
      title: 'Morning Fluid Intake',
      details: '650 ml ambient potable water with Vitamin D3 supplement.',
      metrics: {
        volumeMl: 650,
      },
      loggedBy: 'ASTRONAUT',
      synced: true,
    },
    {
      id: 'act-sol-184-7',
      timestamp: new Date(now - 12 * ONE_HOUR).toISOString(),
      sol: 184,
      crewId: 'sarah-chen',
      category: 'NUTRITION',
      title: 'Breakfast Ration (Oatmeal & Berries)',
      details: 'Whole oat cereal, fortified almond milk powder, freeze-dried blueberry flakes.',
      metrics: {
        calories: 680,
        volumeMl: 300,
      },
      loggedBy: 'ASTRONAUT',
      synced: true,
    },

    // Sol 183 Activities
    {
      id: 'act-sol-183-1',
      timestamp: new Date(now - 1 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      sol: 183,
      crewId: 'sarah-chen',
      category: 'EXERCISE',
      title: 'ARED Heavy Resistive Countermeasures',
      details: 'Deadlifts, squats, heel raises, and bench press. 1,380 kg aggregate load.',
      intensity: 'HIGH',
      metrics: {
        durationMinutes: 65,
        loadKg: 1380,
        calories: 520,
        heartRateAvg: 148,
        rpe: 8,
      },
      loggedBy: 'SENSOR_TELEMETRY',
      synced: true,
    },
    {
      id: 'act-sol-183-2',
      timestamp: new Date(now - 1 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      sol: 183,
      crewId: 'sarah-chen',
      category: 'TASK',
      title: 'EVA Suit Umbilical Pressure Calibration',
      details: 'Suit 02 primary regulator pressure bench checked. Leak rate: 0.00 psi/min.',
      metrics: {
        durationMinutes: 45,
        completionPct: 100,
      },
      loggedBy: 'ASTRONAUT',
      synced: true,
    },
    {
      id: 'act-sol-183-3',
      timestamp: new Date(now - 1 * ONE_DAY - 6 * ONE_HOUR).toISOString(),
      sol: 183,
      crewId: 'sarah-chen',
      category: 'HYDRATION',
      title: 'Daily Hydration Total (Sol 183)',
      details: 'Cumulative fluid intake reached 2,450 ml across 5 scheduled drinking logs.',
      metrics: {
        volumeMl: 2450,
      },
      loggedBy: 'ASTRA_AI',
      synced: true,
    },
  ];
}
