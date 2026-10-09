/**
 * ASTRA Health - Executive Overview Dashboard
 * Follows strict medical monitoring & NASA flight-surgeon design hierarchy:
 * 1. Health Status Card (ONE large card: Am I okay? Status, Last updated, 4 categories)
 * 2. What Changed? (3-5 key changes vs rolling personal baseline)
 * 3. Health Snapshot (6 compact cards: Cardio, Respiratory, Sleep & Recovery, Fitness, Cognitive, Radiation)
 * 4. ASTRA Insight (AI observation with clear source badge & action)
 * 5. Today's Mission Health (Simple checklist & completion indicators)
 */

import React from 'react';
import { 
  HeartPulse, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Bot,
  MessageSquare,
  Activity,
  Wind,
  Moon,
  Dumbbell,
  Brain,
  Radiation,
  Clock,
  ClipboardCheck,
  Droplets,
  Heart
} from 'lucide-react';
import { HealthSeverity } from '../../types/health';
import { AISource } from '../../types/ai';

export interface HealthSnapshotCardData {
  id: 'CARDIO' | 'RESPIRATORY' | 'RECOVERY' | 'FITNESS' | 'COGNITIVE' | 'RADIATION';
  title: string;
  metricLabel: string;
  currentValue: string;
  baselineValue: string;
  deviationText: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'NORMAL' | 'MONITOR' | 'ATTENTION' | 'CRITICAL';
  icon: React.ReactNode;
}

