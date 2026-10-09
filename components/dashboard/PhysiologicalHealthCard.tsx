import React, { useState } from 'react';
import { DashboardViewModel } from '../../health/dashboardViewModel';
import { 
  Heart, 
  Activity, 
  Wind, 
  ChevronRight, 
  ShieldCheck, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Flame, 
  Gauge 
} from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';

interface PhysiologicalHealthCardProps {
  data: DashboardViewModel['physicalHealth'];
  onNavigateDomain: (domain: 'CARDIO' | 'RESPIRATORY' | 'FITNESS' | 'RECOVERY') => void;
}

export const PhysiologicalHealthCard: React.FC<PhysiologicalHealthCardProps> = ({
  data,
  onNavigateDomain,
}) => {
  const [showSecondary, setShowSecondary] = useState(false);

  const handleDomainClick = (domain: 'CARDIO' | 'RESPIRATORY' | 'FITNESS' | 'RECOVERY') => {
    spaceAudio.playClick();
    onNavigateDomain(domain);
  };

  return (
    <article
      id="card-physiological-health"
      aria-labelledby="heading-physio-health"
      className="bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl shadow-black/40 flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Dynamic top orbital accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/40 via-cyan-500/60 to-emerald-500/40 opacity-75" />

      <div>
        {/* Header Title */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400">
              <Heart className="w-4 h-4 animate-pulse" />
            </div>
            <h2 
              id="heading-physio-health" 
              className="text-base sm:text-lg font-bold font-mono tracking-wider text-slate-100 uppercase"
            >
              PHYSIOLOGICAL HEALTH
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-950/80 text-cyan-400 border border-slate-800 tracking-wider">
            System 01 / 02
          </span>
        </div>

        {/* Physical Health Index Score & Status */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/90 mb-5 relative overflow-hidden">
          {/* Subtle live EKG wave in background */}
          <div className="absolute right-2 top-2 opacity-20 pointer-events-none w-32 h-10 overflow-hidden">
            <svg viewBox="0 0 120 30" className="w-full h-full stroke-cyan-400 fill-none" strokeWidth="1.5">
              <path d="M 0 15 L 20 15 L 25 15 L 30 5 L 35 25 L 40 10 L 45 18 L 50 15 L 120 15" />
            </svg>
          </div>

          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                BIO SIGNAL INDEX
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-100">
                  {data.index}
                </span>
                <span className="text-sm font-mono text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full border ${data.status.badgeBg}`}>
                <span className={`w-2 h-2 rounded-full ${data.status.dotColor} animate-pulse`} />
                ● {data.status.label}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Trend: <strong className="text-slate-200">{data.trendLabel}</strong>
              </span>
            </div>
          </div>

          {/* Horizontal Gauge Bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-3 relative p-0.5 border border-slate-800">
            <div 
              className={`h-full bg-gradient-to-r ${data.status.barColor} transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]`}
              style={{ width: `${Math.min(100, Math.max(5, data.index))}%` }}
            />
          </div>

          {/* Personal Baseline Range */}
          <div className="flex items-center justify-between mt-2.5 text-[11px] font-mono text-slate-400">
            <span>Personal baseline: <strong className="text-cyan-300 font-mono">{data.baselineRange}</strong></span>
            <span className="text-emerald-400">Nominal: &gt;80</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans italic">
            *Composite flight telemetry derived from 14-day rolling equilibrium. Non-diagnostic.
          </p>
        </div>

        {/* 3 Primary Metric Areas (Clickable aerodynamic capsules) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* 1. Blood Pressure */}
          <button
            onClick={() => handleDomainClick('CARDIO')}
            className="group flex flex-col p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/70 transition-all text-left cursor-pointer hover:shadow-[0_0_16px_rgba(6,182,212,0.2)]"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>{data.bloodPressure.label}</span>
              <span className="text-cyan-400 font-bold">{data.bloodPressure.trendSymbol}</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 group-hover:text-cyan-300 transition">
              {data.bloodPressure.value} <span className="text-xs text-slate-400 font-normal">{data.bloodPressure.unit}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1">
              {data.bloodPressure.statusText}
            </div>
          </button>

          {/* 2. Heart Rate */}
          <button
            onClick={() => handleDomainClick('CARDIO')}
            className="group flex flex-col p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/70 transition-all text-left cursor-pointer hover:shadow-[0_0_16px_rgba(245,158,11,0.2)]"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>{data.heartRate.label}</span>
              <span className="text-amber-400 font-bold">{data.heartRate.trendSymbol}</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 group-hover:text-amber-300 transition">
              {data.heartRate.value} <span className="text-xs text-slate-400 font-normal">{data.heartRate.unit}</span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono mt-1">
              {data.heartRate.statusText}
            </div>
          </button>

          {/* 3. Activity */}
          <button
            onClick={() => handleDomainClick('FITNESS')}
            className="group flex flex-col p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/70 transition-all text-left cursor-pointer hover:shadow-[0_0_16px_rgba(16,185,129,0.2)]"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>{data.activity.label}</span>
              <span className="text-emerald-400 font-bold">{data.activity.trendSymbol}</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 group-hover:text-emerald-300 transition">
              {data.activity.value} <span className="text-xs text-slate-400 font-normal">{data.activity.unit}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1">
              {data.activity.statusText}
            </div>
          </button>
        </div>

        {/* Progressive Disclosure Toggle */}
        <button
          onClick={() => {
            spaceAudio.playClick();
            setShowSecondary(!showSecondary);
          }}
          className="w-full flex items-center justify-between py-2 px-3 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition rounded-lg hover:bg-slate-950/50 mb-2 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            {showSecondary ? 'Hide telemetry parameters' : 'Show HRV, SpO₂, respiratory & recovery telemetry'}
          </span>
          {showSecondary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Secondary Progressive Disclosure Data */}
        {showSecondary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-center animate-fadeIn">
            <div className="p-1.5">
              <div className="text-[10px] font-mono text-slate-400">HRV (RMSSD)</div>
              <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">{data.secondary.hrv} ms</div>
              <div className="text-[10px] text-amber-400 font-mono">↓ -18% 14d</div>
            </div>
            <div className="p-1.5">
              <div className="text-[10px] font-mono text-slate-400">SpO₂</div>
              <div className="text-sm font-bold font-mono text-emerald-300 mt-0.5">{data.secondary.spo2}%</div>
              <div className="text-[10px] text-emerald-400 font-mono">Optimal</div>
            </div>
            <div className="p-1.5">
              <div className="text-[10px] font-mono text-slate-400">RESPIRATION</div>
              <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">{data.secondary.respiratoryRate} /min</div>
              <div className="text-[10px] text-slate-400 font-mono">Baseline</div>
            </div>
            <div className="p-1.5">
              <div className="text-[10px] font-mono text-slate-400">RECOVERY</div>
              <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">{data.secondary.recoveryScore}%</div>
              <div className="text-[10px] text-amber-400 font-mono">Below norm</div>
            </div>
          </div>
        )}
      </div>

      {/* Aerodynamic Capsule Navigation Button */}
      <div className="mt-2 pt-1">
        <button
          onClick={() => handleDomainClick('CARDIO')}
          className="w-full space-capsule-btn space-capsule-btn-glass text-xs py-2.5 px-5 group-hover:border-cyan-500/60"
        >
          <span>VIEW BIO SIGNAL</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </article>
  );
};
