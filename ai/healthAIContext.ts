/**
 * ASTRA Health - Health AI Context Builder
 * Formats clean, structured physiological & space mission context for AI processing.
 * Strictly separates observed personal data, evolving in-flight baselines,
 * mission environment, and safety bounds.
 */

import { HealthAIContext, ChatHistoryMessage } from '../types/ai';
import { HealthMeasurement, MetricBaseline, MultiMetricChange, HealthAlert, DailyCheckIn } from '../types/health';
import { ActivityRecord, DailyActivitySummary } from '../types/activity';
import { MissionContext } from '../types/mission';
import { getAstronautProfile, calculateEarthReferenceBmi } from '../services/profileService';
import { buildSpaceHealthContext, getWhyAstraIsWatching, getWhatChangedInContext } from '../services/spaceContextEngine';

export function buildHealthAIContext(params: {
  mission: MissionContext;
  currentHealth: HealthMeasurement;
  baselines: MetricBaseline[];
  recentChanges?: MultiMetricChange[];
  activeAlerts: HealthAlert[];
  recentCheckIn?: DailyCheckIn;
  recentActivities?: ActivityRecord[];
  dailyActivitySummary?: DailyActivitySummary;
  mode: 'ONLINE' | 'OFFLINE' | 'AUTO';
  userQuestion: string;
  history?: ChatHistoryMessage[];
  astronautProfile?: {
    fullName: string;
    preferredName?: string;
    callSign?: string;
    role?: string;
    crewPosition?: string;
    astronautId?: string;
    agency?: string;
    age?: number;
    bloodGroup?: string;
  };
}): HealthAIContext {
  const activeProfile = getAstronautProfile();
  const identity = activeProfile.identity;

  const profileSummary = {
    fullName: params.astronautProfile?.fullName || identity.fullName || 'Alex Carter',
    preferredName: params.astronautProfile?.preferredName || identity.preferredName || 'Alex',
    callSign: params.astronautProfile?.callSign || identity.callSign,
    role: params.astronautProfile?.role || identity.role || 'Mission Specialist',
    crewPosition: params.astronautProfile?.crewPosition || identity.crewPosition || 'Mission Specialist',
    astronautId: params.astronautProfile?.astronautId || identity.astronautId || 'AST-001',
    agency: params.astronautProfile?.agency || identity.agency || 'International Space Agency',
    age: identity.age,
    bloodGroup: identity.bloodGroup,
  };

  return {
    mission: params.mission,
    currentHealth: params.currentHealth,
    baselines: params.baselines,
    recentChanges: params.recentChanges || [],
    activeAlerts: params.activeAlerts || [],
    recentCheckIn: params.recentCheckIn,
    recentActivities: params.recentActivities || [],
    dailyActivitySummary: params.dailyActivitySummary,
    mode: params.mode,
    userQuestion: params.userQuestion,
    history: params.history || [],
    astronautProfile: profileSummary,
  };
}