interface OverviewDashboardProps {
  sol: number;
  lastUpdatedTime: string;
  overallStatusText: 'Stable' | 'Monitor' | 'Attention' | 'Critical';
  overallSeverity: HealthSeverity;
  statusExplanation: string;
  domainSummary: {
    cardiovascular: 'Normal' | 'Monitor' | 'Attention' | 'Critical';
    respiratory: 'Normal' | 'Monitor' | 'Attention' | 'Critical';
    recovery: 'Normal' | 'Monitor' | 'Attention' | 'Critical';
    cognitive: 'Normal' | 'Monitor' | 'Attention' | 'Critical';
  };
  whatChangedList: {
    name: string;
    deviation: string;
    direction: 'UP' | 'DOWN';
    currentVal: string;
    baselineVal: string;
    isAttention: boolean;
  }[];
  healthSnapshotCards: HealthSnapshotCardData[];
  astraObservation: string;
  activeAiSource: AISource;
  todayCheckInCompleted: boolean;
  todayExercisePercent: number;
  todaySleepRecorded: boolean;
  todayHydrationPercent: number;
  todayVitalsRecorded: boolean;
  onViewWhatChanged: () => void;
  onViewHealthCategory: (category: 'CARDIO' | 'RESPIRATORY' | 'RECOVERY' | 'FITNESS' | 'COGNITIVE' | 'RADIATION') => void;
  onAskAstra: (prompt?: string) => void;
  onOpenCheckIn: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  sol,
  lastUpdatedTime,
  overallStatusText,
  overallSeverity,
  statusExplanation,
  domainSummary,
  whatChangedList,
  healthSnapshotCards,
  astraObservation,
  activeAiSource,
  todayCheckInCompleted,
  todayExercisePercent,
  todaySleepRecorded,
  todayHydrationPercent,
  todayVitalsRecorded,
  onViewWhatChanged,
  onViewHealthCategory,
  onAskAstra,
  onOpenCheckIn,
}) => {
  // Status styling maps
  const statusColorMap = {
    Stable: {
      dot: 'bg-emerald-400',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      text: 'text-emerald-400',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      label: 'STABLE',
    },
    Monitor: {
      dot: 'bg-amber-400',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      text: 'text-amber-400',
      icon: <AlertCircle className="w-6 h-6 text-amber-400" />,
      label: 'MONITOR',
    },
    Attention: {
      dot: 'bg-amber-500',
      badge: 'bg-amber-950/90 text-amber-200 border-amber-600/70',
      text: 'text-amber-300',
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      label: 'ATTENTION',
    },
    Critical: {
      dot: 'bg-rose-500',
      badge: 'bg-rose-950/90 text-rose-200 border-rose-600/70',
      text: 'text-rose-400',
      icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
      label: 'CRITICAL',
    },
  }[overallStatusText] || {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    text: 'text-emerald-400',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    label: 'STABLE',
  };

  const getSubStatusColor = (val: 'Normal' | 'Monitor' | 'Attention' | 'Critical') => {
    switch (val) {
      case 'Normal':
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
      case 'Monitor':
        return 'text-amber-400 bg-amber-950/50 border-amber-800/60';
      case 'Attention':
        return 'text-amber-300 bg-amber-950/70 border-amber-700/70';
      case 'Critical':
        return 'text-rose-400 bg-rose-950/70 border-rose-700/70';
    }
  };

  const getCardStatusBadge = (status: 'NORMAL' | 'MONITOR' | 'ATTENTION' | 'CRITICAL') => {
    switch (status) {
      case 'NORMAL':
        return 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40';
      case 'MONITOR':
        return 'text-amber-400 border-amber-800/60 bg-amber-950/40';
      case 'ATTENTION':
        return 'text-amber-300 border-amber-700/70 bg-amber-950/60';
      case 'CRITICAL':
        return 'text-rose-400 border-rose-700/70 bg-rose-950/60';
    }
  };

  return (
    <div id="overview-dashboard-view" className="space-y-5 pb-10">
      
      {/* --------------------------------------------------------
          SECTION 1: MAIN HEALTH STATUS (ONE Large Status Card)
          -------------------------------------------------------- */}
      <div 
        id="main-health-status-card"
        className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left: Overall Condition */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              <span>HEALTH STATUS</span>
              <span className="text-slate-600">•</span>
              <span>SOL {sol}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full ${statusColorMap.dot} shadow-sm`} />
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-100">
                {statusColorMap.label}
              </h2>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${statusColorMap.badge}`}>
                {overallStatusText === 'Stable' ? 'All systems nominal' : 'Action suggested'}
              </span>
            </div>

            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              {statusExplanation || 'No significant deviation from your recent personal baseline.'}
            </p>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono pt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last updated: <strong className="text-slate-200">{lastUpdatedTime}</strong></span>
            </div>
          </div>

          {/* Right: Small 4-Domain Summary Grid (Cardio, Resp, Recovery, Cognitive) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4 min-w-[280px] lg:min-w-[320px]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5 pb-1 border-b border-slate-800">
              PHYSIOLOGICAL DOMAINS
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Cardiovascular
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getSubStatusColor(domainSummary.cardiovascular)}`}>
                  {domainSummary.cardiovascular}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" /> Respiratory
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getSubStatusColor(domainSummary.respiratory)}`}>
                  {domainSummary.respiratory}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-purple-400" /> Recovery
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getSubStatusColor(domainSummary.recovery)}`}>
                  {domainSummary.recovery}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-emerald-400" /> Cognitive
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getSubStatusColor(domainSummary.cognitive)}`}>
                  {domainSummary.cognitive}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --------------------------------------------------------
          SECTION 2: WHAT CHANGED? (Top 3-5 Significant Changes)
          -------------------------------------------------------- */}
      <div 
        id="what-changed-summary-section"
        className="rounded-2xl bg-slate-900 border border-cyan-800/30 p-5 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                WHAT CHANGED?
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Compared with your recent personal baseline
            </p>
          </div>

          <button
            id="view-full-analysis-btn"
            onClick={onViewWhatChanged}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <span>VIEW FULL ANALYSIS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-5 Key Changes Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {whatChangedList.slice(0, 4).map((item, idx) => {
            const isUp = item.direction === 'UP';
            const isWarn = item.isAttention;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border font-mono transition ${
                  isWarn
                    ? 'bg-amber-950/20 border-amber-600/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="text-xs text-slate-300 font-sans font-medium mb-1 truncate">
                  {item.name}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-100">
                    {item.currentVal}
                  </span>
                  <span className={`flex items-center text-xs font-bold ${
                    isWarn ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {item.deviation}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Baseline: <span className="text-slate-300">{item.baselineVal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------
          SECTION 3: HEALTH SNAPSHOT (Clean Grid of 6 Cards)
          -------------------------------------------------------- */}
      <div id="health-snapshot-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              HEALTH SNAPSHOT
            </h3>
            <p className="text-[11px] text-slate-400">
              6 core physiological domains tracked against 14-day rolling baseline
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {healthSnapshotCards.map((card) => (
            <div
              key={card.id}
              id={`snapshot-card-${card.id.toLowerCase()}`}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-xs"
            >
              {/* Card Header: Icon, Title, Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                      {card.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {card.metricLabel}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getCardStatusBadge(card.status)}`}>
                  {card.status}
                </span>
              </div>

              {/* Value & Baseline */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xl font-extrabold font-mono text-slate-100">
                    {card.currentValue}
                  </span>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Baseline: <span className="text-slate-300">{card.baselineValue}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-xs font-bold flex items-center justify-end ${
                    card.status === 'NORMAL' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {card.trend === 'UP' && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {card.trend === 'DOWN' && <ArrowDownRight className="w-3.5 h-3.5" />}
                    {card.trend === 'STABLE' && <Minus className="w-3 h-3 mr-0.5" />}
                    {card.deviationText}
                  </span>
                  <span className="text-[10px] text-slate-400">vs 14d base</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                <button
                  id={`snapshot-view-btn-${card.id.toLowerCase()}`}
                  onClick={() => onViewHealthCategory(card.id)}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  <span>VIEW</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------
          SECTION 4 & 5: ASTRA INSIGHT & TODAY'S MISSION HEALTH
          -------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* FOURTH SECTION: ASTRA INSIGHT (7 cols on lg) */}
        <div 
          id="astra-insight-card"
          className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between gap-4 shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                  ASTRA INSIGHT
                </h3>
              </div>

              {/* AI Source Indicator */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  {activeAiSource.includes('GEMINI') ? 'Gemini Cloud' : 'Local ASTRA AI'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed italic">
              "{astraObservation || 'Your physiological telemetry indicates elevated resting heart rate and decreased sleep duration compared with your 14-day baseline.'}"
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400">
              Autonomous medical flight surgeon decision support
            </span>
            <button
              id="ask-astra-insight-btn"
              onClick={() => onAskAstra('Explain my current health trends and recovery priorities')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>ASK ASTRA</span>
            </button>
          </div>
        </div>

        {/* FIFTH SECTION: TODAY'S MISSION HEALTH (5 cols on lg) */}
        <div 
          id="today-mission-health-card"
          className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between gap-3 shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                  TODAY'S MISSION HEALTH
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                Sol {sol}
              </span>
            </div>

            {/* Checklist with completion indicators */}
            <div className="space-y-2 font-mono text-xs">
              
              {/* 1. Daily Check-in */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Daily check-in</span>
                {todayCheckInCompleted ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                ) : (
                  <button
                    onClick={onOpenCheckIn}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                  >
                    Pending
                  </button>
                )}
              </div>

              {/* 2. Exercise Countermeasure */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Exercise protocol (ARED)</span>
                <span className={`font-bold ${todayExercisePercent >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {todayExercisePercent}%
                </span>
              </div>

              {/* 3. Sleep Log */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Sleep logged</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Logged
                </span>
              </div>

              {/* 4. Hydration */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Hydration target</span>
                <span className="font-bold text-emerald-400">
                  {todayHydrationPercent}%
                </span>
              </div>

              {/* 5. Vitals */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Health measurements</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Continuous
                </span>
              </div>

            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              id="today-open-checkin-btn"
              onClick={onOpenCheckIn}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>{todayCheckInCompleted ? 'Review Check-in' : 'Complete Daily Check-in'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
