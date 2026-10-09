/**
 * ASTRA Health - Main Application Entry
 * Progressive Web App for Astronaut Health Monitoring in Deep Space.
 * Features Personal Baselines, Deterministic Health Engine, Dual AI Routing,
 * and 100% Offline Continuity.
 */

import React, { useState } from 'react';
import { useASTRA } from './hooks/useASTRA';
import { useNavigation } from './hooks/useNavigation';
import { LiveSpaceBackground } from './components/layout/LiveSpaceBackground';
import { Header } from './components/layout/Header';
import { SystemStatusBar } from './components/layout/SystemStatusBar';
import { CommsLossBanner, DisclaimerBanner } from './components/layout/CommsLossBanner';
import { Navigation, NavTab } from './components/layout/Navigation';
import { Sidebar } from './components/layout/Sidebar';
import { LandingView } from './components/landing/LandingView';
import { OverviewView } from './components/overview/OverviewView';
import { SimulationBar } from './components/dashboard/SimulationBar';
import { OverallHealthBanner } from './components/dashboard/OverallHealthBanner';
import { WhatChangedCard } from './components/dashboard/WhatChangedCard';
import { MetricCard } from './components/dashboard/MetricCard';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { DailyCheckIn } from './types/health';
import { DailyCheckInModal } from './components/checkin/DailyCheckInModal';
import { QuickDailyCheckInModal } from './components/checkin/QuickDailyCheckInModal';
import { DailyHealthHistoryModal } from './components/checkin/DailyHealthHistoryModal';
import { CheckInView } from './components/checkin/CheckInView';
import { AlertCenterView } from './components/alerts/AlertCenterView';
import { HealthView, HealthTabType } from './components/modules/HealthView';
import { PhysicalHealthView } from './components/modules/PhysicalHealthView';
import { MentalHealthView } from './components/modules/MentalHealthView';
import { TrendsView } from './components/modules/TrendsView';
import { WhatChangedView } from './components/modules/WhatChangedView';
import { TimelineView } from './components/modules/TimelineView';
import { MissionView } from './components/modules/MissionView';
import { CrewView } from './components/modules/CrewView';
import { SettingsView } from './components/modules/SettingsView';
import { MissionProfileView } from './components/modules/MissionProfileView';
import { ArchitectureModal } from './components/modules/ArchitectureModal';
import { OnboardingModal } from './components/modules/OnboardingModal';
import { MissionCommandMenuModal } from './components/navigation/MissionCommandMenuModal';
import { 
  Activity, 
  Heart, 
  Moon, 
  BatteryCharging, 
  Wind, 
  Radiation, 
  Dumbbell, 
  Zap,
  RotateCcw,
  ShieldAlert,
  ClipboardCheck,
  ArrowRight,
  HeartPulse,
  Sparkles
} from 'lucide-react';

