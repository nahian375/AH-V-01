import React, { useState, useRef } from 'react';
import { 
  HeartPulse, 
  Brain, 
  BarChart3, 
  Bot, 
  ArrowRight, 
  Activity, 
  Cpu, 
  Layers, 
} from 'lucide-react';
import { ActiveModuleType } from './CentralMissionCore';
import { spaceAudio } from '../../utils/spaceAudio';
import { HealthMeasurement } from '../../types/health';

export interface DynamicModuleCardProps {
  id: string;
  moduleKey: 'PHYSICAL' | 'MENTAL' | 'DASHBOARD' | 'AI';
  title: string;
  subValue: string;
  currentMeasurement: HealthMeasurement;
  isOffline: boolean;
  activeAiSource: string;
  whatChangedCount: number;
  onHoverStart: (key: ActiveModuleType) => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

export const DynamicModuleCard: React.FC<DynamicModuleCardProps> = ({
  id,
  moduleKey,
  title,
  subValue,
  currentMeasurement,
  isOffline,
  activeAiSource,
  whatChangedCount,
  onHoverStart,
  onHoverEnd,
  onClick,
}) => {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = -((y - centerY) / centerY) * 4;
    const tiltY = ((x - centerX) / centerX) * 4;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    spaceAudio.playClick();
    onHoverStart(moduleKey);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    onHoverEnd();
  };

  const handleClick = () => {
    spaceAudio.playQuindar();
    onClick();
  };