export function formatContextAsPromptString(context: HealthAIContext): string {
  const current = context.currentHealth;
  const mission = context.mission;
  const profile = getAstronautProfile();
  const identity = profile.identity;
  const body = profile.body;

  const astronautName = identity.preferredName || identity.fullName || 'Astronaut';
  const role = identity.crewPosition || identity.role || 'Mission Specialist';
  const callSign = identity.callSign ? ` | Call Sign: "${identity.callSign}"` : '';
  const ageStr = identity.age ? ` | Age: ${identity.age}y` : '';
  const bloodStr = identity.bloodGroup ? ` | Blood Group: ${identity.bloodGroup} (${identity.bloodGroupVerification || 'Verified pre-flight'})` : '';

  const earthBmi = calculateEarthReferenceBmi(body?.heightCm, body?.currentWeightKg || body?.baselineWeightKg);
  const bmiStr = earthBmi ? ` | Earth-Reference BMI: ${earthBmi.displayString} (${earthBmi.category})` : '';

  // Space Context Engine calculations
  const spaceCtx = buildSpaceHealthContext({
    profile,
    mission,
    currentHealth: current,
    baselines: context.baselines,
    recentChanges: context.recentChanges,
    activeAlerts: context.activeAlerts,
    recentCheckIn: context.recentCheckIn,
    recentActivities: context.recentActivities,
    dailyActivitySummary: context.dailyActivitySummary,
  });

  const watchingFactors = getWhyAstraIsWatching(spaceCtx);
  const pb = spaceCtx.personalBaseline;

  const baselineSummary = `
- Resting Heart Rate: Current = ${current.restingHeartRate} bpm | In-Flight Baseline = ${pb.restingHeartRate.inFlightBaseline} bpm (Pre-Flight Earth = ${pb.restingHeartRate.preFlightValue} bpm, Diff from flight base: +${pb.restingHeartRate.differenceFromInFlight} bpm)
- HRV (RMSSD): Current = ${current.hrv} ms | In-Flight Baseline = ${pb.hrv.inFlightBaseline} ms (Pre-Flight Earth = ${pb.hrv.preFlightValue} ms)
- Blood Pressure: Current = ${current.bloodPressureSystolic}/${current.bloodPressureDiastolic} mmHg | In-Flight Baseline = ${pb.bloodPressureSystolic.inFlightBaseline} mmHg (Pre-Flight Earth = ${pb.bloodPressureSystolic.preFlightValue} mmHg)
- Sleep Duration: Current = ${(current.sleepDurationMinutes / 60).toFixed(1)} h | In-Flight Baseline = ${pb.sleepDuration.inFlightBaseline} h (Pre-Flight Earth = ${pb.sleepDuration.preFlightValue} h)
- Blood Oxygen (SpO₂): Current = ${current.spo2}% | In-Flight Baseline = ${pb.spo2.inFlightBaseline}%
- Core Temperature: Current = ${current.coreTemperature}°C | In-Flight Baseline = ${pb.coreTemperature.inFlightBaseline}°C`.trim();

  const alertsSummary = context.activeAlerts.length > 0
    ? context.activeAlerts.map(a => `[${a.severity}] ${a.title}: ${a.message} (Rationale: ${a.triggerRationale})`).join('\n')
    : 'No active safety alerts.';

  const watchingSummary = watchingFactors.map(w => `● ${w.text}: ${w.detail}`).join('\n');

  const checkInSummary = context.recentCheckIn
    ? `Sol ${context.recentCheckIn.sol} Check-in: Energy ${context.recentCheckIn.energy}/100, Stress ${context.recentCheckIn.stress}/100, Fatigue ${context.recentCheckIn.fatigue}/100, Sleep Quality ${context.recentCheckIn.sleepQuality}/100, Recovery Rating: ${spaceCtx.sleepRecoveryContext.recoveryRatio}. Notes: "${context.recentCheckIn.subjectiveNotes || 'None'}"`
    : 'No recent subjective check-in recorded today.';

  const targetsSummary = context.dailyActivitySummary
    ? `Sol ${context.dailyActivitySummary.sol} Targets & Progress:
- Exercise: ${context.dailyActivitySummary.exerciseMinutesTotal} / 120 min target (${Math.round((context.dailyActivitySummary.exerciseMinutesTotal / 120) * 100)}%)
- Hydration: ${context.dailyActivitySummary.hydrationMlTotal} / 2500 ml target (${Math.round((context.dailyActivitySummary.hydrationMlTotal / 2500) * 100)}%)
- Nutrition: ${context.dailyActivitySummary.caloriesConsumedTotal} / 3000 kcal target
- Operational Tasks Completed: ${context.dailyActivitySummary.tasksCompleted} / 4 target`
    : '';

  return `
ASTRONAUT MISSION PROFILE IDENTITY:
Astronaut: ${role} ${astronautName}${callSign} | Full Name: ${identity.fullName || 'Alex Carter'} | ID: ${identity.astronautId || 'AST-001'}${ageStr}${bloodStr}
Body Physiology: Height: ${body?.heightCm ? `${body.heightCm} cm` : 'Not provided'} | Earth Baseline Mass: ${body?.baselineWeightKg ? `${body.baselineWeightKg} kg` : 'Not provided'} | Current In-Flight Mass: ${body?.currentWeightKg ? `${body.currentWeightKg} kg (${body.weightVerification || 'Updated: Sol 42'})` : 'Not provided'}${bmiStr}
Note on Body Mass: Reference metric only; cephalad fluid shifts alter space mass interpretation.

MISSION & SPACE ENVIRONMENT CONTEXT:
Mission: ${mission.name || 'MARS TRANSIT — DEMO'} | Sol: ${mission.sol} / 180 | Phase: ${mission.missionPhase || 'Transit'}
Gravity Environment: ${profile.mission.gravityEnvironment || 'Microgravity'} | Earth Comms Delay: ${mission.earthCommsDelayMinutes} min
Communication Status: ${context.mode === 'OFFLINE' ? 'OFFLINE (Local Autonomous Mode)' : 'ONLINE'}
Radiation Environment: ${mission.radiationEnvironment}

PERSONAL SPACE BASELINES (PRE-FLIGHT VS IN-FLIGHT EVOLVING):
${baselineSummary}

WHY ASTRA IS CURRENTLY WATCHING (TRANSPARENT FACTORS):
${watchingSummary}

ACTIVE HEALTH ENGINE ALERTS:
${alertsSummary}

RECENT SUBJECTIVE CHECK-IN & RECOVERY:
${checkInSummary}

DAILY ACTIVITY & COUNTERMEASURES:
${targetsSummary}

PERSONAL RADIATION DOSIMETRY:
- Personal Exposure Today: ${(current.dailyRadiation_uSv / 1000).toFixed(2)} mSv
- Cumulative Mission Exposure: ${current.cumulativeRadiation_mSv.toFixed(1)} mSv / 600.0 mSv Career Limit (${spaceCtx.radiationContext.careerLimitPercent}% cap)
- Personal Source: Personal Dosimeter Badge (BION-IV Solid State)
- Mission Environment: ${mission.radiationEnvironment}

CAUSALITY DIRECTIVE REMINDER:
Distinguish OBSERVATION from POSSIBLE CONTEXT. Never claim causation without clinical proof. For example, note that reduced sleep occurred during the same operational period as elevated resting HR.
`.trim();
}
