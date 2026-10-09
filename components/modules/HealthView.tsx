/**
 * ASTRA Health - Dedicated Health Page
 * Displays physiological telemetry organized into 6 tabs:
 * [ ALL ] [ CARDIO ] [ RESPIRATORY ] [ RECOVERY ] [ FITNESS ] [ COGNITIVE ] [ RADIATION ]
 * 
 * Each metric shows:
 * - Current value & unit
 * - Personal baseline range
 * - Trend indicator & deviation %
 * - Clean 7-day trend chart with baseline reference line
 * - Status (NORMAL / MONITOR / ATTENTION / CRITICAL)
 * - Clear clinical explanation ("Why: ...")
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Wind, 
  Moon, 
  Dumbbell, 
  Brain, 
  Radiation, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Play,
  RotateCcw
} from 'lucide-react';
import { HealthMeasurement, MetricBaseline, HealthSeverity } from '../../types/health';
import { NasaRadiationContext, NasaSpaceWeatherEvent } from '../../types/nasa';
import { RadiationView } from './RadiationView';

export type HealthTabType = 'ALL' | 'PHYSICAL' | 'MENTAL' | 'CARDIO' | 'RESPIRATORY' | 'RECOVERY' | 'FITNESS' | 'COGNITIVE' | 'RADIATION';

interface HealthViewProps {
  currentHealth: HealthMeasurement;
  baselines: MetricBaseline[];
  telemetryHistory: HealthMeasurement[];
  sol: number;
  initialTab?: HealthTabType;
  nasaRadiation?: NasaRadiationContext | null;
  nasaSpaceWeather?: NasaSpaceWeatherEvent[];
  onAskAstra: (prompt: string) => void;
  onRunCognitiveTest?: () => void;
}


interface MetricDisplayItem {
  id: string;
  category: 'CARDIO' | 'RESPIRATORY' | 'RECOVERY' | 'FITNESS' | 'COGNITIVE' | 'RADIATION';
  categoryLabel: string;
  name: string;
  currentValue: string;
  unit: string;
  baselineRange: string;
  deviationPercent: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'NORMAL' | 'MONITOR' | 'ATTENTION' | 'CRITICAL';
  whyExplanation: string;
  history7d: { sol: number; value: number }[];
  baselineAvg: number;
  icon: React.ReactNode;
}

export const HealthView: React.FC<HealthViewProps> = ({
  currentHealth,
  baselines,
  telemetryHistory,
  sol,
  initialTab = 'ALL',
  nasaRadiation,
  nasaSpaceWeather,
  onAskAstra,
  onRunCognitiveTest,
}) => {

  const [activeTab, setActiveTab] = useState<HealthTabType>(initialTab);

  // Extract last 7 sols for 7-day trend charts
  const last7Sols = telemetryHistory.slice(-7);

  // Baselines helpers
  const getBase = (key: string) => baselines.find(b => b.metricKey === key);

  const rhrBase = getBase('restingHeartRate');
  const hrvBase = getBase('hrv');
  const spo2Base = getBase('spo2');
  const respBase = getBase('respiratoryRate');
  const sleepBase = getBase('sleepDurationMinutes');
  const recoveryBase = getBase('recoveryScore');
  const exerciseBase = getBase('exerciseDurationMinutes');
  const fatigueBase = getBase('fatigueScore');
  const radBase = getBase('dailyRadiation_uSv');

  // Build the list of comprehensive metric cards
  const metrics: MetricDisplayItem[] = [
    // 1. Cardiovascular
    {
      id: 'resting-heart-rate',
      category: 'CARDIO',
      categoryLabel: 'CARDIOVASCULAR',
      name: 'Resting Heart Rate',
      currentValue: `${currentHealth.restingHeartRate}`,
      unit: 'bpm',
      baselineRange: `${Math.round((rhrBase?.baseline14d || 70) * 0.95)}–${Math.round((rhrBase?.baseline14d || 70) * 1.05)} bpm`,
      deviationPercent: rhrBase?.deviationPercent || 0,
      trend: (rhrBase?.deviationPercent || 0) > 3 ? 'UP' : (rhrBase?.deviationPercent || 0) < -3 ? 'DOWN' : 'STABLE',
      status: (rhrBase?.deviationPercent || 0) > 8 ? 'ATTENTION' : (rhrBase?.deviationPercent || 0) > 4 ? 'MONITOR' : 'NORMAL',
      whyExplanation: (rhrBase?.deviationPercent || 0) > 4
        ? 'Current value is elevated above your recent 14-day rolling baseline.'
        : 'Resting pulse is within your nominal baseline distribution.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: t.restingHeartRate })),
      baselineAvg: rhrBase?.baseline14d || 70,
      icon: <Heart className="w-4 h-4 text-rose-400" />,
    },
    {
      id: 'hrv-rmssd',
      category: 'CARDIO',
      categoryLabel: 'CARDIOVASCULAR',
      name: 'Heart Rate Variability (rMSSD)',
      currentValue: `${currentHealth.hrv}`,
      unit: 'ms',
      baselineRange: `${Math.round((hrvBase?.baseline14d || 62) * 0.9)}–${Math.round((hrvBase?.baseline14d || 62) * 1.1)} ms`,
      deviationPercent: hrvBase?.deviationPercent || 0,
      trend: (hrvBase?.deviationPercent || 0) < -5 ? 'DOWN' : (hrvBase?.deviationPercent || 0) > 5 ? 'UP' : 'STABLE',
      status: (hrvBase?.deviationPercent || 0) < -20 ? 'ATTENTION' : (hrvBase?.deviationPercent || 0) < -10 ? 'MONITOR' : 'NORMAL',
      whyExplanation: (hrvBase?.deviationPercent || 0) < -10
        ? 'Autonomic parasympathetic recovery is suppressed below your 14-day average.'
        : 'Autonomic nervous system balance is within expected baseline bounds.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: t.hrv })),
      baselineAvg: hrvBase?.baseline14d || 62,
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'blood-pressure',
      category: 'CARDIO',
      categoryLabel: 'CARDIOVASCULAR',
      name: 'Blood Pressure',
      currentValue: `${currentHealth.bloodPressureSystolic}/${currentHealth.bloodPressureDiastolic}`,
      unit: 'mmHg',
      baselineRange: '115/75–122/80 mmHg',
      deviationPercent: 2,
      trend: 'STABLE',
      status: 'NORMAL',
      whyExplanation: 'Vascular perfusion pressures remain stable within standard aerospace limits.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: t.bloodPressureSystolic })),
      baselineAvg: 118,
      icon: <Heart className="w-4 h-4 text-rose-400" />,
    },

    // 2. Respiratory
    {
      id: 'blood-oxygen',
      category: 'RESPIRATORY',
      categoryLabel: 'RESPIRATORY',
      name: 'Blood Oxygen (SpO2)',
      currentValue: `${currentHealth.spo2.toFixed(1)}`,
      unit: '%',
      baselineRange: '97.0–99.5 %',
      deviationPercent: spo2Base?.deviationPercent || 0,
      trend: (spo2Base?.deviationPercent || 0) < -1 ? 'DOWN' : 'STABLE',
      status: currentHealth.spo2 < 92 ? 'CRITICAL' : currentHealth.spo2 < 95 ? 'ATTENTION' : 'NORMAL',
      whyExplanation: currentHealth.spo2 < 95
        ? 'SpO2 indicates mild hypoxemia relative to environmental cabin pO2.'
        : 'Arterial blood oxygen saturation is optimal for current cabin pressure.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: t.spo2 })),
      baselineAvg: spo2Base?.baseline14d || 98.4,
      icon: <Wind className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'respiratory-rate',
      category: 'RESPIRATORY',
      categoryLabel: 'RESPIRATORY',
      name: 'Respiratory Rate',
      currentValue: `${currentHealth.respiratoryRate}`,
      unit: 'br/min',
      baselineRange: '12–16 br/min',
      deviationPercent: respBase?.deviationPercent || 0,
      trend: (respBase?.deviationPercent || 0) > 8 ? 'UP' : 'STABLE',
      status: 'NORMAL',
      whyExplanation: 'Ventilatory frequency matches resting metabolic requirements.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: t.respiratoryRate })),
      baselineAvg: respBase?.baseline14d || 14,
      icon: <Wind className="w-4 h-4 text-cyan-400" />,
    },

    // 3. Recovery & Sleep
    {
      id: 'sleep-duration',
      category: 'RECOVERY',
      categoryLabel: 'RECOVERY & SLEEP',
      name: 'Sleep Duration',
      currentValue: `${(currentHealth.sleepDurationMinutes / 60).toFixed(1)}`,
      unit: 'hrs',
      baselineRange: `${((sleepBase?.baseline14d || 432) / 60 * 0.9).toFixed(1)}–${((sleepBase?.baseline14d || 432) / 60 * 1.1).toFixed(1)} hrs`,
      deviationPercent: sleepBase?.deviationPercent || 0,
      trend: (sleepBase?.deviationPercent || 0) < -8 ? 'DOWN' : (sleepBase?.deviationPercent || 0) > 8 ? 'UP' : 'STABLE',
      status: (sleepBase?.deviationPercent || 0) < -15 ? 'ATTENTION' : (sleepBase?.deviationPercent || 0) < -8 ? 'MONITOR' : 'NORMAL',
      whyExplanation: (sleepBase?.deviationPercent || 0) < -8
        ? 'Sleep duration has compressed over consecutive sols, impacting autonomic restoration.'
        : 'Total sleep duration is consistent with your 14-day sleep window.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: Number((t.sleepDurationMinutes / 60).toFixed(1)) })),
      baselineAvg: Number(((sleepBase?.baseline14d || 432) / 60).toFixed(1)),
      icon: <Moon className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'recovery-score',
      category: 'RECOVERY',
      categoryLabel: 'RECOVERY & SLEEP',
      name: 'Recovery Index',
      currentValue: `${currentHealth.recoveryScore}`,
      unit: '/100',
      baselineRange: `${Math.round((recoveryBase?.baseline14d || 82) * 0.9)}–${Math.round((recoveryBase?.baseline14d || 82) * 1.05)}`,
      deviationPercent: recoveryBase?.deviationPercent || 0,
      trend: (recoveryBase?.deviationPercent || 0) < -8 ? 'DOWN' : 'STABLE',
      status: (recoveryBase?.deviationPercent || 0) < -18 ? 'ATTENTION' : (recoveryBase?.deviationPercent || 0) < -10 ? 'MONITOR' : 'NORMAL',
      whyExplanation: (recoveryBase?.deviationPercent || 0) < -10
        ? 'Composite score of sleep architecture, HRV, and circadian consistency is down.'
        : 'Physiological restoration capacity is adequate for scheduled mission operations.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: t.recoveryScore })),
      baselineAvg: recoveryBase?.baseline14d || 82,
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
    },

    // 4. Fitness
    {
      id: 'exercise-protocol',
      category: 'FITNESS',
      categoryLabel: 'FITNESS & COUNTERMEASURES',
      name: 'ARED Exercise Duration',
      currentValue: `${currentHealth.exerciseDurationMinutes}`,
      unit: 'min',
      baselineRange: '110–130 min',
      deviationPercent: exerciseBase?.deviationPercent || 0,
      trend: (exerciseBase?.deviationPercent || 0) < -10 ? 'DOWN' : 'STABLE',
      status: (exerciseBase?.deviationPercent || 0) < -15 ? 'MONITOR' : 'NORMAL',
      whyExplanation: (exerciseBase?.deviationPercent || 0) < -10
        ? 'Daily musculoskeletal countermeasure volume is below prescribed target.'
        : 'Cardiovascular and resistive countermeasure volume is compliant with protocol.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: t.exerciseDurationMinutes })),
      baselineAvg: exerciseBase?.baseline14d || 120,
      icon: <Dumbbell className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'resistance-load',
      category: 'FITNESS',
      categoryLabel: 'FITNESS & COUNTERMEASURES',
      name: 'Resistive Total Load (ARED)',
      currentValue: `${(currentHealth.resistanceLoadKg / 1000).toFixed(1)}k`,
      unit: 'kg',
      baselineRange: '1.3k–1.5k kg',
      deviationPercent: -4,
      trend: 'STABLE',
      status: 'NORMAL',
      whyExplanation: 'Mechanical bone loading stimulus is within nominal range for microgravity retention.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: t.resistanceLoadKg })),
      baselineAvg: 1400,
      icon: <Dumbbell className="w-4 h-4 text-cyan-400" />,
    },

    // 5. Cognitive
    {
      id: 'cognitive-reaction',
      category: 'COGNITIVE',
      categoryLabel: 'COGNITIVE & PSYCHOMOTOR',
      name: 'PVT Reaction Latency',
      currentValue: '248',
      unit: 'ms',
      baselineRange: '235–255 ms',
      deviationPercent: 4,
      trend: 'UP',
      status: 'NORMAL',
      whyExplanation: 'Psychomotor vigilance test latency remains near personal median.',
      history7d: [
        { sol: sol - 6, value: 238 },
        { sol: sol - 5, value: 242 },
        { sol: sol - 4, value: 240 },
        { sol: sol - 3, value: 245 },
        { sol: sol - 2, value: 249 },
        { sol: sol - 1, value: 251 },
        { sol: sol, value: 248 },
      ],
      baselineAvg: 240,
      icon: <Brain className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'cognitive-accuracy',
      category: 'COGNITIVE',
      categoryLabel: 'COGNITIVE & PSYCHOMOTOR',
      name: 'Spatial Working Memory',
      currentValue: '94.2',
      unit: '%',
      baselineRange: '92.0–96.0 %',
      deviationPercent: 1,
      trend: 'STABLE',
      status: 'NORMAL',
      whyExplanation: 'Working memory recall accuracy is intact under current operational task load.',
      history7d: [
        { sol: sol - 6, value: 95 },
        { sol: sol - 5, value: 94 },
        { sol: sol - 4, value: 94 },
        { sol: sol - 3, value: 93 },
        { sol: sol - 2, value: 92 },
        { sol: sol - 1, value: 93 },
        { sol: sol, value: 94.2 },
      ],
      baselineAvg: 94,
      icon: <Brain className="w-4 h-4 text-emerald-400" />,
    },

    // 6. Radiation
    {
      id: 'daily-radiation',
      category: 'RADIATION',
      categoryLabel: 'RADIATION DOSIMETRY',
      name: 'Daily Radiation Dose',
      currentValue: `${currentHealth.dailyRadiation_uSv}`,
      unit: 'µSv',
      baselineRange: '400–450 µSv',
      deviationPercent: radBase?.deviationPercent || 2,
      trend: 'STABLE',
      status: 'NORMAL',
      whyExplanation: 'Galactic Cosmic Ray ambient flux is stable; no solar particle event detected.',
      history7d: last7Sols.map(t => ({ sol: t.sol, value: t.dailyRadiation_uSv })),
      baselineAvg: radBase?.baseline14d || 420,
      icon: <Radiation className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'cumulative-radiation',
      category: 'RADIATION',
      categoryLabel: 'RADIATION DOSIMETRY',
      name: 'Cumulative Mission Dose',
      currentValue: `${currentHealth.cumulativeRadiation_mSv.toFixed(1)}`,
      unit: 'mSv',
      baselineRange: '< 250 mSv limit',
      deviationPercent: 0,
      trend: 'UP',
      status: 'NORMAL',
      whyExplanation: 'Career astronaut radiation exposure remains well beneath NASA 30-day and total mission career thresholds.',
      history7d: last7Sols.map((t, idx) => ({ sol: t.sol, value: currentHealth.cumulativeRadiation_mSv - (6 - idx) * 0.42 })),
      baselineAvg: 88,
      icon: <Radiation className="w-4 h-4 text-amber-400" />,
    },
  ];

  // Filter metrics according to active tab
  const filteredMetrics = metrics.filter(m => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PHYSICAL') {
      return m.category === 'CARDIO' || m.category === 'RESPIRATORY' || m.category === 'FITNESS' || m.category === 'RADIATION';
    }
    if (activeTab === 'MENTAL') {
      return m.category === 'COGNITIVE' || m.category === 'RECOVERY';
    }
    return m.category === activeTab;
  });

  const getStatusBadge = (status: 'NORMAL' | 'MONITOR' | 'ATTENTION' | 'CRITICAL') => {
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

  // Render clean 7-day SVG chart with baseline dashed line
  const render7DayChart = (data: { sol: number; value: number }[], baseline: number, status: string) => {
    if (!data || data.length < 2) return null;

    const values = data.map(d => d.value);
    const minVal = Math.min(...values, baseline * 0.95);
    const maxVal = Math.max(...values, baseline * 1.05);
    const range = maxVal - minVal || 1;

    const width = 260;
    const height = 54;
    const padTop = 6;
    const padBottom = 16;
    const usableH = height - padTop - padBottom;

    // Line points
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 24) + 12;
      const y = height - padBottom - ((d.value - minVal) / range) * usableH;
      return { x, y, sol: d.sol, val: d.value };
    });

    const pathD = points.reduce((acc, p, idx) => (
      idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
    ), '');

    // Baseline Y
    const baselineY = height - padBottom - ((baseline - minVal) / range) * usableH;

    const strokeColor =
      status === 'CRITICAL'
        ? '#f43f5e'
        : status === 'ATTENTION' || status === 'MONITOR'
        ? '#f59e0b'
        : '#06b6d4';

    return (
      <div className="w-full bg-slate-950/80 rounded-lg p-2 border border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
          <span>7-DAY TREND</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-0.5 border-b border-dashed border-slate-400" />
            <span>Baseline ({baseline})</span>
          </span>
        </div>

        <svg className="w-full h-14 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          {/* Baseline reference line */}
          <line
            x1="10"
            y1={baselineY}
            x2={width - 10}
            y2={baselineY}
            stroke="#64748b"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Area under curve */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`}
            fill={strokeColor}
            fillOpacity="0.1"
          />

          {/* Value line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={idx === points.length - 1 ? "3" : "2"}
              fill={idx === points.length - 1 ? "#ffffff" : strokeColor}
              stroke={strokeColor}
              strokeWidth="1"
            />
          ))}

          {/* Sol label on first and last */}
          <text x={points[0].x} y={height - 2} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
            S{points[0].sol}
          </text>
          <text x={points[points.length - 1].x} y={height - 2} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
            S{points[points.length - 1].sol}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div id="health-page-view" className="space-y-5 pb-10">
      
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight">
            HEALTH
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Current physiological measurements compared against 14-day rolling baselines
          </p>
        </div>

        <button
          onClick={() => onAskAstra('Summarize my current physiological status and any baseline deviations')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>ASK ASTRA ABOUT VITALS</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800 text-xs font-mono">
        {(
          [
            { id: 'ALL', label: 'ALL' },
            { id: 'PHYSICAL', label: 'PHYSICAL' },
            { id: 'MENTAL', label: 'MENTAL' },
            { id: 'CARDIO', label: 'CARDIO' },
            { id: 'RESPIRATORY', label: 'RESPIRATORY' },
            { id: 'RECOVERY', label: 'RECOVERY' },
            { id: 'FITNESS', label: 'FITNESS' },
            { id: 'COGNITIVE', label: 'COGNITIVE' },
            { id: 'RADIATION', label: 'RADIATION' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            id={`health-tab-${tab.id.toLowerCase()}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-t-xl transition cursor-pointer font-bold whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {activeTab === 'RADIATION' ? (
        <RadiationView
          currentHealth={currentHealth}
          baselines={baselines}
          sol={sol}
          nasaRadiation={nasaRadiation}
          nasaSpaceWeather={nasaSpaceWeather}
          onAskAstra={onAskAstra}
        />
      ) : (
        /* Metrics Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMetrics.map((m) => (
            <div
              key={m.id}
              id={`metric-item-${m.id}`}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3.5 shadow-xs hover:border-slate-700 transition"
            >
              {/* Top: Category, Name, Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                    {m.icon} {m.categoryLabel}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(m.status)}`}>
                    {m.status}
                  </span>
                </div>

                <h4 className="text-sm font-mono font-bold text-slate-100">
                  {m.name}
                </h4>
              </div>

              {/* Middle: Current value, Baseline, Deviation */}
              <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/60">
                <div>
                  <span className="text-2xl font-extrabold font-mono text-slate-100">
                    {m.currentValue}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-1">
                    {m.unit}
                  </span>

                  <div className="text-xs font-mono text-slate-400 mt-1">
                    Personal baseline: <span className="text-slate-300 font-semibold">{m.baselineRange}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-xs font-bold flex items-center justify-end ${
                    m.status === 'NORMAL' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {m.trend === 'UP' && <ArrowUpRight className="w-4 h-4" />}
                    {m.trend === 'DOWN' && <ArrowDownRight className="w-4 h-4" />}
                    {m.trend === 'STABLE' && <Minus className="w-3.5 h-3.5 mr-0.5" />}
                    {m.deviationPercent > 0 ? `+${m.deviationPercent}%` : `${m.deviationPercent}%`}
                  </span>
                  <span className="text-[10px] text-slate-400">vs baseline</span>
                </div>
              </div>

              {/* 7-Day Trend Chart */}
              {render7DayChart(m.history7d, m.baselineAvg, m.status)}

              {/* Explanation & Rationale */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-sans text-slate-300 leading-snug">
                  <strong className="font-mono text-slate-400 font-bold uppercase text-[10px] mr-1">WHY:</strong>
                  {m.whyExplanation}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}


    </div>
  );
};
