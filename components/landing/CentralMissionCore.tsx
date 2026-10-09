import React from 'react';
import { Activity, ShieldCheck, HeartPulse, Brain, BarChart3, Bot } from 'lucide-react';

export type ActiveModuleType = 'PHYSICAL' | 'MENTAL' | 'DASHBOARD' | 'AI' | null;

interface CentralMissionCoreProps {
  activeHoverModule: ActiveModuleType;
  parallaxOffset: { x: number; y: number };
  prefersReducedMotion: boolean;
  sol: number;
  physicalScore: number;
  mentalScore: number;
  alertsCount: number;
}

export const CentralMissionCore: React.FC<CentralMissionCoreProps> = ({
  activeHoverModule,
  parallaxOffset,
  prefersReducedMotion,
  sol,
  physicalScore,
  mentalScore,
  alertsCount,
}) => {
  // Determine aura colors based on active hover module
  const auraGlowConfig = {
    PHYSICAL: {
      radial: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.4) 0%, rgba(14, 116, 144, 0.15) 50%, transparent 70%)',
      borderColor: 'border-cyan-500/50',
      textColor: 'text-cyan-400',
      ringColor: 'rgba(6, 182, 212, 0.4)',
      label: 'BIO SIGNAL MONITORING',
      status: `CARDIO & FITNESS • IDX ${physicalScore}`,
      Icon: HeartPulse,
    },
    MENTAL: {
      radial: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.4) 0%, rgba(126, 34, 206, 0.15) 50%, transparent 70%)',
      borderColor: 'border-purple-500/50',
      textColor: 'text-purple-400',
      ringColor: 'rgba(168, 85, 247, 0.4)',
      label: 'NEURAL SIGNAL',
      status: `RECOVERY & MOOD • IDX ${mentalScore}`,
      Icon: Brain,
    },
    DASHBOARD: {
      radial: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.4) 0%, rgba(180, 83, 9, 0.15) 50%, transparent 70%)',
      borderColor: 'border-amber-500/50',
      textColor: 'text-amber-400',
      ringColor: 'rgba(245, 158, 11, 0.4)',
      label: 'MISSION TELEMETRY',
      status: 'MULTI-SYSTEM INTEGRATED',
      Icon: BarChart3,
    },
    AI: {
      radial: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4) 0%, rgba(29, 78, 216, 0.15) 50%, transparent 70%)',
      borderColor: 'border-blue-500/50',
      textColor: 'text-blue-400',
      ringColor: 'rgba(59, 130, 246, 0.4)',
      label: 'ASTRA INTELLIGENCE',
      status: 'ON-STATION AUTONOMOUS',
      Icon: Bot,
    },
  }[activeHoverModule || 'PHYSICAL'] || {
    radial: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.22) 0%, rgba(30, 58, 138, 0.1) 50%, transparent 70%)',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    ringColor: 'rgba(56, 189, 248, 0.25)',
    label: 'HEALTH INTELLIGENCE',
    status: alertsCount > 0 ? `${alertsCount} TELEMETRY ADVISORIES` : 'ALL SYSTEMS NOMINAL',
    Icon: Activity,
  };

  const defaultGlow = 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.2) 0%, rgba(30, 58, 138, 0.08) 50%, transparent 70%)';

  const transformStyle = prefersReducedMotion
    ? undefined
    : {
        transform: `translate3d(${parallaxOffset.x * 10}px, ${parallaxOffset.y * 10}px, 0)`,
        transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
      };

  const CurrentIcon = activeHoverModule ? auraGlowConfig.Icon : Activity;

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none pointer-events-none"
      style={transformStyle}
    >
      {/* 1. Atmospheric Ambient Glow */}
      <div
        className="absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full transition-all duration-700 ease-out pointer-events-none"
        style={{
          background: activeHoverModule ? auraGlowConfig.radial : defaultGlow,
          filter: 'blur(32px)',
        }}
      />

      {/* 2. Concentric Outer Radar Reticle Ring */}
      <div 
        className={`absolute w-[240px] h-[240px] sm:w-[270px] sm:h-[270px] rounded-full border border-dashed transition-all duration-500 ${
          activeHoverModule ? auraGlowConfig.borderColor : 'border-slate-700/60'
        } ${prefersReducedMotion ? '' : 'animate-[spin_60s_linear_infinite]'}`}
      />

      {/* 3. Core Cockpit Glass Telemetry Hub */}
      <div className={`relative w-[190px] h-[190px] sm:w-[215px] sm:h-[215px] rounded-full bg-slate-950/85 backdrop-blur-xl border flex flex-col items-center justify-center p-4 text-center transition-all duration-500 shadow-2xl shadow-cyan-950/50 ${
        activeHoverModule ? auraGlowConfig.borderColor : 'border-slate-800'
      }`}>
        {/* Subtle crosshair ticks */}
        <div className="absolute top-2 w-2 h-0.5 bg-slate-600/70" />
        <div className="absolute bottom-2 w-2 h-0.5 bg-slate-600/70" />
        <div className="absolute left-2 h-2 w-0.5 bg-slate-600/70" />
        <div className="absolute right-2 h-2 w-0.5 bg-slate-600/70" />

        {/* Central Pulsing Icon */}
        <div className="relative mb-1">
          <div className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/80 flex items-center justify-center shadow-inner">
            <CurrentIcon className={`w-5 h-5 transition-colors duration-300 ${
              activeHoverModule ? auraGlowConfig.textColor : 'text-cyan-400'
            }`} />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
        </div>

        {/* Tactical Title */}
        <div className="text-[13px] font-black tracking-wider text-slate-100 uppercase">
          ASTRA CORE
        </div>

        {/* Mission Subtitle */}
        <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
          MARS-01 • SOL {sol}
        </div>

        {/* Dynamic Telemetry Status */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 w-full flex flex-col items-center">
          <span className={`text-[8.5px] font-mono font-bold tracking-wider uppercase transition-colors duration-300 ${
            activeHoverModule ? auraGlowConfig.textColor : 'text-slate-300'
          }`}>
            {auraGlowConfig.label}
          </span>
          <span className="text-[8px] font-mono text-slate-400 truncate max-w-[150px] mt-0.5">
            {auraGlowConfig.status}
          </span>
        </div>
      </div>

      {/* 4. Central Micro-Copy Under Core */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none">
        <p className="text-xs font-mono tracking-widest text-slate-400 uppercase drop-shadow-md">
          Your health. Your baseline. Your mission.
        </p>
      </div>
    </div>
  );
};
