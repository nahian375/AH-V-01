/**
 * ASTRA Health - Astronaut Activity & Daily Operations Tracking Types
 * Tracks exercise, hydration, nutrition, operational duties, cognitive/mindfulness, and rest.
 */

export type ActivityCategory = 
  | 'EXERCISE' 
  | 'HYDRATION' 
  | 'NUTRITION' 
  | 'TASK' 
  | 'MINDFULNESS' 
  | 'REST';

export type ActivityIntensity = 'LOW' | 'MODERATE' | 'HIGH' | 'MAXIMAL';

export interface ActivityMetrics {
  durationMinutes?: number;
  watts?: number; // Aerobic output
  loadKg?: number; // Resistive aggregate load
  calories?: number; // kCal expended or consumed
  volumeMl?: number; // Fluid intake (ml)
  heartRateAvg?: number; // bpm
  completionPct?: number; // 0 - 100%
  rpe?: number; // Rate of Perceived Exertion (1 - 10)
}

export interface ActivityRecord {
  id: string;
  timestamp: string; // ISO date-time
  sol: number; // Mars Sol
  crewId: string;
  category: ActivityCategory;
  title: string;
  details: string;
  durationMinutes?: number;
  intensity?: ActivityIntensity;
  metrics?: ActivityMetrics;
  loggedBy: 'ASTRONAUT' | 'ASTRA_AI' | 'SENSOR_TELEMETRY';
  synced?: boolean;
}

export interface DailyActivityTarget {
  category: ActivityCategory;
  label: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  percentage: number;
  status: 'OPTIMAL' | 'ON_TRACK' | 'BEHIND';
}

export interface DailyActivitySummary {
  sol: number;
  date: string;
  exerciseMinutesTotal: number; // Target: 120 min
  hydrationMlTotal: number; // Target: 2500 ml
  caloriesConsumedTotal: number; // Target: 3000 kcal
  caloriesBurnedTotal: number;
  tasksCompleted: number; // Target: 4
  mindfulnessMinutesTotal: number; // Target: 15 min
  targets: DailyActivityTarget[];
  recentActivities: ActivityRecord[];
}
