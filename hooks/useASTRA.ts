/**
 * ASTRA Health - Main Application State Hook
 * Connects IndexedDB, Health Engine, Sync Engine, Connectivity, and AI Layer.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { db, initializeLocalDatabase } from '../services/db';
import { HealthMeasurement, DailyCheckIn, CheckInSubmissionPayload, HealthAlert, CognitiveTaskResult, CrewMember, RadiationMeasurement } from '../types/health';
import { ActivityRecord, DailyActivitySummary } from '../types/activity';
import { MissionContext, TimelineEvent } from '../types/mission';
import { NasaRadiationContext, NasaSpaceWeatherEvent, NasaResearchItem, NasaConnectionStatus } from '../types/nasa';
import { AIMode, AISource } from '../types/ai';
import { runHealthEngine, HealthEngineOutput } from '../health/healthEngine';
import { calculatePhysicalHealthIndex, calculateMentalHealthIndex } from '../health/healthIndexes';
import { connectivityManager, ConnectionState } from '../services/connectivityManager';
import { syncManager } from '../services/syncManager';
import { clientNasaService } from '../services/nasaService';
import { getActiveAISource } from '../ai/aiRouter';
import { INITIAL_CREW } from '../data/crewData';
import { generateInitialTelemetry } from '../data/mockTelemetry';
import { evaluateRadiationSafety, normalizeToMilliSieverts } from '../services/radiationSafetyRules';

export function useASTRA() {
  const [telemetry, setTelemetry] = useState<HealthMeasurement[]>([]);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>(INITIAL_CREW);
  const [radiationHistory, setRadiationHistory] = useState<RadiationMeasurement[]>([]);
  const [nasaRadiation, setNasaRadiation] = useState<NasaRadiationContext | null>(null);
  const [nasaSpaceWeather, setNasaSpaceWeather] = useState<NasaSpaceWeatherEvent[]>([]);
  const [nasaResearch, setNasaResearch] = useState<NasaResearchItem[]>([]);
  const [nasaStatus, setNasaStatus] = useState<NasaConnectionStatus | null>(null);
  const [missionContext, setMissionContext] = useState<MissionContext>({
    missionId: 'MARS-01',
    name: 'MARS-01',
    sol: 184,
    missionPhase: 'Cruise',
    crewCount: 4,
    communicationStatus: 'ONLINE',
    earthCommsDelayMinutes: 14.2,
    radiationEnvironment: 'Deep Space Cruise (GCR + Solar Ambient)',
    metDays: 184,
    sleepScheduleWindow: '22:00 - 06:00 UTC',
    exerciseScheduleWindow: '09:30 - 11:30 UTC',
  });

  const [aiMode, setAiModeState] = useState<AIMode>('AUTO');
  const [connectionState, setConnectionState] = useState<ConnectionState>('ONLINE');
  const [syncState, setSyncState] = useState(syncManager.getSyncState());
  const [isLoading, setIsLoading] = useState(true);
  const [simulationActive, setSimulationActive] = useState(false);
  const [userRole, setUserRole] = useState<'Astronaut' | 'Medical Officer' | 'Mission Control' | 'Administrator'>('Commander' as any);

  // Reload data from IndexedDB and fetch NASA baseline
  const reloadData = useCallback(async () => {
    try {
      const measurements = await db.healthMeasurements.toArray();
      measurements.sort((a, b) => a.sol - b.sol);
      setTelemetry(measurements);

      const dbCheckIns = await db.checkIns.toArray();
      dbCheckIns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setCheckIns(dbCheckIns);

      const dbAlerts = await db.alerts.toArray();
      dbAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAlerts(dbAlerts);

      const dbActivities = await db.activities.toArray();
      dbActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(dbActivities);

      const dbTimeline = await db.timelineEvents.toArray();
      dbTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTimeline(dbTimeline);

      const dbRad = await db.radiationMeasurements.toArray();
      dbRad.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRadiationHistory(dbRad);

      const dbMission = await db.missionContext.get('MARS-01');
      if (dbMission) setMissionContext(dbMission);

      const dbSettings = await db.userSettings.get('default');
      if (dbSettings) {
        setAiModeState(dbSettings.aiMode);
      }

      // Load NASA data
      const rad = await clientNasaService.getRadiationContext();
      setNasaRadiation(rad);

      const sw = await clientNasaService.getSpaceWeatherEvents();
      setNasaSpaceWeather(sw);

      const res = await clientNasaService.getResearchList();
      setNasaResearch(res);

      const status = await clientNasaService.getConnectionStatus();
      setNasaStatus(status);
    } catch (err) {
      console.error('Failed to load ASTRA data from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Initialize DB on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      await initializeLocalDatabase();
      if (mounted) {
        await reloadData();
      }
    })();

    const unsubConn = connectivityManager.subscribe((state) => {
      if (mounted) setConnectionState(state);
    });

    const unsubSync = syncManager.subscribe(() => {
      if (mounted) setSyncState(syncManager.getSyncState());
    });

    return () => {
      mounted = false;
      unsubConn();
      unsubSync();
    };
  }, [reloadData]);

  // Run Health Engine on current data
  const healthEngineOutput: HealthEngineOutput | null = useMemo(() => {
    if (telemetry.length === 0) return null;
    return runHealthEngine(telemetry, checkIns[0], missionContext);
  }, [telemetry, checkIns, missionContext]);

  // Calculate Daily Activity Summary for Current Sol
  const dailyActivitySummary: DailyActivitySummary = useMemo(() => {
    const currentSol = missionContext.sol;
    const solActivities = activities.filter(a => a.sol === currentSol);

    let exerciseMinutes = 0;
    let hydrationMl = 0;
    let caloriesConsumed = 0;
    let caloriesBurned = 0;
    let tasksCount = 0;
    let mindfulnessMins = 0;

    solActivities.forEach(act => {
      if (act.category === 'EXERCISE') {
        exerciseMinutes += act.durationMinutes || act.metrics?.durationMinutes || 0;
        caloriesBurned += act.metrics?.calories || 0;
      } else if (act.category === 'HYDRATION') {
        hydrationMl += act.metrics?.volumeMl || 0;
      } else if (act.category === 'NUTRITION') {
        caloriesConsumed += act.metrics?.calories || 0;
        if (act.metrics?.volumeMl) hydrationMl += act.metrics.volumeMl;
      } else if (act.category === 'TASK') {
        tasksCount += 1;
      } else if (act.category === 'MINDFULNESS') {
        mindfulnessMins += act.durationMinutes || act.metrics?.durationMinutes || 0;
      }
    });

    // Targets config
    const targets = [
      {
        category: 'EXERCISE' as const,
        label: 'Physical Countermeasures',
        unit: 'min',
        targetValue: 120,
        currentValue: exerciseMinutes,
        percentage: Math.min(100, Math.round((exerciseMinutes / 120) * 100)),
        status: (exerciseMinutes >= 120 ? 'OPTIMAL' : (exerciseMinutes >= 60 ? 'ON_TRACK' : 'BEHIND')) as any,
      },
      {
        category: 'HYDRATION' as const,
        label: 'Fluid & Electrolyte Intake',
        unit: 'ml',
        targetValue: 2500,
        currentValue: hydrationMl,
        percentage: Math.min(100, Math.round((hydrationMl / 2500) * 100)),
        status: (hydrationMl >= 2500 ? 'OPTIMAL' : (hydrationMl >= 1500 ? 'ON_TRACK' : 'BEHIND')) as any,
      },
      {
        category: 'NUTRITION' as const,
        label: 'Caloric Energy Balance',
        unit: 'kcal',
        targetValue: 3000,
        currentValue: caloriesConsumed,
        percentage: Math.min(100, Math.round((caloriesConsumed / 3000) * 100)),
        status: (caloriesConsumed >= 2500 ? 'OPTIMAL' : (caloriesConsumed >= 1800 ? 'ON_TRACK' : 'BEHIND')) as any,
      },
      {
        category: 'TASK' as const,
        label: 'Operational Flight Duties',
        unit: 'tasks',
        targetValue: 4,
        currentValue: tasksCount,
        percentage: Math.min(100, Math.round((tasksCount / 4) * 100)),
        status: (tasksCount >= 4 ? 'OPTIMAL' : (tasksCount >= 2 ? 'ON_TRACK' : 'BEHIND')) as any,
      },
    ];

    return {
      sol: currentSol,
      date: new Date().toISOString().split('T')[0],
      exerciseMinutesTotal: exerciseMinutes,
      hydrationMlTotal: hydrationMl,
      caloriesConsumedTotal: caloriesConsumed,
      caloriesBurnedTotal: caloriesBurned,
      tasksCompleted: tasksCount,
      mindfulnessMinutesTotal: mindfulnessMins,
      targets,
      recentActivities: solActivities,
    };
  }, [activities, missionContext.sol]);

  // Determine current active AI source label
  const isOnlineBool = connectionState === 'ONLINE';
  const isCommsLoss = connectionState === 'COMMS_BLACKOUT';
  const activeAiSource: AISource = getActiveAISource(aiMode, isOnlineBool, isCommsLoss);

  // Set AI mode with persistence
  const setAiMode = async (mode: AIMode) => {
    setAiModeState(mode);
    await db.userSettings.update('default', { aiMode: mode }).catch(() => {});
  };

  // Record Activity Record
  const recordActivity = async (payload: {
    category: ActivityRecord['category'];
    title: string;
    details: string;
    durationMinutes?: number;
    intensity?: ActivityRecord['intensity'];
    metrics?: ActivityRecord['metrics'];
    sol?: number;
    loggedBy?: ActivityRecord['loggedBy'];
  }): Promise<ActivityRecord> => {
    const actSol = payload.sol || missionContext.sol;
    const nowIso = new Date().toISOString();
    const newRecord: ActivityRecord = {
      id: `act-${Date.now()}`,
      timestamp: nowIso,
      sol: actSol,
      crewId: 'sarah-chen',
      category: payload.category,
      title: payload.title,
      details: payload.details,
      durationMinutes: payload.durationMinutes,
      intensity: payload.intensity || (payload.category === 'EXERCISE' ? 'MODERATE' : undefined),
      metrics: payload.metrics,
      loggedBy: payload.loggedBy || 'ASTRONAUT',
      synced: syncState.isOnline,
    };

    await db.activities.put(newRecord);
    await syncManager.queueRecord('activities', 'INSERT', newRecord.id, newRecord);

    // Also add to Mission Timeline
    const timelineItem: TimelineEvent = {
      id: `timeline-act-${Date.now()}`,
      timestamp: nowIso,
      sol: actSol,
      category: payload.category === 'EXERCISE' ? 'EXERCISE' : (payload.category === 'HYDRATION' || payload.category === 'NUTRITION' ? 'VITALS' : 'CHECK_IN'),
      title: `Activity Logged: ${newRecord.title}`,
      description: newRecord.details,
      severity: 'GREEN',
      synced: syncState.isOnline,
    };
    await db.timelineEvents.put(timelineItem);

    await reloadData();
    return newRecord;
  };

  // Delete Activity Record
  const deleteActivity = async (id: string) => {
    await db.activities.delete(id);
    await syncManager.queueRecord('activities', 'DELETE', id, { id });
    await reloadData();
  };

  // Edit Activity Record
  const editActivity = async (id: string, updates: Partial<ActivityRecord>) => {
    await db.activities.update(id, updates);
    await syncManager.queueRecord('activities', 'UPDATE', id, updates);
    await reloadData();
  };

  // Add Health Measurement (Offline-First)
  const recordMeasurement = async (measurement: Partial<HealthMeasurement>) => {
    const last = telemetry[telemetry.length - 1];
    const newSol = last ? last.sol : 184;
    const newRecord: HealthMeasurement = {
      id: `telemetry-custom-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sol: newSol,
      crewId: 'sarah-chen',
      heartRate: measurement.heartRate || last?.heartRate || 72,
      restingHeartRate: measurement.restingHeartRate || last?.restingHeartRate || 70,
      hrv: measurement.hrv || last?.hrv || 60,
      bloodPressureSystolic: measurement.bloodPressureSystolic || last?.bloodPressureSystolic || 118,
      bloodPressureDiastolic: measurement.bloodPressureDiastolic || last?.bloodPressureDiastolic || 76,
      spo2: measurement.spo2 || last?.spo2 || 98.5,
      respiratoryRate: measurement.respiratoryRate || last?.respiratoryRate || 14,
      sleepDurationMinutes: measurement.sleepDurationMinutes || last?.sleepDurationMinutes || 420,
      sleepQuality: measurement.sleepQuality || last?.sleepQuality || 80,
      sleepConsistency: measurement.sleepConsistency || last?.sleepConsistency || 85,
      recoveryScore: measurement.recoveryScore || last?.recoveryScore || 80,
      fatigueScore: measurement.fatigueScore || last?.fatigueScore || 30,
      exerciseDurationMinutes: measurement.exerciseDurationMinutes || last?.exerciseDurationMinutes || 120,
      resistanceLoadKg: measurement.resistanceLoadKg || last?.resistanceLoadKg || 1400,
      aerobicOutputWatts: measurement.aerobicOutputWatts || last?.aerobicOutputWatts || 180,
      coreTemperature: measurement.coreTemperature || last?.coreTemperature || 36.8,
      hydrationIndex: measurement.hydrationIndex || last?.hydrationIndex || 90,
      dailyRadiation_uSv: measurement.dailyRadiation_uSv || last?.dailyRadiation_uSv || 420,
      cumulativeRadiation_mSv: measurement.cumulativeRadiation_mSv || last?.cumulativeRadiation_mSv || 88.7,
      isSimulated: true,
      ...measurement,
    };

    // Save locally first
    await db.healthMeasurements.put(newRecord);

    // Queue for sync
    await syncManager.queueRecord('healthMeasurements', 'INSERT', newRecord.id, newRecord);

    // Add to timeline
    const timelineItem: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sol: newSol,
      category: 'VITALS',
      title: 'Manual Measurement Recorded',
      description: `Resting HR: ${newRecord.restingHeartRate} bpm | SpO2: ${newRecord.spo2}%`,
      severity: 'GREEN',
      synced: false,
    };
    await db.timelineEvents.put(timelineItem);

    await reloadData();
  };

  // Submit Daily Check-in (Offline-First with Duplicate Protection & Engine Update)
  const submitCheckIn = async (checkInData: CheckInSubmissionPayload): Promise<{
    success: boolean;
    isUpdate: boolean;
    physicalIndex: number;
    mentalIndex: number;
    checkIn: DailyCheckIn;
  }> => {
    const currentSol = missionContext.sol;
    const nowIso = new Date().toISOString();
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. DUPLICATE CHECK-IN PROTECTION: Only 1 primary record per Sol
    const existingCheckIn = await db.checkIns.where('sol').equals(currentSol).first();
    const isUpdate = !!existingCheckIn;
    const checkInId = existingCheckIn ? existingCheckIn.id : `checkin-sol-${currentSol}`;

    // 2. Normalize mental / subjective values
    const moodVal = checkInData.mental?.mood !== undefined 
      ? Math.round(checkInData.mental.mood * 20) 
      : (checkInData.mood ?? existingCheckIn?.mood ?? 70);

    const stressVal = checkInData.mental?.stress !== undefined 
      ? Math.round(checkInData.mental.stress * 20) 
      : (checkInData.stress ?? existingCheckIn?.stress ?? 40);

    const energyVal = checkInData.mental?.energy !== undefined 
      ? Math.round(checkInData.mental.energy * 20) 
      : (checkInData.energy ?? existingCheckIn?.energy ?? 65);

    const fatigueVal = checkInData.mental?.fatigue !== undefined 
      ? Math.round(checkInData.mental.fatigue * 20) 
      : (checkInData.fatigue ?? existingCheckIn?.fatigue ?? 45);

    // Sleep calculation
    let sleepMinutes = checkInData.mental?.sleepDurationMinutes;
    if (sleepMinutes === undefined && (checkInData.mental?.sleepHours !== undefined || checkInData.mental?.sleepMinutes !== undefined)) {
      sleepMinutes = ((checkInData.mental?.sleepHours || 0) * 60) + (checkInData.mental?.sleepMinutes || 0);
    }
    if (sleepMinutes === undefined && existingCheckIn?.mental?.sleepDurationMinutes !== undefined) {
      sleepMinutes = existingCheckIn.mental.sleepDurationMinutes;
    }

    // Recovery calculation
    const recoveryScore = checkInData.physical?.recovery !== undefined 
      ? Math.round(checkInData.physical.recovery * 20) 
      : undefined;

    // 3. Update or generate HealthMeasurement for today's sol
    const latestMeasure = await db.healthMeasurements.where('sol').equals(currentSol).first();
    const fallbackMeasure = telemetry[telemetry.length - 1];

    const updatedMeasure: HealthMeasurement = latestMeasure ? {
      ...latestMeasure,
      timestamp: nowIso,
      heartRate: checkInData.physical?.heartRate ?? latestMeasure.heartRate,
      restingHeartRate: checkInData.physical?.heartRate 
        ? Math.min(latestMeasure.restingHeartRate, checkInData.physical.heartRate) 
        : latestMeasure.restingHeartRate,
      spo2: checkInData.physical?.spo2 ?? latestMeasure.spo2,
      exerciseDurationMinutes: checkInData.physical?.exerciseMinutes !== undefined 
        ? checkInData.physical.exerciseMinutes 
        : latestMeasure.exerciseDurationMinutes,
      sleepDurationMinutes: sleepMinutes !== undefined 
        ? sleepMinutes 
        : latestMeasure.sleepDurationMinutes,
      recoveryScore: recoveryScore !== undefined 
        ? recoveryScore 
        : latestMeasure.recoveryScore,
      fatigueScore: fatigueVal,
    } : {
      id: `telemetry-sol-${currentSol}`,
      timestamp: nowIso,
      sol: currentSol,
      crewId: 'sarah-chen',
      heartRate: checkInData.physical?.heartRate ?? fallbackMeasure?.heartRate ?? 72,
      restingHeartRate: checkInData.physical?.heartRate ?? fallbackMeasure?.restingHeartRate ?? 68,
      hrv: fallbackMeasure?.hrv ?? 58,
      bloodPressureSystolic: fallbackMeasure?.bloodPressureSystolic ?? 118,
      bloodPressureDiastolic: fallbackMeasure?.bloodPressureDiastolic ?? 76,
      spo2: checkInData.physical?.spo2 ?? fallbackMeasure?.spo2 ?? 98.2,
      respiratoryRate: fallbackMeasure?.respiratoryRate ?? 14,
      sleepDurationMinutes: sleepMinutes ?? fallbackMeasure?.sleepDurationMinutes ?? 430,
      sleepQuality: Math.max(30, 100 - Math.round(fatigueVal * 0.5)),
      sleepConsistency: fallbackMeasure?.sleepConsistency ?? 84,
      recoveryScore: recoveryScore ?? fallbackMeasure?.recoveryScore ?? 78,
      fatigueScore: fatigueVal,
      exerciseDurationMinutes: checkInData.physical?.exerciseMinutes ?? fallbackMeasure?.exerciseDurationMinutes ?? 45,
      resistanceLoadKg: fallbackMeasure?.resistanceLoadKg ?? 125,
      aerobicOutputWatts: fallbackMeasure?.aerobicOutputWatts ?? 180,
      coreTemperature: fallbackMeasure?.coreTemperature ?? 36.8,
      hydrationIndex: fallbackMeasure?.hydrationIndex ?? 82,
      dailyRadiation_uSv: fallbackMeasure?.dailyRadiation_uSv ?? 450,
      cumulativeRadiation_mSv: fallbackMeasure?.cumulativeRadiation_mSv ?? 78.4,
    };

    await db.healthMeasurements.put(updatedMeasure);
    await syncManager.queueRecord(
      'healthMeasurements', 
      latestMeasure ? 'UPDATE' : 'INSERT', 
      updatedMeasure.id, 
      updatedMeasure
    );

    // 4. Calculate dynamic Physical and Mental Health Indices
    const baselines = healthEngineOutput?.baselines || [];
    const pIndex = calculatePhysicalHealthIndex({ current: updatedMeasure, baselines });
    
    // Construct new DailyCheckIn object
    const newCheckIn: DailyCheckIn = {
      id: checkInId,
      date: todayStr,
      timestamp: nowIso,
      sol: currentSol,
      crewId: 'sarah-chen',
      physical: {
        heartRate: checkInData.physical?.heartRate ?? existingCheckIn?.physical?.heartRate,
        spo2: checkInData.physical?.spo2 ?? existingCheckIn?.physical?.spo2,
        exerciseMinutes: checkInData.physical?.exerciseMinutes ?? existingCheckIn?.physical?.exerciseMinutes,
        recovery: checkInData.physical?.recovery ?? existingCheckIn?.physical?.recovery,
      },
      mental: {
        sleepHours: checkInData.mental?.sleepHours ?? existingCheckIn?.mental?.sleepHours,
        sleepMinutes: checkInData.mental?.sleepMinutes ?? existingCheckIn?.mental?.sleepMinutes,
        sleepDurationMinutes: sleepMinutes,
        mood: checkInData.mental?.mood ?? existingCheckIn?.mental?.mood,
        stress: checkInData.mental?.stress ?? existingCheckIn?.mental?.stress,
        energy: checkInData.mental?.energy ?? existingCheckIn?.mental?.energy,
        fatigue: checkInData.mental?.fatigue ?? existingCheckIn?.mental?.fatigue,
      },
      energy: energyVal,
      stress: stressVal,
      fatigue: fatigueVal,
      mood: moodVal,
      sleepQuality: Math.max(30, 100 - Math.round(fatigueVal * 0.5)),
      subjectiveNotes: checkInData.subjectiveNotes || existingCheckIn?.subjectiveNotes || '',
      healthEngineAnalysis: `Reported fatigue ${fatigueVal}/100 and stress ${stressVal}/100 with Sol ${currentSol} check-in.`,
      status: 'completed',
      source: checkInData.source || 'astronaut',
      syncStatus: syncState.isOnline ? 'synced' : 'pending',
      synced: syncState.isOnline,
      createdAt: existingCheckIn ? existingCheckIn.createdAt : nowIso,
      updatedAt: nowIso,
      physicalIndex: pIndex,
    };

    const mIndex = calculateMentalHealthIndex({ 
      current: updatedMeasure, 
      baselines, 
      checkIn: newCheckIn 
    });
    newCheckIn.mentalIndex = mIndex;

    // 5. Save CheckIn into Dexie
    await db.checkIns.put(newCheckIn);
    await syncManager.queueRecord('checkIns', isUpdate ? 'UPDATE' : 'INSERT', newCheckIn.id, newCheckIn);

    // 6. Record Timeline Events (Section 16)
    const checkinEvent: TimelineEvent = {
      id: `timeline-checkin-${Date.now()}`,
      timestamp: nowIso,
      sol: currentSol,
      category: 'CHECK_IN',
      title: isUpdate ? 'Daily Health Check-in Updated' : 'Daily Health Check-in Completed',
      description: `Physical: ${pIndex}/100 | Mental: ${mIndex}/100 | Logged for Sol ${currentSol}`,
      severity: (pIndex < 70 || mIndex < 70) ? 'YELLOW' : 'GREEN',
      synced: syncState.isOnline,
    };
    await db.timelineEvents.put(checkinEvent);

    const physicalEvent: TimelineEvent = {
      id: `timeline-phi-${Date.now() + 1}`,
      timestamp: nowIso,
      sol: currentSol,
      category: 'VITALS',
      title: 'Bio Signal Index Updated',
      description: `Bio Signal Index evaluated to ${pIndex}/100 from Sol ${currentSol} check-in.`,
      severity: 'GREEN',
      synced: syncState.isOnline,
    };
    await db.timelineEvents.put(physicalEvent);

    const mentalEvent: TimelineEvent = {
      id: `timeline-mhi-${Date.now() + 2}`,
      timestamp: nowIso,
      sol: currentSol,
      category: 'CHECK_IN',
      title: 'Neural Signal Index Updated',
      description: `Neural Signal Index evaluated to ${mIndex}/100 from Sol ${currentSol} check-in.`,
      severity: 'GREEN',
      synced: syncState.isOnline,
    };
    await db.timelineEvents.put(mentalEvent);

    // 7. Reload data across the application
    await reloadData();

    return {
      success: true,
      isUpdate,
      physicalIndex: pIndex,
      mentalIndex: mIndex,
      checkIn: newCheckIn,
    };
  };

  // Acknowledge Alert
  const acknowledgeAlert = async (alertId: string) => {
    await db.alerts.update(alertId, {
      acknowledged: true,
      acknowledgedAt: new Date().toISOString(),
    });
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      await syncManager.queueRecord('alerts', 'UPDATE', alertId, { acknowledged: true });
    }

    const timelineItem: TimelineEvent = {
      id: `timeline-ack-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sol: missionContext.sol,
      category: 'ALERTS',
      title: 'Alert Acknowledged',
      description: `Alert "${alert?.title || alertId}" acknowledged by Commander.`,
      severity: 'GREEN',
      synced: false,
    };
    await db.timelineEvents.put(timelineItem);

    await reloadData();
  };

  // Record Personal Radiation Measurement (Offline-First with Deterministic Safety Rules)
  const recordRadiationMeasurement = async (
    data: Omit<RadiationMeasurement, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'synced'>
  ): Promise<RadiationMeasurement> => {
    const nowIso = new Date().toISOString();
    const id = `rad-${Date.now()}`;
    const normVal = data.equivalent_mSv ?? normalizeToMilliSieverts(data.value, data.unit, data.measurementType) ?? (data.value / (data.unit === 'uSv' ? 1000 : 1));

    const newRecord: RadiationMeasurement = {
      ...data,
      id,
      equivalent_mSv: normVal,
      syncStatus: syncState.isOnline ? 'synced' : 'pending',
      synced: syncState.isOnline,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 1. Save to local IndexedDB
    await db.radiationMeasurements.put(newRecord);
    await syncManager.queueRecord('radiationMeasurements', 'INSERT', id, newRecord);

    // 2. Synchronize HealthMeasurement table (Single source of truth)
    const latestMeasure = await db.healthMeasurements.where('sol').equals(data.sol).first() || telemetry[telemetry.length - 1];
    const prevCumulative = latestMeasure?.cumulativeRadiation_mSv ?? 88.7;
    const newCumulative = Number((prevCumulative + normVal).toFixed(2));
    const newDaily_uSv = Math.round(normVal * 1000);

    if (latestMeasure) {
      const updatedMeasure: HealthMeasurement = {
        ...latestMeasure,
        dailyRadiation_uSv: newDaily_uSv,
        cumulativeRadiation_mSv: newCumulative,
        timestamp: nowIso,
      };
      await db.healthMeasurements.put(updatedMeasure);
      await syncManager.queueRecord('healthMeasurements', 'UPDATE', updatedMeasure.id, updatedMeasure);
    }

    // 3. Evaluate deterministic radiation safety rules
    const evalResult = evaluateRadiationSafety(newRecord, prevCumulative);
    if (evalResult.alert) {
      await db.alerts.put(evalResult.alert);
      await syncManager.queueRecord('alerts', 'INSERT', evalResult.alert.id, evalResult.alert);
    }

    // 4. Record Timeline Event (Personal Health Measurement)
    const sourceLabel = data.source.replace('_', ' ').toUpperCase();
    const timelineItem: TimelineEvent = {
      id: `timeline-rad-${Date.now()}`,
      timestamp: nowIso,
      sol: data.sol,
      category: 'RADIATION' as any,
      title: 'Radiation Exposure Recorded',
      description: `Personal Dosimetry: ${data.value} ${data.unit} (Rate: ${normVal.toFixed(2)} mSv/day) | Source: ${sourceLabel}`,
      severity: evalResult.severity as any,
      synced: syncState.isOnline,
    };
    await db.timelineEvents.put(timelineItem);

    await reloadData();
    return newRecord;
  };

  // Delete Radiation Measurement
  const deleteRadiationMeasurement = async (id: string) => {
    await db.radiationMeasurements.delete(id);
    await syncManager.queueRecord('radiationMeasurements', 'DELETE', id, { id });
    await reloadData();
  };

  // Delete Health Measurement
  const deleteMeasurement = async (id: string) => {
    await db.healthMeasurements.delete(id);
    await syncManager.queueRecord('healthMeasurements', 'DELETE', id, { id });
    await reloadData();
  };

  // Edit Health Measurement
  const editMeasurement = async (id: string, updates: Partial<HealthMeasurement>) => {
    await db.healthMeasurements.update(id, updates);
    await syncManager.queueRecord('healthMeasurements', 'UPDATE', id, updates);
    await reloadData();
  };

  // Delete Daily Check-In
  const deleteCheckIn = async (id: string) => {
    await db.checkIns.delete(id);
    await syncManager.queueRecord('checkIns', 'DELETE', id, { id });
    await reloadData();
  };

  // Edit Daily Check-In
  const editCheckIn = async (id: string, updates: Partial<DailyCheckIn>) => {
    await db.checkIns.update(id, updates);
    await syncManager.queueRecord('checkIns', 'UPDATE', id, updates);
    await reloadData();
  };

  // Log Cognitive Task Result
  const recordCognitiveResult = async (result: Omit<CognitiveTaskResult, 'id' | 'timestamp' | 'sol'>) => {
    const newResult: CognitiveTaskResult = {
      ...result,
      id: `cog-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sol: missionContext.sol,
    };
    await db.cognitiveResults.put(newResult);
    await syncManager.queueRecord('cognitiveResults', 'INSERT', newResult.id, newResult);

    // Synchronize latest health measurement biometrics with latest cognitive test scores
    const last = telemetry[telemetry.length - 1];
    if (last) {
      const updates: Partial<HealthMeasurement> = {};
      if (result.taskType === 'REACTION') {
        updates.reactionTimeMs = Math.round(result.score);
        // Standard NASA PVT attention/vigilance derivation from response latency vs personal baseline
        const baseline = result.baselineScore || 248;
        const latencyDelta = result.score - baseline;
        const derivedAttention = Math.max(45, Math.min(99, Math.round(88 - (latencyDelta * 0.22))));
        updates.attentionScore = derivedAttention;
      } else if (result.taskType === 'MEMORY') {
        updates.memoryScore = Math.max(30, Math.min(100, Math.round(result.score)));
      } else if (result.taskType === 'ATTENTION') {
        updates.attentionScore = Math.max(30, Math.min(100, Math.round(result.score)));
      }
      if (Object.keys(updates).length > 0) {
        await db.healthMeasurements.update(last.id, updates);
        await syncManager.queueRecord('healthMeasurements', 'UPDATE', last.id, updates);
      }
    }

    const timelineItem: TimelineEvent = {
      id: `timeline-cog-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sol: missionContext.sol,
      category: 'CHECK_IN',
      title: `Cognitive Task Completed: ${result.taskType}`,
      description: `Score: ${result.score} (Baseline: ${result.baselineScore}, Dev: ${result.deviationPercent}%)`,
      severity: Math.abs(result.deviationPercent) > 15 ? 'YELLOW' : 'GREEN',
      synced: false,
    };
    await db.timelineEvents.put(timelineItem);

    await reloadData();
  };

  // NASA Space Apps Challenge Demo: Start Health Event
  const startHealthDriftSimulation = async () => {
    setSimulationActive(true);
    // Overwrite the last 8 days with the structured health drift scenario
    const updated = generateInitialTelemetry();
    await db.healthMeasurements.bulkPut(updated);

    const timelineItem: TimelineEvent = {
      id: `timeline-sim-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sol: 184,
      category: 'ALERTS',
      title: 'NASA Simulation: Multi-Metric Drift Injected',
      description: 'Telemetry drifted: Sleep compressed to 5.9h (-18%), HRV dropped to 44ms (-29%), Resting HR rose to 81 bpm (+9%).',
      severity: 'ORANGE',
      synced: false,
    };
    await db.timelineEvents.put(timelineItem);

    await reloadData();
  };

  // Reset Demo to Baseline
  const resetDemoBaseline = async () => {
    setSimulationActive(false);
    // Reset all 30 days to stable baseline values
    const stableTelemetry = generateInitialTelemetry().map(item => ({
      ...item,
      restingHeartRate: 70 + Math.round(Math.sin(item.sol) * 2),
      hrv: 63 + Math.round(Math.cos(item.sol) * 3),
      sleepDurationMinutes: 432 + Math.round(Math.sin(item.sol) * 15),
      recoveryScore: 84 + Math.round(Math.cos(item.sol) * 3),
      fatigueScore: 25 + Math.round(Math.sin(item.sol) * 4),
      sleepQuality: 82,
    }));

    await db.healthMeasurements.bulkPut(stableTelemetry);
    await reloadData();
  };

  // Simulate Communication Loss
  const toggleCommunicationLoss = (enable: boolean) => {
    connectivityManager.simulateCommsLoss(enable);
  };

  // Manual Trigger Sync
  const triggerSync = async () => {
    return await syncManager.attemptSync();
  };

  // Refresh NASA Space Telemetry
  const refreshNasaData = async () => {
    try {
      const rad = await clientNasaService.getRadiationContext(true);
      setNasaRadiation(rad);
      const sw = await clientNasaService.getSpaceWeatherEvents();
      setNasaSpaceWeather(sw);
      const res = await clientNasaService.getResearchList();
      setNasaResearch(res);
      const status = await clientNasaService.getConnectionStatus();
      setNasaStatus(status);
    } catch (err) {
      console.warn('Failed to refresh NASA data:', err);
    }
  };

  // Clear Cached NASA Context
  const clearNasaCache = async () => {
    await clientNasaService.clearNasaCache();
    await reloadData();
  };

  return {
    telemetry,
    checkIns,
    alerts,
    activities,
    dailyActivitySummary,
    timeline,
    crew,
    radiationHistory,
    missionContext,
    nasaRadiation,
    nasaSpaceWeather,
    nasaResearch,
    nasaStatus,
    aiMode,
    setAiMode,
    connectionState,
    syncState,
    isLoading,
    healthEngineOutput,
    activeAiSource,
    simulationActive,
    userRole,
    setUserRole,
    recordMeasurement,
    deleteMeasurement,
    editMeasurement,
    recordRadiationMeasurement,
    deleteRadiationMeasurement,
    submitCheckIn,
    deleteCheckIn,
    editCheckIn,
    recordActivity,
    deleteActivity,
    editActivity,
    acknowledgeAlert,
    recordCognitiveResult,
    startHealthDriftSimulation,
    resetDemoBaseline,
    toggleCommunicationLoss,
    triggerSync,
    refreshNasaData,
    clearNasaCache,
    reloadData,
  };
}

