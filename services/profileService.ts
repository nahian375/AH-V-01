/**
 * ASTRA Health - Astronaut Profile Service & Local Persistence
 * 100% offline-capable, reactive across tabs, with zero external dependencies.
 * Stores astronaut mission profile, body physiology, and space baseline references.
 */

import { AstronautProfile, PersonalSpaceBaseline } from '../types/profile';

const STORAGE_KEY_PROFILE = 'astra_astronaut_profile';
const STORAGE_KEY_ONBOARDING_DONE = 'astra_profile_onboarding_completed';

export const DEFAULT_PERSONAL_SPACE_BASELINE: PersonalSpaceBaseline = {
  restingHeartRate: {
    metricKey: 'restingHeartRate',
    label: 'Resting Heart Rate',
    unit: 'bpm',
    preFlightValue: 61,
    inFlightBaseline: 67,
    currentValue: 72,
    differenceFromInFlight: 5,
    differenceFromPreFlight: 11,
    status: 'Monitoring',
    note: 'Cephalad fluid shift & microgravity cardiovascular adaptation shift in-flight baseline.',
  },
  hrv: {
    metricKey: 'hrv',
    label: 'Heart Rate Variability (RMSSD)',
    unit: 'ms',
    preFlightValue: 62,
    inFlightBaseline: 48,
    currentValue: 44,
    differenceFromInFlight: -4,
    differenceFromPreFlight: -18,
    status: 'Changing',
    note: 'Sympathetic tone slightly elevated during high duty cycle days.',
  },
  sleepDuration: {
    metricKey: 'sleepDuration',
    label: 'Sleep Duration',
    unit: 'hours',
    preFlightValue: 7.8,
    inFlightBaseline: 6.8,
    currentValue: 5.9,
    differenceFromInFlight: -0.9,
    differenceFromPreFlight: -1.9,
    status: 'Monitoring',
    note: 'Sleep berth acoustic variance and schedule compression.',
  },
  bloodPressureSystolic: {
    metricKey: 'bloodPressureSystolic',
    label: 'Systolic Blood Pressure',
    unit: 'mmHg',
    preFlightValue: 118,
    inFlightBaseline: 122,
    currentValue: 124,
    differenceFromInFlight: 2,
    differenceFromPreFlight: 6,
    status: 'Stable',
    note: 'Central venous pressure adaptation within expected cruise envelope.',
  },
  spo2: {
    metricKey: 'spo2',
    label: 'Blood Oxygen (SpO₂)',
    unit: '%',
    preFlightValue: 99,
    inFlightBaseline: 97,
    currentValue: 98,
    differenceFromInFlight: 1,
    differenceFromPreFlight: -1,
    status: 'Stable',
    note: 'Cabin pressure regulated at 101.3 kPa with 21% O₂.',
  },
  coreTemperature: {
    metricKey: 'coreTemperature',
    label: 'Core Temperature',
    unit: '°C',
    preFlightValue: 36.6,
    inFlightBaseline: 36.9,
    currentValue: 37.0,
    differenceFromInFlight: 0.1,
    differenceFromPreFlight: 0.4,
    status: 'Stable',
    note: 'Spaceflight microgravity thermoregulation elevation (~0.3°C ambient shift).',
  },
  lastCalculatedSol: 47,
  explanation: 'Current in-flight baseline is an evolving monitoring baseline reflecting spaceflight physiological adaptation. It is not automatically declared medically normal.',
};

const DEFAULT_PROFILE: AstronautProfile = {
  id: 'astronaut-profile-primary',
  isConfigured: true,
  identity: {
    fullName: 'Alex Carter',
    preferredName: 'Alex',
    astronautId: 'AST-001',
    callSign: 'Orion',
    role: 'Mission Specialist',
    crewPosition: 'Mission Specialist',
    agency: 'International Space Agency',
    age: 34,
    bloodGroup: 'O+',
    bloodGroupVerification: 'Verified pre-flight',
    lastUpdated: 'Sol 47',
  },
  body: {
    heightCm: 178,
    baselineWeightKg: 72,
    currentWeightKg: 71.4,
    lastWeightUpdateSol: 42,
    heightVerification: 'Baseline recorded pre-flight',
    weightVerification: 'Updated: Sol 42',
  },
  mission: {
    missionName: 'MARS TRANSIT — DEMO',
    missionId: 'MIS-MARS-01',
    startDate: '2026-03-15',
    durationDays: 180,
    currentMissionDay: 47,
    destination: 'Mars',
    phase: 'Transit',
    gravityEnvironment: 'Microgravity',
    communicationStatus: 'ONLINE',
    crewAssignment: 'Crew Alpha - Habitation Module 01',
    status: 'HEALTH MONITORING ACTIVE',
  },
  personalBaseline: DEFAULT_PERSONAL_SPACE_BASELINE,
  preferences: {
    units: 'metric',
    timeFormat: '24h',
    dateFormat: 'YYYY-MM-DD',
    temperatureUnit: 'celsius',
    reducedMotion: false,
    fontSize: 'normal',
    highContrast: false,
    healthReminders: true,
    measurementReminders: true,
    missionAlerts: true,
    aiNotifications: true,
    aiMode: 'auto',
    voiceInteraction: false,
    responseStyle: 'concise',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  syncStatus: 'local',
};

// In-memory cache
let cachedProfile: AstronautProfile | null = null;
const listeners = new Set<(profile: AstronautProfile) => void>();

function notifyListeners(profile: AstronautProfile): void {
  listeners.forEach(fn => fn(profile));
}

export function subscribeToProfile(listener: (profile: AstronautProfile) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Loads the active astronaut profile from localStorage or falls back to default.
 */
export function getAstronautProfile(): AstronautProfile {
  if (cachedProfile) {
    return cachedProfile;
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY_PROFILE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.identity && parsed.mission) {
          cachedProfile = {
            ...DEFAULT_PROFILE,
            ...parsed,
            identity: { ...DEFAULT_PROFILE.identity, ...parsed.identity },
            body: { ...DEFAULT_PROFILE.body, ...(parsed.body || {}) },
            mission: { ...DEFAULT_PROFILE.mission, ...parsed.mission },
            personalBaseline: { ...DEFAULT_PROFILE.personalBaseline, ...(parsed.personalBaseline || {}) },
            preferences: { ...DEFAULT_PROFILE.preferences, ...parsed.preferences },
          };
          return cachedProfile!;
        }
      }
    }
  } catch (err) {
    console.warn('[ProfileService] Failed to parse stored profile:', err);
  }

  cachedProfile = { ...DEFAULT_PROFILE };
  return cachedProfile;
}