  // Theme palettes per module
  const theme = {
    PHYSICAL: {
      border: 'border-cyan-500/30 hover:border-cyan-400',
      glow: 'hover:shadow-[0_0_24px_rgba(6,182,212,0.25)]',
      bgGradient: 'from-cyan-950/30 via-slate-950/70 to-slate-950/80',
      iconBg: 'bg-cyan-950/80 border-cyan-800/80 text-cyan-400',
      badge: 'text-cyan-300 bg-cyan-950/80 border-cyan-700/60',
      lightColor: 'rgba(6, 182, 212, 0.12)',
      pulseColor: 'bg-cyan-400',
      tag: 'BIOMETRICS',
    },
    MENTAL: {
      border: 'border-purple-500/30 hover:border-purple-400',
      glow: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.25)]',
      bgGradient: 'from-purple-950/30 via-slate-950/70 to-slate-950/80',
      iconBg: 'bg-purple-950/80 border-purple-800/80 text-purple-400',
      badge: 'text-purple-300 bg-purple-950/80 border-purple-700/60',
      lightColor: 'rgba(168, 85, 247, 0.12)',
      pulseColor: 'bg-purple-400',
      tag: 'NEURAL FLUX',
    },
    DASHBOARD: {
      border: 'border-amber-500/30 hover:border-amber-400',
      glow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]',
      bgGradient: 'from-amber-950/30 via-slate-950/70 to-slate-950/80',
      iconBg: 'bg-amber-950/80 border-amber-800/80 text-amber-400',
      badge: 'text-amber-300 bg-amber-950/80 border-amber-700/60',
      lightColor: 'rgba(245, 158, 11, 0.12)',
      pulseColor: 'bg-amber-400',
      tag: '14D TELEMETRY',
    },
    AI: {
      border: 'border-blue-500/30 hover:border-blue-400',
      glow: 'hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]',
      bgGradient: 'from-blue-950/30 via-slate-950/70 to-slate-950/80',
      iconBg: 'bg-blue-950/80 border-blue-800/80 text-blue-400',
      badge: 'text-blue-300 bg-blue-950/80 border-blue-700/60',
      lightColor: 'rgba(59, 130, 246, 0.12)',
      pulseColor: 'bg-blue-400',
      tag: 'AI ENGINE',
    },
  }[moduleKey];

  return (
    <button
      ref={cardRef}
      id={id}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${theme.bgGradient} backdrop-blur-md border ${theme.border} ${theme.glow} transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg overflow-hidden`}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? '1.015, 1.015, 1.015' : '1, 1, 1'})`,
        transition: isHovered ? 'transform 0.1s ease-out, border-color 0.2s, box-shadow 0.2s' : 'transform 0.4s ease-out, border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* 1. Subtle Specular Highlight following Cursor */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, ${theme.lightColor}, transparent 65%)`,
        }}
      />

      {/* 2. Top Header Row: Icon, Title, and Score Badge */}
      <div className="relative z-10 flex items-center justify-between gap-2.5 w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-lg border ${theme.iconBg} group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
            {moduleKey === 'PHYSICAL' && <HeartPulse className="w-4 h-4 text-cyan-400 animate-pulse" />}
            {moduleKey === 'MENTAL' && <Brain className="w-4 h-4 text-purple-400" />}
            {moduleKey === 'DASHBOARD' && <BarChart3 className="w-4 h-4 text-amber-400" />}
            {moduleKey === 'AI' && <Bot className="w-4 h-4 text-blue-400" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.pulseColor} animate-ping`} />
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                {theme.tag}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white font-mono tracking-wide truncate transition-colors">
              {title}
            </h3>
          </div>
        </div>

        <span className={`text-[10px] sm:text-[11px] font-mono tracking-wider px-2 py-0.5 rounded-full border ${theme.badge} font-bold whitespace-nowrap shadow-sm`}>
          {subValue}
        </span>
      </div>

      {/* 3. Compact Dynamic Micro-Telemetry Row */}
      <div className="relative z-10 mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-300">
        
        {/* PHYSICAL: Inline ECG Line & RHR */}
        {moduleKey === 'PHYSICAL' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>{currentMeasurement.restingHeartRate} bpm</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{currentMeasurement.hrv}ms HRV</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-emerald-400 hidden sm:inline">{currentMeasurement.spo2}% SpO₂</span>
            </div>

            <div className="w-16 h-4 overflow-hidden flex items-center">
              <svg className="w-full h-full" viewBox="0 0 100 20" fill="none">
                <path
                  d="M 0 10 L 25 10 L 32 2 L 40 18 L 48 10 L 60 10 L 66 5 L 72 15 L 78 10 L 100 10"
                  stroke="#06b6d4"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="animate-ecg drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]"
                />
              </svg>
            </div>
          </div>
        )}

        {/* MENTAL: Inline Neural Bars & Sleep */}
        {moduleKey === 'MENTAL' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-purple-400">{(currentMeasurement.sleepDurationMinutes / 60).toFixed(1)}h Sleep</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{currentMeasurement.recoveryScore}% Rec</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-emerald-400 hidden sm:inline">24.6h Sync</span>
            </div>

            <div className="h-4 w-12 flex items-end justify-between gap-1">
              <div className="w-1.5 bg-purple-500/30 rounded-t h-full flex items-end">
                <div className="w-full bg-purple-400 rounded-t animate-neural-1" />
              </div>
              <div className="w-1.5 bg-purple-500/30 rounded-t h-full flex items-end">
                <div className="w-full bg-purple-400 rounded-t animate-neural-3" />
              </div>
              <div className="w-1.5 bg-purple-500/30 rounded-t h-full flex items-end">
                <div className="w-full bg-purple-300 rounded-t animate-neural-2" />
              </div>
              <div className="w-1.5 bg-purple-500/30 rounded-t h-full flex items-end">
                <div className="w-full bg-purple-400 rounded-t animate-neural-4" />
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD: Inline Baseline Bar & Shifts */}
        {moduleKey === 'DASHBOARD' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>{whatChangedCount} Shifts</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">14-Day Baseline</span>
            </div>

            <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-amber-500/30">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full w-[88%] animate-pulse" />
            </div>
          </div>
        )}

        {/* AI: Inline Synaptic Dots & Engine Status */}
        {moduleKey === 'AI' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
                <span>{isOffline ? 'Local Engine' : 'Gemini 2.5'}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">{isOffline ? '0ms Comms' : 'Orbit Live'}</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-1.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-3.5 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Small Action Chevron Arrow */}
        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all ml-2 flex-shrink-0" />
      </div>
    </button>
  );
};

export default DynamicModuleCard;
