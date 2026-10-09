import React, { useState } from 'react';
import { DashboardViewModel } from '../../health/dashboardViewModel';
import { 
  Brain, 
  Moon, 
  Smile, 
  Activity, 
  ChevronRight, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ClipboardEdit,
  Zap, 
  Target 
} from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';

interface PsychologicalHealthCardProps {
  data: DashboardViewModel['mentalHealth'];
  onNavigateDomain: (domain: 'RECOVERY' | 'COGNITIVE') => void;
  onOpenCheckIn: () => void;
}

export const PsychologicalHealthCard: React.FC<PsychologicalHealthCardProps> = ({
  data,
  onNavigateDomain,
  onOpenCheckIn,
}) => {
  const [showSecondary, setShowSecondary] = useState(false);

  const handleDomainClick = (domain: 'RECOVERY' | 'COGNITIVE') => {
    spaceAudio.playClick();
    onNavigateDomain(domain);
  };

  const handleCheckInClick = () => {
    spaceAudio.playQuindar();
    onOpenCheckIn();
  };

  return (
    <article
      id="card-psychological-health"
      aria-labelledby="heading-psych-health"
      className="bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl shadow-black/40 flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Dynamic top orbital accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/40 via-purple-500/60 to-cyan-500/40 opacity-75" />

      <div>
        {/* Header Title */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <h2 
              id="heading-psych-health" 
              className="text-base sm:text-lg font-bold font-mono tracking-wider text-slate-100 uppercase"
            >
              PSYCHOLOGICAL HEALTH
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-950/80 text-indigo-400 border border-slate-800 tracking-wider">
            System 02 / 02
          </span>
        </div>

        {/* Mental Health Index Score & Status */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/90 mb-5 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                NEURAL SIGNAL INDEX
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
              className={`h-full bg-gradient-to-r ${data.status.barColor} transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]`}
              style={{ width: `${Math.min(100, Math.max(5, data.index))}%` }}
            />
          </div>

          {/* Personal Baseline Range */}
          <div className="flex items-center justify-between mt-2.5 text-[11px] font-mono text-slate-400">
            <span>Personal baseline: <strong className="text-indigo-300 font-mono">{data.baselineRange}</strong></span>
            <span className="text-emerald-400">Target: &gt;75</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans italic">
            *Composite monitoring indicator derived from cognitive reaction and recovery. Non-diagnostic.
          </p>
        </div>

        {/* 3 Simple Indicators (Clickable aerodynamic capsules) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* 1. Sleep */}
          <button
            onClick={() => handleDomainClick('RECOVERY')}
            className="group flex flex-col p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/70 transition-all text-left cursor-pointer hover:shadow-[0_0_16px_rgba(99,102,241,0.2)]"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> {data.sleep.label}
              </span>
              <span className="text-amber-400 font-bold">{data.sleep.trendSymbol}</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 group-hover:text-indigo-300 transition">
              {data.sleep.value}
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-1">
              {data.sleep.statusText}
            </div>
          </button>

          {/* 2. Stress */}
          <button
            onClick={handleCheckInClick}
            className="group flex flex-col p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/70 transition-all text-left cursor-pointer hover:shadow-[0_0_16px_rgba(99,102,241,0.2)]"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>{data.stress.label}</span>
              <span className="text-amber-400 font-bold">{data.stress.trendSymbol}</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 group-hover:text-indigo-300 transition">
              {data.stress.value}
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-1">
              {data.stress.statusText}
            </div>
          </button>

          {/* 3. Mood */}
          <button
            onClick={handleCheckInClick}
            className="group flex flex-col p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/70 transition-all text-left cursor-pointer hover:shadow-[0_0_16px_rgba(99,102,241,0.2)]"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>{data.mood.label}</span>
              <span className="text-cyan-400 font-bold">{data.mood.trendSymbol}</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 group-hover:text-indigo-300 transition">
              {data.mood.value}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1">
              {data.mood.statusText}
            </div>
          </button>
        </div>

        {/* Progressive Disclosure Toggle */}
        <button
          onClick={() => {
            spaceAudio.playClick();
            setShowSecondary(!showSecondary);
          }}
          className="w-full flex items-center justify-between py-2 px-3 text-[11px] font-mono text-slate-400 hover:text-indigo-300 transition rounded-lg hover:bg-slate-950/50 mb-2 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            {showSecondary ? 'Hide cognitive parameters' : 'Show reaction time, attention vigilance & fatigue'}
          </span>
          {showSecondary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Secondary Progressive Disclosure Data */}
        {showSecondary && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-center animate-fadeIn">
            <div className="p-1.5">
              <div className="text-[10px] font-mono text-slate-400">REACTION TIME</div>
              <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">{data.secondary.reactionTimeMs} ms</div>
              <div className="text-[10px] text-emerald-400 font-mono">Nominal</div>
            </div>
            <div className="p-1.5">
              <div className="text-[10px] font-mono text-slate-400">ATTENTION</div>
              <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">{data.secondary.attentionPercent}%</div>
              <div className="text-[10px] text-cyan-400 font-mono">Vigilant</div>
            </div>
            <div className="p-1.5">
              <div className="text-[10px] font-mono text-slate-400">FATIGUE INDEX</div>
              <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">{data.secondary.fatigueScore}%</div>
              <div className="text-[10px] text-amber-400 font-mono">Mild strain</div>
            </div>
          </div>
        )}
      </div>

      {/* Aerodynamic Capsule Navigation Buttons */}
      <div className="mt-2 pt-1 flex items-center gap-2">
        <button
          onClick={() => handleDomainClick('RECOVERY')}
          className="flex-1 space-capsule-btn space-capsule-btn-glass text-xs py-2.5 px-4 group-hover:border-indigo-500/60"
        >
          <span>VIEW NEURAL SIGNAL</span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={handleCheckInClick}
          className="space-capsule-btn bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-700/80 text-indigo-300 text-xs py-2.5 px-4 shrink-0"
          title="Record today's psychological check-in"
        >
          <ClipboardEdit className="w-3.5 h-3.5" />
          <span>CHECK-IN</span>
        </button>
      </div>
    </article>
  );
};