export function App() {
  const {
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
  } = useASTRA();


  const { activeTab, navigateTo, goBack, canGoBack } = useNavigation();
  const [healthSubTab, setHealthSubTab] = useState<HealthTabType>('ALL');
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isQuickCheckInOpen, setIsQuickCheckInOpen] = useState(false);
  const [checkInModalMode, setCheckInModalMode] = useState<'create' | 'review' | 'update'>('create');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryCheckIn, setSelectedHistoryCheckIn] = useState<DailyCheckIn | undefined>(undefined);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  // Today's check-in for the current Sol
  const todayCheckIn = checkIns.find(c => c.sol === missionContext.sol);

  const handleStartCheckIn = () => {
    setCheckInModalMode('create');
    setSelectedHistoryCheckIn(undefined);
    setIsQuickCheckInOpen(true);
  };

  const handleReviewCheckIn = (checkInToReview?: DailyCheckIn) => {
    setCheckInModalMode('review');
    setSelectedHistoryCheckIn(checkInToReview || todayCheckIn);
    setIsQuickCheckInOpen(true);
  };

  const handleUpdateCheckIn = (checkInToUpdate?: DailyCheckIn) => {
    setCheckInModalMode('update');
    setSelectedHistoryCheckIn(checkInToUpdate || todayCheckIn);
    setIsQuickCheckInOpen(true);
  };

  // Helper to get friendly section label for header badge
  const getSectionLabel = (tab: NavTab): string => {
    switch (tab) {
      case 'landing':
        return 'MISSION HUB';
      case 'physical':
        return 'BIO SIGNAL';
      case 'mental':
        return 'NEURAL SIGNAL';
      case 'overview':
        return 'HEALTH DASHBOARD';
      case 'health':
        return 'HEALTH DOMAINS';
      case 'trends':
        return '7-DAY TRENDS';
      case 'astra-ai':
        return 'ASTRA AI ASSISTANT';
      case 'check-in':
        return 'DAILY CHECK-IN';
      case 'alerts':
        return 'MISSION ALERTS';
      case 'timeline':
        return 'MISSION TIMELINE';
      case 'mission':
        return 'MISSION CONTEXT';
      case 'crew':
        return 'CREW ROSTER';
      case 'settings':
        return 'SYSTEM SETTINGS';
      case 'what-changed':
        return 'WHAT CHANGED';
      case 'profile':
        return 'MISSION PROFILE';
      default:
        return 'ASTRA HEALTH';
    }
  };

  // Navigate to Health with specific category
  const navigateToHealth = (tab: HealthTabType = 'ALL') => {
    setHealthSubTab(tab);
    navigateTo('health');
  };

  // Quick action: Open AI tab with specific prompt
  const handleAskAstra = (prompt?: string) => {
    setAiInitialPrompt(prompt || 'What changed this week?');
    navigateTo('astra-ai');
  };

  const handleOpenWhatChanged = () => {
    navigateTo('what-changed');
  };

  if (isLoading || !healthEngineOutput) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl">
            <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-wider">ASTRA HEALTH</h1>
            <p className="text-xs text-slate-400 mt-1">Initializing local database & health baseline engine...</p>
          </div>
        </div>
      </div>
    );
  }

  const current = healthEngineOutput.currentMeasurement;
  const baselines = healthEngineOutput.baselines;
  const unacknowledgedAlertsCount = alerts.filter(a => !a.acknowledged).length;

  // Find baselines
  const rhrBase = baselines.find(b => b.metricKey === 'restingHeartRate');
  const hrvBase = baselines.find(b => b.metricKey === 'hrv');
  const sleepBase = baselines.find(b => b.metricKey === 'sleepDurationMinutes');
  const recoveryBase = baselines.find(b => b.metricKey === 'recoveryScore');
  const spo2Base = baselines.find(b => b.metricKey === 'spo2');
  const fatigueBase = baselines.find(b => b.metricKey === 'fatigueScore');
  const radBase = baselines.find(b => b.metricKey === 'dailyRadiation_uSv');
  const exerciseBase = baselines.find(b => b.metricKey === 'exerciseDurationMinutes');

  // Sparkline history data slices
  const last14 = telemetry.slice(-14);
  const rhrSparkline = last14.map(t => t.restingHeartRate);
  const hrvSparkline = last14.map(t => t.hrv);
  const sleepSparkline = last14.map(t => t.sleepDurationMinutes / 60);
  const recoverySparkline = last14.map(t => t.recoveryScore);
  const spo2Sparkline = last14.map(t => t.spo2);
  const fatigueSparkline = last14.map(t => t.fatigueScore);
  const radSparkline = last14.map(t => t.dailyRadiation_uSv);
  const exerciseSparkline = last14.map(t => t.exerciseDurationMinutes);

  const isOffline = connectionState === 'COMMS_BLACKOUT' || (typeof navigator !== 'undefined' && !navigator.onLine);

  return (
    <div className="relative min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* ============================================================ */}
      {/* LAYER 0: PERSISTENT GLOBAL LIVE SPACE BACKGROUND             */}
      {/* Mounted ONCE at root level. Never remounts or resets stream */}
      {/* during route navigation between any ASTRA modules.          */}
      {/* ============================================================ */}
      <LiveSpaceBackground />

      {/* ============================================================ */}
      {/* LAYER 1: DARK READABILITY OVERLAY                            */}
      {/* Subtle overlay preserves vibrant space video whilst keeping  */}
      {/* all text and telemetry highly legible across the app         */}
      {/* ============================================================ */}
      <div className="space-readability-overlay" />

      {/* ============================================================ */}
      {/* LAYER 2+: ASTRA HEALTH INTERFACE                             */}
      {/* ============================================================ */}
      <main className="astra-application">
        {/* 1. Sticky Mission Header */}
      <Header
        sol={missionContext.sol}
        missionName={missionContext.name}
        aiMode={aiMode}
        activeAiSource={activeAiSource}
        connectionState={connectionState}
        syncPendingCount={syncState.pendingCount}
        syncStatus={syncState.status}
        unacknowledgedAlertsCount={unacknowledgedAlertsCount}
        currentSectionLabel={getSectionLabel(activeTab)}
        canGoBack={canGoBack}
        onGoBack={goBack}
        onSetAiMode={setAiMode}
        onTriggerSync={triggerSync}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onNavigateLanding={() => navigateTo('landing')}
        onNavigateSettings={() => navigateTo('settings')}
        onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
        onNavigateTab={navigateTo}
      />

      {/* 2. Communication Loss Warning Banner */}
      <CommsLossBanner
        isCommsLoss={connectionState === 'COMMS_BLACKOUT'}
        onRestore={() => toggleCommunicationLoss(false)}
      />

      {/* 3. MAIN WORKSPACE / LANDING HUB */}
      {activeTab === 'landing' ? (
        <section className="flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-2 flex flex-col justify-center">
          <LandingView
            missionContext={missionContext}
            connectionState={connectionState}
            aiMode={aiMode}
            activeAiSource={activeAiSource}
            healthEngineOutput={healthEngineOutput}
            unacknowledgedAlertsCount={unacknowledgedAlertsCount}
            todayCheckIn={todayCheckIn}
            onStartCheckIn={handleStartCheckIn}
            onReviewCheckIn={() => handleReviewCheckIn(todayCheckIn)}
            onUpdateCheckIn={() => handleUpdateCheckIn(todayCheckIn)}
            onNavigatePhysical={() => navigateTo('physical')}
            onNavigateMental={() => navigateTo('mental')}
            onNavigateDashboard={() => navigateTo('overview')}
            onNavigateAI={() => navigateTo('astra-ai')}
            onNavigateSettings={() => navigateTo('settings')}
            onNavigateMission={() => navigateTo('mission')}
            onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
            onNavigateProfile={() => navigateTo('profile')}
          />
        </section>
      ) : (
        /* 12-Column Desktop Grid Layout & Mission Workspace for Sub-Pages */
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-start">
            
            {/* Left Navigation: Grouped 2-Column Desktop Sidebar & Mobile Bottom Nav */}
            <div className="col-span-12 md:col-span-2">
              <Sidebar
                activeTab={activeTab}
                onSelectTab={navigateTo}
                onNavigateToHealthDomain={navigateToHealth}
                unacknowledgedAlertsCount={unacknowledgedAlertsCount}
              />
            </div>

            {/* Main Content Area: 10 Columns */}
            <main className="col-span-12 md:col-span-10 space-y-4 min-w-0">
          
          {/* Reviewer Simulation Dock (Available across all views) */}
          <SimulationBar
            connectionState={connectionState}
            simulationActive={simulationActive}
            onStartHealthEvent={startHealthDriftSimulation}
            onToggleCommsLoss={toggleCommunicationLoss}
            onResetBaseline={resetDemoBaseline}
            onShowArchitecture={() => setIsArchModalOpen(true)}
          />

          {/* Module 1: PHYSICAL HEALTH (Complete Working View) */}
          {activeTab === 'physical' && (
            <PhysicalHealthView
              currentHealth={current}
              baselines={baselines}
              telemetryHistory={telemetry}
              sol={missionContext.sol}
              radiationHistory={radiationHistory}
              onRecordMeasurement={recordMeasurement}
              onDeleteMeasurement={deleteMeasurement}
              onEditMeasurement={editMeasurement}
              onSaveRadiationMeasurement={recordRadiationMeasurement}
              onDeleteRadiationMeasurement={deleteRadiationMeasurement}
              onNavigateTrends={() => navigateTo('trends')}
              onAskAstra={handleAskAstra}
            />
          )}

          {/* Module 2: MENTAL HEALTH (Complete Working View) */}
          {activeTab === 'mental' && (
            <MentalHealthView
              currentHealth={current}
              baselines={baselines}
              checkIns={checkIns}
              sol={missionContext.sol}
              onSubmitCheckIn={submitCheckIn}
              onRecordMeasurement={recordMeasurement}
              onRecordCognitiveResult={recordCognitiveResult}
              onDeleteCheckIn={deleteCheckIn}
              onNavigateTrends={() => navigateTo('trends')}
              onAskAstra={handleAskAstra}
            />
          )}

          {/* Module 3: OVERVIEW DASHBOARD (Astronaut-First Mission Control Console) */}
          {activeTab === 'overview' && (
            <OverviewView
              current={current}
              baselines={baselines}
              telemetry={telemetry}
              alerts={alerts}
              recentCheckIn={todayCheckIn || checkIns[0]}
              todayCheckIn={todayCheckIn}
              astraObservation={healthEngineOutput.astraObservation}
              severity={healthEngineOutput.overallSeverity}
              statusText={healthEngineOutput.overallStatusText}
              unacknowledgedAlertsCount={unacknowledgedAlertsCount}
              activeAiSource={activeAiSource}
              sol={missionContext.sol}
              missionName={missionContext.name}
              missionContext={missionContext}
              connectionState={connectionState}
              syncPendingCount={syncState.pendingCount}
              syncState={syncState}
              onNavigateToHealthDomain={navigateToHealth}
              onNavigateTab={navigateTo}
              onOpenCheckIn={handleStartCheckIn}
              onReviewCheckIn={() => handleReviewCheckIn(todayCheckIn)}
              onUpdateCheckIn={() => handleUpdateCheckIn(todayCheckIn)}
              onViewCheckInHistory={() => setIsHistoryModalOpen(true)}
              onAskAstra={handleAskAstra}
              onOpenAlerts={() => navigateTo('alerts')}
              onTriggerSync={triggerSync}
            />
          )}

          {/* Module 4: ASTRA AI ASSISTANT (Interactive Mission Assistant) */}
          {activeTab === 'astra-ai' && (
            <AIAssistantView
              missionContext={missionContext}
              currentHealth={current}
              baselines={baselines}
              activeAlerts={alerts}
              recentCheckIn={todayCheckIn || checkIns[0]}
              activities={activities}
              dailyActivitySummary={dailyActivitySummary}
              aiMode={aiMode}
              activeAiSource={activeAiSource}
              initialPrompt={aiInitialPrompt}
              onClearInitialPrompt={() => setAiInitialPrompt(undefined)}
              onNavigateTab={navigateTo}
              onOpenCheckInModal={handleStartCheckIn}
              onRecordActivity={recordActivity}
              onDeleteActivity={deleteActivity}
            />
          )}

          {/* Tab 2: WHAT CHANGED? (Dedicated Deep Dive) */}
          {activeTab === 'what-changed' && (
            <WhatChangedView
              sol={missionContext.sol}
              whatChangedItems={healthEngineOutput.whatChangedList}
              multiMetricChanges={healthEngineOutput.multiMetricChanges}
              astraObservation={healthEngineOutput.astraObservation}
              suggestedNextStep={healthEngineOutput.suggestedNextStep}
              onAskAstra={handleAskAstra}
              onViewData={() => navigateToHealth('ALL')}
            />
          )}

          {/* Tab 3: HEALTH (Cardio, Respiratory, Recovery, Fitness, Cognitive, Radiation) */}
          {activeTab === 'health' && (
            <HealthView
              currentHealth={current}
              baselines={baselines}
              telemetryHistory={telemetry}
              sol={missionContext.sol}
              initialTab={healthSubTab}
              nasaRadiation={nasaRadiation}
              nasaSpaceWeather={nasaSpaceWeather}
              onAskAstra={handleAskAstra}
              onRunCognitiveTest={() => recordCognitiveResult({
                taskType: 'ATTENTION',
                score: 92,
                baselineScore: 90,
                deviationPercent: 2.2,
                durationSeconds: 180,
              })}
            />
          )}


          {/* Tab 4: TRENDS */}
          {activeTab === 'trends' && (
            <TrendsView
              telemetryHistory={telemetry}
              baselines={baselines}
              sol={missionContext.sol}
              onAskAstra={handleAskAstra}
            />
          )}

          {/* Tab 6: DAILY CHECK-IN */}
          {activeTab === 'check-in' && (
            <CheckInView
              sol={missionContext.sol}
              existingCheckIn={checkIns[0]}
              onSubmitCheckIn={submitCheckIn}
              onAskAstra={handleAskAstra}
              onViewOverview={() => navigateTo('overview')}
            />
          )}

          {/* Tab 7: ALERT CENTER */}
          {activeTab === 'alerts' && (
            <AlertCenterView
              alerts={alerts}
              sol={missionContext.sol}
              onAcknowledge={acknowledgeAlert}
              onAskAstra={handleAskAstra}
              onViewData={() => navigateToHealth('ALL')}
            />
          )}

          {/* Tab 10: TIMELINE */}
          {activeTab === 'timeline' && (
            <TimelineView
              timeline={timeline}
              sol={missionContext.sol}
            />
          )}

          {/* Tab 11: MISSION */}
          {activeTab === 'mission' && (
            <MissionView
              mission={missionContext}
              nasaRadiation={nasaRadiation}
              nasaSpaceWeather={nasaSpaceWeather}
              nasaResearch={nasaResearch}
              onAskAstra={handleAskAstra}
            />
          )}

          {/* Tab 12: CREW */}
          {activeTab === 'crew' && (
            <CrewView
              crew={crew}
              currentRole={userRole}
              onSelectRole={setUserRole}
              onAskAstra={handleAskAstra}
            />
          )}

          {/* Tab 13: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView
              aiMode={aiMode}
              onSetAiMode={setAiMode}
              syncPendingCount={syncState.pendingCount}
              onTriggerSync={triggerSync}
              nasaStatus={nasaStatus}
              onClearNasaCache={clearNasaCache}
              onRefreshNasa={refreshNasaData}
            />
          )}

          {/* Tab 14: MISSION PROFILE */}
          {activeTab === 'profile' && (
            <MissionProfileView
              missionContext={missionContext}
              healthEngineOutput={healthEngineOutput}
              todayCheckIn={todayCheckIn}
              currentHealth={current}
              baselines={baselines}
              onNavigateTab={navigateTo}
              onOpenCheckInModal={handleStartCheckIn}
            />
          )}


        </main>
      </div>
    </div>
    )}

      {/* Quick Daily Health Check-in 3-Step Modal */}
      <QuickDailyCheckInModal
        isOpen={isQuickCheckInOpen}
        sol={selectedHistoryCheckIn?.sol || missionContext.sol}
        existingCheckIn={selectedHistoryCheckIn || todayCheckIn}
        mode={checkInModalMode}
        onClose={() => {
          setIsQuickCheckInOpen(false);
          setSelectedHistoryCheckIn(undefined);
        }}
        onSubmit={submitCheckIn}
        onNavigateDashboard={() => navigateTo('overview')}
        onNavigateTrends={() => navigateTo('trends')}
      />

      {/* Daily Health History Modal */}
      <DailyHealthHistoryModal
        isOpen={isHistoryModalOpen}
        checkIns={checkIns}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectCheckIn={(ci) => {
          setIsHistoryModalOpen(false);
          setSelectedHistoryCheckIn(ci);
          setCheckInModalMode('review');
          setIsQuickCheckInOpen(true);
        }}
      />

      {/* Daily Check-In Modal (Alternative / Full) */}
      <DailyCheckInModal
        isOpen={isCheckInOpen}
        sol={missionContext.sol}
        onClose={() => setIsCheckInOpen(false)}
        onSubmit={async (data) => {
          await submitCheckIn(data);
        }}
      />

      {/* System Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* 5-Step Guided Tour Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartSimulation={() => {
          startHealthDriftSimulation();
          navigateTo('overview');
        }}
      />

      {/* Unified Mission Command Menu Modal (Top Right Drawer) */}
      <MissionCommandMenuModal
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={navigateTo}
        unacknowledgedAlertsCount={unacknowledgedAlertsCount}
        connectionState={connectionState}
        aiMode={aiMode}
        activeAiSource={activeAiSource}
        syncPendingCount={syncState.pendingCount}
        overallSeverity={healthEngineOutput.overallSeverity}
        sol={missionContext.sol}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Aerospace Footer */}
      <footer className="mt-8 border-t border-slate-800/80 bg-slate-950/90 py-3 px-4 text-[11px] font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>ASTRA Health v2.4 • Prototype for NASA Space Apps Challenge</span>
            <span className="mx-2">•</span>
            <span>Mission MARS-01 • Sol {missionContext.sol}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400">Offline-First IndexedDB Active</span>
            <span>•</span>
            <button
              onClick={() => setIsArchModalOpen(true)}
              className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Dataflow Architecture
            </button>
            <span>•</span>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              System Guide
            </button>
          </div>
        </div>
      </footer>
      </main>

    </div>
  );
}
export default App;
