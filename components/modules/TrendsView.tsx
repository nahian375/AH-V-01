/**
 * ASTRA Health - Trends View
 * Answers: "How is my health changing over time?"
 * Provides a primary interactive trend chart with metric selector and period filter (7, 14, 30 days).
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Moon, 
  Flame, 
  Smile, 
  Dumbbell, 
  Radiation,
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { HealthMeasurement, MetricBaseline } from '../../types/health';

type TrendPeriod = 7 | 14 | 30;
type TrendMetric = 'rhr' | 'hrv' | 'sleep' | 'stress' | 'fatigue' | 'exercise' | 'radiation';

interface TrendsViewProps {
  telemetryHistory: HealthMeasurement[];
  baselines: MetricBaseline[];
  sol: number;
  onAskAstra: (prompt: string) => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({
  telemetryHistory,
  baselines,
  sol,
  onAskAstra,
}) => {
  const [period, setPeriod] = useState<TrendPeriod>(14);
  const [selectedMetric, setSelectedMetric] = useState<TrendMetric>('rhr');
  const [hoveredPoint, setHoveredPoint] = useState<{ sol: number; value: number; baseline: number } | null>(null);

  // Slice history by selected period
  const slicedData = telemetryHistory.slice(-period);

  // Baselines
  const getBase = (key: string) => baselines.find(b => b.metricKey === key);
  const rhrBase = getBase('restingHeartRate')?.baseline14d || 70;
  const hrvBase = getBase('hrv')?.baseline14d || 62;
  const sleepBase = (getBase('sleepDurationMinutes')?.baseline14d || 432) / 60;
  const fatigueBase = getBase('fatigueScore')?.baseline14d || 28;
  const exerciseBase = getBase('exerciseDurationMinutes')?.baseline14d || 120;
  const stressBase = 35; // Nominally calibrated for cruise

  // Metric configuration
  const metricConfigs: Record<TrendMetric, {
    label: string;
    unit: string;
    icon: React.ReactNode;
    color: string;
    baseline: number;
    getValue: (m: HealthMeasurement) => number;
    formatValue: (v: number) => string;
    description: string;
  }> = {
    rhr: {
      label: 'Resting Heart Rate',
      unit: 'bpm',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      color: '#f43f5e',
      baseline: rhrBase,
      getValue: (m) => m.restingHeartRate,
      formatValue: (v) => `${Math.round(v)} bpm`,
      description: 'Resting pulse during non-exercise sleep recovery cycles. Sustained elevation above +5% indicates systemic fatigue or autonomic stress.',
    },
    hrv: {
      label: 'Heart Rate Variability (rMSSD)',
      unit: 'ms',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      color: '#06b6d4',
      baseline: hrvBase,
      getValue: (m) => m.hrv,
      formatValue: (v) => `${Math.round(v)} ms`,
      description: 'Root mean square of successive RR interval differences. Higher values reflect robust parasympathetic autonomic recovery.',
    },
    sleep: {
      label: 'Sleep Duration',
      unit: 'hrs',
      icon: <Moon className="w-4 h-4 text-purple-400" />,
      color: '#a855f7',
      baseline: Number(sleepBase.toFixed(1)),
      getValue: (m) => Number((m.sleepDurationMinutes / 60).toFixed(1)),
      formatValue: (v) => `${v.toFixed(1)} hrs`,
      description: 'Total restorative sleep recorded in microgravity crew sleep quarters. Target window is 7.0–8.0 hours per sol.',
    },
    stress: {
      label: 'Physiological Stress Index',
      unit: '/100',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      color: '#f59e0b',
      baseline: stressBase,
      getValue: (m) => Math.round(100 - m.recoveryScore * 0.7),
      formatValue: (v) => `${v}/100`,
      description: 'Composite estimation of sympathetic arousal and physiological demand derived from circadian HRV shifts.',
    },
    fatigue: {
      label: 'Fatigue Score',
      unit: '/100',
      icon: <Smile className="w-4 h-4 text-emerald-400" />,
      color: '#10b981',
      baseline: fatigueBase,
      getValue: (m) => m.fatigueScore,
      formatValue: (v) => `${v}/100`,
      description: 'Combined physiological sleep debt and self-reported subjective fatigue index from daily check-ins.',
    },
    exercise: {
      label: 'Daily Exercise Duration',
      unit: 'min',
      icon: <Dumbbell className="w-4 h-4 text-cyan-400" />,
      color: '#38bdf8',
      baseline: exerciseBase,
      getValue: (m) => m.exerciseDurationMinutes,
      formatValue: (v) => `${Math.round(v)} min`,
      description: 'ARED resistive strength training plus T2 treadmill countermeasure compliance in minutes.',
    },
    radiation: {
      label: 'Radiation Exposure',
      unit: 'mSv',
      icon: <Radiation className="w-4 h-4 text-amber-400" />,
      color: '#f59e0b',
      baseline: 0.45,
      getValue: (m) => Number((m.dailyRadiation_uSv / 1000).toFixed(2)),
      formatValue: (v) => `${v.toFixed(2)} mSv`,
      description: 'Personal daily dosimeter equivalent exposure. Nominal interplanetary cruise GCR baseline is 0.35–0.65 mSv/day.',
    },
  };

  const currentConfig = metricConfigs[selectedMetric];

  // Map historical values
  const series = slicedData.map(m => ({
    sol: m.sol,
    value: currentConfig.getValue(m),
    baseline: currentConfig.baseline,
  }));

  const currentValue = series[series.length - 1]?.value ?? currentConfig.baseline;
  const baselineValue = currentConfig.baseline;
  const changeDiff = currentValue - baselineValue;
  const changePercent = baselineValue ? Math.round((changeDiff / baselineValue) * 100) : 0;
  const trendDirection: 'UP' | 'DOWN' | 'STABLE' =
    changePercent > 3 ? 'UP' : changePercent < -3 ? 'DOWN' : 'STABLE';

  // SVG Chart Dimensions
  const chartW = 700;
  const chartH = 240;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;

  const rawValues = series.map(s => s.value);
  const minVal = Math.min(...rawValues, baselineValue * 0.85);
  const maxVal = Math.max(...rawValues, baselineValue * 1.15);
  const valRange = maxVal - minVal || 1;

  const points = series.map((s, idx) => {
    const x = padLeft + (idx / Math.max(series.length - 1, 1)) * plotW;
    const y = padTop + plotH - ((s.value - minVal) / valRange) * plotH;
    return { x, y, sol: s.sol, val: s.value };
  });

  const pathD = points.reduce((acc, p, idx) => (
    idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  ), '');

  const baselineY = padTop + plotH - ((baselineValue - minVal) / valRange) * plotH;

  return (
    <div id="trends-view-container" className="space-y-5 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight">
            TRENDS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            How is my health changing over time? Compare telemetry across mission sols
          </p>
        </div>

        {/* Period Selector: [ 7 DAYS ] [ 14 DAYS ] [ 30 DAYS ] */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <span className="text-[10px] font-mono text-slate-400 px-2 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cyan-400" />
            PERIOD:
          </span>
          {([7, 14, 30] as const).map((p) => (
            <button
              key={p}
              id={`trend-period-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                period === p
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {p} DAYS
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(Object.keys(metricConfigs) as TrendMetric[]).map((key) => {
          const cfg = metricConfigs[key];
          const isSelected = selectedMetric === key;
          return (
            <button
              key={key}
              id={`metric-select-${key}`}
              onClick={() => {
                setSelectedMetric(key);
                setHoveredPoint(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-800 text-cyan-300 border-cyan-500/60 shadow-xs'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cfg.icon}
              <span className="font-bold">{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats Row: CURRENT, BASELINE, CHANGE, TREND */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Current */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
            CURRENT (SOL {sol})
          </span>
          <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">
            {currentConfig.formatValue(currentValue)}
          </div>
        </div>

        {/* Baseline */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
            PERSONAL BASELINE
          </span>
          <div className="text-2xl font-extrabold font-mono text-slate-300 mt-1">
            {currentConfig.formatValue(baselineValue)}
          </div>
        </div>

        {/* Change */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
            CHANGE
          </span>
          <div className={`text-2xl font-extrabold font-mono mt-1 ${
            Math.abs(changePercent) > 10 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`}
          </div>
        </div>

        {/* Trend */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
            TREND DIRECTION
          </span>
          <div className="flex items-center gap-1.5 text-2xl font-extrabold font-mono text-slate-100 mt-1">
            {trendDirection === 'UP' && <ArrowUpRight className="w-6 h-6 text-amber-400" />}
            {trendDirection === 'DOWN' && <ArrowDownRight className="w-6 h-6 text-cyan-400" />}
            {trendDirection === 'STABLE' && <Minus className="w-6 h-6 text-emerald-400" />}
            <span className="text-base">{trendDirection}</span>
          </div>
        </div>

      </div>

      {/* Primary Chart Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
              <span>{currentConfig.label}</span>
              <span className="text-xs text-slate-400 font-normal">({period}-day timeline)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover over points to inspect Sol measurement vs 14-day rolling baseline
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: currentConfig.color }} />
              <span>Recorded Sol Value</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-b border-dashed border-slate-400" />
              <span>Personal Baseline</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart Canvas */}
        <div className="w-full overflow-x-auto">
          <svg
            className="w-full h-64 min-w-[550px] overflow-visible"
            viewBox={`0 0 ${chartW} ${chartH}`}
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padTop + plotH * ratio;
              const labelVal = maxVal - ratio * valRange;
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={chartW - padRight}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {labelVal.toFixed(selectedMetric === 'sleep' ? 1 : 0)}
                  </text>
                </g>
              );
            })}

            {/* Baseline dashed reference line */}
            <line
              x1={padLeft}
              y1={baselineY}
              x2={chartW - padRight}
              y2={baselineY}
              stroke="#64748b"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            <text
              x={chartW - padRight}
              y={baselineY - 5}
              fill="#94a3b8"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="end"
            >
              Base: {baselineValue}
            </text>

            {/* Area Fill */}
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${padTop + plotH} L ${points[0].x} ${padTop + plotH} Z`}
              fill={currentConfig.color}
              fillOpacity="0.12"
            />

            {/* Main Series Line */}
            <path
              d={pathD}
              fill="none"
              stroke={currentConfig.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points with hover handlers */}
            {points.map((p, idx) => {
              const isHovered = hoveredPoint?.sol === p.sol;
              return (
                <g key={idx} className="cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "6" : "3.5"}
                    fill={isHovered ? "#ffffff" : currentConfig.color}
                    stroke="#0f172a"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint({ sol: p.sol, value: p.val, baseline: baselineValue })}
                  />

                  {/* Sol Label on X-axis (every 2 or 3 sols) */}
                  {(idx % Math.ceil(series.length / 8) === 0 || idx === series.length - 1) && (
                    <text
                      x={p.x}
                      y={chartH - 8}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      S{p.sol}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <g>
                <rect
                  x={Math.min(padLeft + ((hoveredPoint.sol - series[0].sol) / Math.max(series.length - 1, 1)) * plotW - 60, chartW - 130)}
                  y={padTop + 10}
                  width="120"
                  height="46"
                  rx="6"
                  fill="#020617"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x={Math.min(padLeft + ((hoveredPoint.sol - series[0].sol) / Math.max(series.length - 1, 1)) * plotW, chartW - 70)}
                  y={padTop + 26}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  Sol {hoveredPoint.sol}: <tspan fill="#f1f5f9" fontWeight="bold">{currentConfig.formatValue(hoveredPoint.value)}</tspan>
                </text>
                <text
                  x={Math.min(padLeft + ((hoveredPoint.sol - series[0].sol) / Math.max(series.length - 1, 1)) * plotW, chartW - 70)}
                  y={padTop + 42}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  Baseline: {currentConfig.formatValue(hoveredPoint.baseline)}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Clinical Interpretation Footer */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-300 font-sans leading-relaxed">
            <span className="font-mono text-slate-400 font-bold uppercase text-[11px] mr-1.5">
              METRIC RATIONALE:
            </span>
            {currentConfig.description}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => onAskAstra(`Analyze my ${currentConfig.label} trend over the last ${period} sols`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-cyan-300 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ASK ASTRA TO EVALUATE THIS TREND</span>
          </button>
        </div>

      </div>

    </div>
  );
};