/**
 * Persists the astronaut profile locally and triggers reactive updates.
 */
export function saveAstronautProfile(profile: AstronautProfile): void {
  const updated: AstronautProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
    syncStatus: 'local',
  };

  cachedProfile = updated;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('[ProfileService] Failed to write profile to localStorage:', err);
  }

  notifyListeners(updated);
}

/**
 * Check if the astronaut has ever completed or skipped profile onboarding.
 */
export function isProfileOnboardingDone(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(STORAGE_KEY_ONBOARDING_DONE) === 'true';
    }
  } catch {}
  return true;
}

export function markProfileOnboardingDone(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_ONBOARDING_DONE, 'true');
    }
  } catch {}
}

/**
 * Resolves natural display name (e.g. "Alex") or fallback "Astronaut".
 */
export function getDisplayName(profile?: AstronautProfile): string {
  const p = profile || getAstronautProfile();
  if (p?.identity?.preferredName?.trim()) {
    return p.identity.preferredName.trim();
  }
  if (p?.identity?.fullName?.trim()) {
    const first = p.identity.fullName.trim().split(' ')[0];
    if (first) return first;
  }
  if (p?.identity?.callSign?.trim()) {
    return p.identity.callSign.trim();
  }
  return 'Astronaut';
}

/**
 * Generates natural contextual greeting for the landing page and AI.
 */
export function getGreeting(profile?: AstronautProfile): string {
  const p = profile || getAstronautProfile();
  const name = getDisplayName(p);
  
  if (name === 'Astronaut') {
    return 'Welcome back, Astronaut.';
  }

  const hour = new Date().getHours();
  let timeSalutation = 'Good day';
  if (hour >= 5 && hour < 12) {
    timeSalutation = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    timeSalutation = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeSalutation = 'Good evening';
  } else {
    timeSalutation = 'Welcome back';
  }

  return `${timeSalutation}, ${name}.`;
}

/**
 * Calculates derived Earth-Reference BMI from entered height and weight.
 * Returns null if either value is missing or invalid.
 */
export function calculateEarthReferenceBmi(
  heightCm?: number,
  weightKg?: number
): {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Elevated' | 'High';
  displayString: string;
} | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmiValue = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category: 'Underweight' | 'Normal' | 'Elevated' | 'High' = 'Normal';
  if (bmiValue < 18.5) category = 'Underweight';
  else if (bmiValue < 25.0) category = 'Normal';
  else if (bmiValue < 30.0) category = 'Elevated';
  else category = 'High';

  return {
    bmi: bmiValue,
    category,
    displayString: `${bmiValue} kg/m²`,
  };
}

/**
 * Calculates profile completion percentage and missing fields.
 */
export function calculateProfileCompletion(profile?: AstronautProfile): {
  percentage: number;
  missingFields: string[];
} {
  const p = profile || getAstronautProfile();
  const missing: string[] = [];

  let score = 0;
  // Core Identity (10% each = 40%)
  if (p.identity.fullName?.trim()) score += 10; else missing.push('Full Name');
  if (p.identity.astronautId?.trim()) score += 10; else missing.push('Astronaut ID');
  if (p.identity.role?.trim()) score += 10; else missing.push('Mission Role');
  if (p.identity.age && p.identity.age > 0) score += 10; else missing.push('Age');

  // Physiology (10% each = 30%)
  if (p.identity.bloodGroup?.trim()) score += 10; else missing.push('Blood Group');
  if (p.body?.heightCm && p.body.heightCm > 0) score += 10; else missing.push('Height');
  if (p.body?.baselineWeightKg && p.body.baselineWeightKg > 0) score += 10; else missing.push('Weight');

  // Mission Context (10% each = 30%)
  if (p.mission.missionName?.trim()) score += 10; else missing.push('Mission Name');
  if (p.mission.destination?.trim()) score += 10; else missing.push('Destination');
  if (p.mission.phase?.trim()) score += 10; else missing.push('Mission Phase');

  const percentage = Math.min(100, Math.max(0, score));
  return { percentage, missingFields: missing };
}
