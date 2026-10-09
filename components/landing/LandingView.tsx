import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Rocket, 
  Settings as SettingsIcon,
  Eye,
  Crosshair
} from 'lucide-react';
import { useParallax } from '../../hooks/useParallax';
import { ConnectionState } from '../../services/connectivityManager';
import { AIMode, AISource } from '../../types/ai';
import { HealthEngineOutput } from '../../health/healthEngine';
import { MissionContext } from '../../types/mission';
import { DailyCheckIn } from '../../types/health';
import { calculatePhysicalHealthIndex, calculateMentalHealthIndex } from '../../health/healthIndexes';
import { TodayCheckInBanner } from '../checkin/TodayCheckInBanner';
import { ActiveModuleType } from './CentralMissionCore';
import { OrbitalSystem } from './OrbitalSystem';
import { DynamicModuleCard } from './DynamicModuleCard';
import { MissionThought } from './MissionThought';
import { spaceAudio } from '../../utils/spaceAudio';
import { getAstronautProfile, subscribeToProfile, getGreeting } from '../../services/profileService';

interface LandingViewProps {
  missionContext: MissionContext;
  connectionState: ConnectionState;
  aiMode: AIMode;
  activeAiSource: AISource;
  healthEngineOutput: HealthEngineOutput;
  unacknowledgedAlertsCount: number;
  todayCheckIn?: DailyCheckIn;
  onStartCheckIn: () => void;
  onReviewCheckIn: () => void;
  onUpdateCheckIn: () => void;
  onNavigatePhysical: () => void;
  onNavigateMental: () => void;
  onNavigateDashboard: () => void;
  onNavigateAI: () => void;
  onNavigateSettings?: () => void;
  onNavigateMission?: () => void;
  onOpenCommandMenu?: () => void;
  onNavigateProfile?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  missionContext,
  connectionState,
  aiMode,
  activeAiSource,
  healthEngineOutput,
  unacknowledgedAlertsCount,
  todayCheckIn,
  onStartCheckIn,
  onReviewCheckIn,
  onUpdateCheckIn,
  onNavigatePhysical,
  onNavigateMental,
  onNavigateDashboard,
  onNavigateAI,
  onNavigateSettings,
  onNavigateMission,
  onOpenCommandMenu,
  onNavigateProfile,
}) => {
  const [profile, setProfile] = useState(() => getAstronautProfile());

  useEffect(() => {
    return subscribeToProfile(setProfile);
  }, []);
  const [hoveredModule, setHoveredModule] = useState<ActiveModuleType>(null);
  const { offset: parallaxOffset, prefersReducedMotion } = useParallax(1);

  const isOffline = connectionState === 'COMMS_BLACKOUT' || aiMode === 'OFFLINE';

  // Real data-driven indices from actual health telemetry
  const physicalScore = calculatePhysicalHealthIndex({
    current: healthEngineOutput.currentMeasurement,
    baselines: healthEngineOutput.baselines,
  });

  const mentalScore = calculateMentalHealthIndex({
    current: healthEngineOutput.currentMeasurement,
    baselines: healthEngineOutput.baselines,
  });

  const aiStatusLabel = isOffline 
    ? 'LOCAL LLaMA' 
    : activeAiSource.includes('GEMINI') 
    ? 'GEMINI 2.5' 
    : 'AI READY';

  const dashboardLabel = healthEngineOutput.whatChangedList.length > 0
    ? `${healthEngineOutput.whatChangedList.length} CHANGES`
    : 'NOMINAL';

  return (
    <div 
      id="astra-space-landing-hub"
      className="relative min-h-[calc(100vh-120px)] flex flex-col justify-between select-none overflow-hidden px-4 py-3 sm:py-4 max-w-7xl mx-auto w-full"
    >
      {/* ============================================================ */}
      {/* 1. TOP MISSION IDENTITY STRIP                                */}
      {/* ============================================================ */}
      <header className="relative z-20 w-full flex items-center justify-between text-left">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black font-mono tracking-widest text-slate-100 uppercase">
              ASTRA HEALTH
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9px] font-mono tracking-widest text-cyan-400 bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded-full uppercase">
              COMMAND HUB
            </span>
          </div>
          <p className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
            <span className="text-cyan-300 font-bold">{getGreeting(profile)}</span> • DEEP SPACE AUTONOMY
          </p>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. DAILY HEALTH CHECK-IN BANNER (SLIM TOP ANCHOR)            */}
      {/* ============================================================ */}
      <div className="relative z-20 max-w-md mx-auto w-full px-2 pt-1 pb-1">
        <TodayCheckInBanner
          sol={missionContext.sol}
          todayCheckIn={todayCheckIn}
          onStartCheckIn={onStartCheckIn}
          onReviewCheckIn={onReviewCheckIn}
          onUpdateCheckIn={onUpdateCheckIn}
          variant="landing"
        />
      </div>

      {/* ============================================================ */}
      {/* 3. WIDE SPATIAL MATRIX - BUTTONS IN DISTANCE AROUND PLANET   */}
      {/* ============================================================ */}
      <div className="relative z-20 flex-1 flex flex-col justify-between items-center w-full my-1 sm:my-3 min-h-[360px] sm:min-h-[420px] lg:min-h-[480px]">
        
        {/* Orbital System Lines & Nodes (Background overlay) */}
        <OrbitalSystem
          activeHoverModule={hoveredModule}
          parallaxOffset={parallaxOffset}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Central Observation Reticle (Very subtle, 100% open for background planet) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-sky-400/10 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-dashed border-sky-400/15 animate-spin" style={{ animationDuration: '60s' }} />
          </div>
        </div>

        {/* TOP ROW: Bio Signal (Left) <--- WIDE DISTANCE ---> Neural Signal (Right) */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
          
          {/* Button 1: Bio Signal (Top-Left) */}
          <div className="w-full sm:w-[320px] md:w-[350px] lg:w-[380px]">
            <DynamicModuleCard
              id="btn-landing-physical"
              moduleKey="PHYSICAL"
              title="Bio Signal"
              subValue={`INDEX ${physicalScore}`}
              currentMeasurement={healthEngineOutput.currentMeasurement}
              isOffline={isOffline}
              activeAiSource={activeAiSource}
              whatChangedCount={healthEngineOutput.whatChangedList.length}
              onHoverStart={setHoveredModule}
              onHoverEnd={() => setHoveredModule(null)}
              onClick={onNavigatePhysical}
            />
          </div>

          {/* Center Orbital Vector Indicator (Unobtrusive) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/40 border border-slate-800/40 backdrop-blur-xs text-[10px] font-mono text-slate-400">
            <Crosshair className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="tracking-widest uppercase">ORBITAL OBSERVATION WINDOW</span>
          </div>

          {/* Button 2: Neural Signal (Top-Right) */}
          <div className="w-full sm:w-[320px] md:w-[350px] lg:w-[380px]">
            <DynamicModuleCard
              id="btn-landing-mental"
              moduleKey="MENTAL"
              title="Neural Signal"
              subValue={`INDEX ${mentalScore}`}
              currentMeasurement={healthEngineOutput.currentMeasurement}
              isOffline={isOffline}
              activeAiSource={activeAiSource}
              whatChangedCount={healthEngineOutput.whatChangedList.length}
              onHoverStart={setHoveredModule}
              onHoverEnd={() => setHoveredModule(null)}
              onClick={onNavigateMental}
            />
          </div>
        </div>

        {/* MIDDLE SECTION: MISSION THOUGHT SYSTEM (BALANCED & UNOBSTRUCTED) */}
        <div className="flex-1 w-full min-h-[60px] sm:min-h-[90px] lg:min-h-[120px] flex items-center justify-center my-1 pointer-events-none">
          <div className="pointer-events-auto">
            <MissionThought 
              sol={missionContext.sol} 
              metDays={missionContext.metDays} 
            />
          </div>
        </div>

        {/* BOTTOM ROW: Health Dashboard (Left) <--- WIDE DISTANCE ---> AI Assistance (Right) */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
          
          {/* Button 3: Health Dashboard (Bottom-Left) */}
          <div className="w-full sm:w-[320px] md:w-[350px] lg:w-[380px]">
            <DynamicModuleCard
              id="btn-landing-dashboard"
              moduleKey="DASHBOARD"
              title="Health Dashboard"
              subValue={dashboardLabel}
              currentMeasurement={healthEngineOutput.currentMeasurement}
              isOffline={isOffline}
              activeAiSource={activeAiSource}
              whatChangedCount={healthEngineOutput.whatChangedList.length}
              onHoverStart={setHoveredModule}
              onHoverEnd={() => setHoveredModule(null)}
              onClick={onNavigateDashboard}
            />
          </div>

          {/* Center Navigation Actions */}
          <div className="flex items-center gap-2 relative z-20">
            {onNavigateMission && (
              <button
                id="landing-quick-mission-btn"
                onClick={() => {
                  spaceAudio.playQuindar();
                  onNavigateMission();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-purple-950/70 text-purple-300 hover:text-white border border-purple-500/40 hover:border-purple-400 font-mono text-[11px] font-bold transition cursor-pointer shadow-sm"
              >
                <Rocket className="w-3.5 h-3.5 text-purple-400" />
                <span>MISSION APIS</span>
              </button>
            )}

            {onNavigateSettings && (
              <button
                id="landing-quick-settings-btn"
                onClick={() => {
                  spaceAudio.playQuindar();
                  onNavigateSettings();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-amber-950/70 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 font-mono text-[11px] font-bold transition cursor-pointer shadow-sm"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>SETTINGS</span>
              </button>
            )}
          </div>

          {/* Button 4: AI Assistance (Bottom-Right) */}
          <div className="w-full sm:w-[320px] md:w-[350px] lg:w-[380px]">
            <DynamicModuleCard
              id="btn-landing-ai"
              moduleKey="AI"
              title="AI Assistance"
              subValue={aiStatusLabel}
              currentMeasurement={healthEngineOutput.currentMeasurement}
              isOffline={isOffline}
              activeAiSource={activeAiSource}
              whatChangedCount={healthEngineOutput.whatChangedList.length}
              onHoverStart={setHoveredModule}
              onHoverEnd={() => setHoveredModule(null)}
              onClick={onNavigateAI}
            />
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. MINIMAL SPATIAL STATUS FOOTER                              */}
      {/* ============================================================ */}
      <footer className="relative z-20 w-full pt-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[10px] font-mono text-slate-500 border-t border-slate-800/40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>AUTONOMOUS CREW HEALTH MONITORING</span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-400">TOUCH & TELEMETRY ACTIVE</span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-400">
          <span>MISSION MARS-01</span>
          <span className="text-slate-700">•</span>
          <span className="text-cyan-400 font-semibold">ASTRA v2.4</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingView;
