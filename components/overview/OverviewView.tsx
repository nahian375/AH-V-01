/**
 * ASTRA Health - Main Dashboard Command Center
 * Strictly adheres to User Specification Sections 1 through 22.
 * 
 * Layout Hierarchy:
 * 1. Clean Top Context Bar (Mission Day, Sol, Live Date/Time, Connection State)
 * 2. Offline / Sync Banner (Surfaces only during comms loss or pending sync)
 * 3. ALERTS & REMINDERS (Section 6)
 * 4. 2-COLUMN PRIMARY SYSTEMS (Sections 7 & 8):
 *    - ❤️ PHYSIOLOGICAL HEALTH (Physical Health Index, BP, Heart Rate, Activity, [VIEW PHYSICAL →])
 *    - 🧠 PSYCHOLOGICAL HEALTH (Mental Health Index, Sleep, Stress, Mood, [VIEW MENTAL →])
 * 5. WHAT CHANGED? & HEALTH TRENDS (Sections 9 & 10)
 * 6. 2-COLUMN OPERATIONAL ACTION & AI (Sections 11 & 13):
 *    - ✨ IMPROVE MY WELLBEING (Today's Task, [✓ COMPLETE], [↻ NEW TASK])
 *    - ASTRA AI (Provider State, Health Intelligence Observation, [ASK ASTRA →])
 * 7. 🏆 MISSION MILESTONES (Section 12)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  HealthMeasurement, 
  MetricBaseline, 
  HealthSeverity, 
  HealthStatusText,
  HealthAlert,
  DailyCheckIn 
} from '../../types/health';
import { MissionContext } from '../../types/mission';
import { AISource } from '../../types/ai';
import { ConnectionState } from '../../services/connectivityManager';
import { SyncStateInfo } from '../../services/syncManager';
import { NavTab } from '../layout/Navigation';
import { HealthTabType } from '../modules/HealthView';

import { 
  buildDashboardViewModel, 
  ASTRONAUT_WELLBEING_TASKS 
} from '../../health/dashboardViewModel';

import { DashboardAlertsReminders } from '../dashboard/DashboardAlertsReminders';
import { PhysiologicalHealthCard } from '../dashboard/PhysiologicalHealthCard';
import { PsychologicalHealthCard } from '../dashboard/PsychologicalHealthCard';
import { WhatChangedCard } from '../dashboard/WhatChangedCard';
import { ImproveWellbeingCard } from '../dashboard/ImproveWellbeingCard';
import { AstraAiCard } from '../dashboard/AstraAiCard';
import { MissionMilestonesCard } from '../dashboard/MissionMilestonesCard';
import { OfflineSyncBanner } from '../dashboard/OfflineSyncBanner';
import { TodayCheckInBanner } from '../checkin/TodayCheckInBanner';
import { SpaceHealthContextCard } from '../dashboard/SpaceHealthContextCard';
import { WhyAstraIsWatchingCard } from '../dashboard/WhyAstraIsWatchingCard';
import { buildSpaceHealthContext, getWhatChangedInContext } from '../../services/spaceContextEngine';
import { spaceAudio } from '../../utils/spaceAudio';
import { Activity, Shield } from 'lucide-react';

interface OverviewViewProps {
  current: HealthMeasurement;
  baselines: MetricBaseline[];
  telemetry: HealthMeasurement[];
  alerts?: HealthAlert[];
  recentCheckIn?: DailyCheckIn;
  todayCheckIn?: DailyCheckIn;
  severity: HealthSeverity;
  statusText: HealthStatusText;
  unacknowledgedAlertsCount: number;
  activeAiSource: AISource;
  sol: number;
  missionName: string;
  missionContext?: MissionContext;
  connectionState: ConnectionState;
  syncPendingCount: number;
  syncState?: SyncStateInfo;
  astraObservation?: string;
  onNavigateToHealthDomain: (domain: HealthTabType) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenCheckIn: () => void;
  onReviewCheckIn?: () => void;
  onUpdateCheckIn?: () => void;
  onViewCheckInHistory?: () => void;
  onAskAstra: (prompt?: string) => void;
  onOpenAlerts: () => void;
  onTriggerSync?: () => Promise<any>;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  current,
  baselines,
  telemetry,
  alerts = [],
  recentCheckIn,
  todayCheckIn,
  severity,
  statusText,
  unacknowledgedAlertsCount,
  activeAiSource,
  sol,
  missionName,
  missionContext,
  connectionState,
  syncPendingCount,
  syncState,
  astraObservation,
  onNavigateToHealthDomain,
  onNavigateTab,
  onOpenCheckIn,
  onReviewCheckIn,
  onUpdateCheckIn,
  onViewCheckInHistory,
  onAskAstra,
  onOpenAlerts,
  onTriggerSync,
}) => {
  // Local state for interactive wellbeing task system
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`astra_wellbeing_completed_${sol}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTaskIndex, setActiveTaskIndex] = useState<number>(0);

  // Sync completed tasks to localStorage
  const handleCompleteTask = (taskId: string) => {
    setCompletedTaskIds(prev => {
      const updated = [...prev, taskId];
      try {
        localStorage.setItem(`astra_wellbeing_completed_${sol}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleNextTask = () => {
    setActiveTaskIndex(prev => (prev + 1) % ASTRONAUT_WELLBEING_TASKS.length);
  };

  // Safe fallback mission context
  const resolvedMission: MissionContext = missionContext || {
    missionId: 'MARS-01',
    name: missionName || 'MARS-01',
    sol: sol || 184,
    missionPhase: 'Cruise',
    crewCount: 4,
    communicationStatus: connectionState === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
    earthCommsDelayMinutes: 14.2,
    radiationEnvironment: 'Deep Space Cruise (GCR + Solar Ambient)',
    metDays: sol || 184,
    sleepScheduleWindow: '22:00 - 06:00 UTC',
    exerciseScheduleWindow: '09:30 - 11:30 UTC',
  };

  // Safe fallback sync state
  const resolvedSyncState: SyncStateInfo = syncState || {
    pendingCount: syncPendingCount,
    lastSyncedCount: 0,
    lastSyncedAt: new Date().toLocaleTimeString(),
    status: connectionState === 'ONLINE' ? 'IDLE' : 'OFFLINE',
    isOnline: connectionState === 'ONLINE',
  };

  // Centralized View Model
  const vm = useMemo(() => {
    return buildDashboardViewModel({
      current,
      baselines,
      telemetry,
      alerts,
      checkIn: recentCheckIn,
      missionContext: resolvedMission,
      aiMode: connectionState === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
      activeAiSource,
      connectionState,
      syncState: resolvedSyncState,
      completedTaskIds,
      activeTaskIndex,
      astraObservation,
    });
  }, [
    current,
    baselines,
    telemetry,
    alerts,
    recentCheckIn,
    resolvedMission,
    activeAiSource,
    connectionState,
    resolvedSyncState,
    completedTaskIds,
    activeTaskIndex,
    astraObservation,
  ]);

  // Space Context Engine calculation
  const spaceContext = useMemo(() => {
    return buildSpaceHealthContext({
      mission: resolvedMission,
      currentHealth: current,
      baselines,
      recentChanges: vm.changes,
      activeAlerts: alerts,
      recentCheckIn: todayCheckIn || recentCheckIn,
    });
  }, [resolvedMission, current, baselines, vm.changes, alerts, todayCheckIn, recentCheckIn]);

  const whatChangedInContext = useMemo(() => {
    return getWhatChangedInContext(spaceContext);
  }, [spaceContext]);

  // Live formatted date & time in UTC
  const [currentUtcTime, setCurrentUtcTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      const timePart = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
      setCurrentUtcTime(`${datePart} · ${timePart} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Map alert targets to module routes
  const handleNavigateAlert = (target: 'CARDIO' | 'RECOVERY' | 'TRENDS' | 'ALERTS' | 'COGNITIVE') => {
    switch (target) {
      case 'CARDIO':
        onNavigateToHealthDomain('CARDIO');
        break;
      case 'RECOVERY':
        onNavigateToHealthDomain('RECOVERY');
        break;
      case 'COGNITIVE':
        onNavigateToHealthDomain('COGNITIVE');
        break;
      case 'TRENDS':
        onNavigateTab('trends');
        break;
      case 'ALERTS':
      default:
        onOpenAlerts();
        break;
    }
  };

  return (
    <div id="astronaut-health-command-center" className="space-y-4 sm:space-y-5 pb-12 animate-fadeIn">
      
      {/* 1. TOP MISSION CONTEXT HEADER STRIP (Section 4 & 5) */}
      <section 
        id="dashboard-header-strip"
        aria-label="Mission Health Command Header"
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/90 p-4 sm:px-6 shadow-xl shadow-black/40 relative overflow-hidden"
      >
        {/* Subtle dynamic telemetry trace in background */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="text-2xl" role="img" aria-label="Rocket">🚀</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-slate-100 uppercase">
                ASTRA HEALTH
              </h1>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Command Center
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Daily operational astronaut health & psychological monitoring during deep-space flight.
            </p>
          </div>
        </div>

        {/* Mission Status Indicators & Dynamic Live Telemetry Readout */}
        <div className="flex items-center gap-2.5 sm:gap-3 font-mono text-xs text-slate-300 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-slate-800 shadow-inner flex items-center gap-2">
            <span className="text-slate-400">MISSION DAY </span>
            <strong className="text-slate-100">{vm.mission.day} / {vm.mission.totalDays}</strong>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">SOL {vm.mission.sol}</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-semibold">{vm.mission.name}</span>
          </div>

          {/* Dynamic Vitals Capsule */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-cyan-900/60 text-[11px] shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="text-slate-400">HR:</span>
            <strong className="text-slate-200">{vm.physicalHealth.heartRate.value}</strong>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">SpO₂:</span>
            <strong className="text-emerald-300">{vm.physicalHealth.secondary.spo2}%</strong>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 border border-slate-800 text-slate-400 text-[11px]">
            <span>{currentUtcTime || '21 SEPT 2026 · 14:32 UTC'}</span>
          </div>
        </div>
      </section>

      {/* 2. OFFLINE / SYNC BANNER (Section 14) */}
      <OfflineSyncBanner
        sync={vm.sync}
        isOnline={vm.ai.isOnline}
        onTriggerSync={onTriggerSync || (() => Promise.resolve())}
      />

      {/* TODAY'S HEALTH CHECK-IN BANNER (30-60 second rapid check-in) */}
      <TodayCheckInBanner
        sol={sol}
        todayCheckIn={todayCheckIn}
        onStartCheckIn={onOpenCheckIn}
        onReviewCheckIn={onReviewCheckIn || onOpenCheckIn}
        onUpdateCheckIn={onUpdateCheckIn || onOpenCheckIn}
        onViewHistory={onViewCheckInHistory}
        variant="dashboard"
      />

      {/* 3. ALERTS & REMINDERS (Section 6) */}
      <DashboardAlertsReminders
        alerts={vm.alerts}
        onNavigateModule={handleNavigateAlert}
      />

      {/* SPACE HEALTH CONTEXT & WHY ASTRA IS WATCHING (Sections 12 & 13) */}
      <section 
        aria-label="Spaceflight Context and Telemetry Surveillance"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch"
      >
        <SpaceHealthContextCard
          context={spaceContext}
          onAskAstra={onAskAstra}
          onNavigateTab={onNavigateTab}
        />
        <WhyAstraIsWatchingCard
          context={spaceContext}
          onAskAstra={onAskAstra}
          onNavigateTab={onNavigateTab}
        />
      </section>

      {/* 4. TWO-COLUMN PRIMARY SYSTEMS: PHYSIOLOGICAL + PSYCHOLOGICAL (Sections 7 & 8) */}
      <section 
        aria-label="Core Health Systems"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch"
      >
        {/* ❤️ PHYSIOLOGICAL HEALTH */}
        <PhysiologicalHealthCard
          data={vm.physicalHealth}
          onNavigateDomain={(domain) => onNavigateToHealthDomain(domain)}
        />

        {/* 🧠 PSYCHOLOGICAL HEALTH */}
        <PsychologicalHealthCard
          data={vm.mentalHealth}
          onNavigateDomain={(domain) => onNavigateToHealthDomain(domain)}
          onOpenCheckIn={onOpenCheckIn}
        />
      </section>

      {/* 5. WHAT CHANGED? & HEALTH TRENDS (Sections 9, 10 & 14) */}
      <WhatChangedCard
        changes={vm.changes}
        changeSummary={vm.changeSummary}
        onNavigateTrends={() => onNavigateTab('trends')}
        spaceContextCategories={whatChangedInContext}
      />

      {/* 6. TWO-COLUMN: IMPROVE MY WELLBEING + ASTRA AI (Sections 11 & 13) */}
      <section 
        aria-label="Operational Actions and Intelligence"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch"
      >
        {/* ✨ IMPROVE MY WELLBEING */}
        <ImproveWellbeingCard
          task={vm.wellbeingTask}
          onCompleteTask={handleCompleteTask}
          onNextTask={handleNextTask}
        />

        {/* ASTRA AI */}
        <AstraAiCard
          ai={vm.ai}
          onOpenAiChat={() => onAskAstra('Explain the latest 3-day recovery changes in my telemetry.')}
        />
      </section>

      {/* 7. 🏆 MISSION MILESTONES (Section 12) */}
      <MissionMilestonesCard
        mission={vm.mission}
        onNavigateMission={() => onNavigateTab('mission')}
      />

    </div>
  );
};
