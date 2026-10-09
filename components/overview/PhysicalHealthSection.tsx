import React from 'react';
import { PhysicalHealthSystemData } from '../../health/healthIndexes';
import { HealthTabType } from '../modules/HealthView';
import { 
  Heart, 
  Wind, 
  Dumbbell, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';

interface PhysicalHealthSectionProps {
  data: PhysicalHealthSystemData;
  onViewPhysicalHealth: () => void;
  onNavigateToDomain: (domain: HealthTabType) => void;
}

export const PhysicalHealthSection: React.FC<PhysicalHealthSectionProps> = ({
  data,
  onViewPhysicalHealth,
  onNavigateToDomain,
}) => {
  const { 
    index, 
    status, 
    baselineRange, 
    trendLabel, 
    supportingText, 
    cardiovascular, 
    respiratory, 
    fitness 
  } = data;

  const getSubStatusBadge = (s: 'Normal' | 'Monitor' | 'Attention') => {
    switch (s) {
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Normal
          </span>
        );
      case 'Monitor':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Monitor
          </span>
        );
      case 'Attention':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-200 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-700/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Attention
          </span>
        );
    }
  };

  return (
    <div 
      id="physical-health-command-panel"
      className="relative flex flex-col justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/90 hover:border-slate-700/80 transition-all p-5 sm:p-6 shadow-lg shadow-black/40 overflow-hidden"
    >
      {/* Top subtle glow accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/40 via-teal-500/60 to-cyan-500/20" />

      <div>
        {/* Header: Title & Subtitle */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                HEALTH SYSTEM 01
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400 font-mono">AUTONOMOUS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 mt-1">
              BIO SIGNAL
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Cardiovascular, respiratory, and physical conditioning
            </p>
          </div>

          {/* Status Badge: icon + text + color */}
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wider uppercase font-mono ${status.badgeBg}`}
          >
            <span className={`w-2 h-2 rounded-full ${status.dotColor}`} />
            <span>{status.label}</span>
          </div>
        </div>

        {/* Primary Health Index Number & Horizontal Visualization (Sections 8, 11) */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 mb-5">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-slate-50">
                {index}
              </span>
              <span className="text-base sm:text-lg font-mono text-slate-500 font-semibold">
                / 100
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              BIO SIGNAL INDEX
            </span>
          </div>

          {/* Horizontal Index Gauge Bar with animated fill and baseline marker */}
          <div className="space-y-1.5">
            <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full bg-gradient-to-r ${status.barColor} transition-all duration-700 ease-out rounded-full`}
                style={{ width: `${Math.min(100, Math.max(8, index))}%` }}
              />
              {/* Baseline target indicator tick */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-[0_0_4px_white]"
                style={{ left: '85%' }}
                title="Baseline center (85)"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>0</span>
              <span className="text-slate-500">Target Range ({baselineRange})</span>
              <span>100</span>
            </div>
          </div>

          {/* Baseline Comparison (Section 12) */}
          <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-slate-800/80 text-center font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">CURRENT</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{index}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">BASELINE</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">{baselineRange}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">TREND</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                <span>{trendLabel}</span>
              </div>
            </div>
          </div>

          {/* Supporting Text */}
          <p className="text-xs text-slate-400 mt-2.5 text-center sm:text-left italic">
            "{supportingText}"
          </p>
        </div>

        {/* Key Indicators (Section 7, 8) */}
        <div className="space-y-2.5 mb-5">
          {/* 1. Cardiovascular */}
          <button
            onClick={() => onNavigateToDomain('CARDIO')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/70 hover:border-cyan-500/40 transition text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/40 group-hover:border-rose-500/50 transition">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300 transition flex items-center gap-1.5">
                  CARDIOVASCULAR
                  <span className="text-[10px] text-slate-500 font-normal">({cardiovascular.trendSymbol})</span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  HR <span className="text-slate-100 font-semibold">{cardiovascular.heartRate} bpm</span> • HRV <span className="text-slate-100 font-semibold">{cardiovascular.hrv} ms</span>
                </div>
              </div>
            </div>
            <div>
              {getSubStatusBadge(cardiovascular.status)}
            </div>
          </button>

          {/* 2. Respiratory */}
          <button
            onClick={() => onNavigateToDomain('RESPIRATORY')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/70 hover:border-cyan-500/40 transition text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-900/40 group-hover:border-cyan-500/50 transition">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300 transition">
                  RESPIRATORY
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  SpO₂ <span className="text-slate-100 font-semibold">{respiratory.spo2}%</span> • Resp <span className="text-slate-100 font-semibold">{respiratory.respiratoryRate} / min</span>
                </div>
              </div>
            </div>
            <div>
              {getSubStatusBadge(respiratory.status)}
            </div>
          </button>

          {/* 3. Fitness */}
          <button
            onClick={() => onNavigateToDomain('FITNESS')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/70 hover:border-cyan-500/40 transition text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-900/40 group-hover:border-amber-500/50 transition">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300 transition">
                  FITNESS
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  Exercise <span className="text-slate-100 font-semibold">{fitness.exerciseDurationMinutes} min</span> • Output <span className="text-slate-100 font-semibold">{fitness.performancePercent}%</span>
                </div>
              </div>
            </div>
            <div>
              {getSubStatusBadge(fitness.status)}
            </div>
          </button>
        </div>
      </div>

      {/* Action Button at bottom: [ VIEW PHYSICAL HEALTH → ] */}
      <button
        id="btn-view-physical-health"
        onClick={onViewPhysicalHealth}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white border border-slate-700/80 hover:border-cyan-500/60 font-mono text-xs font-bold tracking-wider uppercase transition group cursor-pointer shadow-sm"
      >
        <span>VIEW BIO SIGNAL</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
