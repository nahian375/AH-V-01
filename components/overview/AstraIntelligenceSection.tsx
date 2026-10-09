/**
 * ASTRA Health - Priority 4: ASTRA INTELLIGENCE
 * Split layout:
 * LEFT (8 Columns): HEALTH TREND (Single large interactive chart with [7D][14D][30D],
 *                    metric selector [HR, HRV, SLEEP, STRESS, FATIGUE, EXERCISE],
 *                    CURRENT, BASELINE, CHANGE, TREND, and baseline band)
 * RIGHT (4 Columns): ASTRA AI (Provider, Observation, DATA SUPPORTING THIS OBSERVATION,
 *                    [ ASK ASTRA ], [ VIEW DATA ])
 */

import React, { useState } from 'react';
import { HealthMeasurement, MetricBaseline } from '../../types/health';
import { AISource } from '../../types/ai';
import { 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  ArrowDown, 
  ArrowUp, 
  Minus,
  MessageSquare,
  BarChart2,
  Info
} from 'lucide-react';

interface AstraIntelligenceSectionProps {
  telemetryHistory: HealthMeasurement[];
  baselines: MetricBaseline[];
  activeAiSource: AISource;
  onAskAstra: (prompt?: string) => void;
  onViewData: () => void;
}

type MetricKey = 'HR' | 'HRV' | 'SLEEP' | 'SPO2' | 'FATIGUE' | 'EXERCISE';
type TrendPeriod = 7 | 14 | 30;

export const AstraIntelligenceSection: React.FC<AstraIntelligenceSectionProps> = ({
  telemetryHistory,
  baselines,
  activeAiSource,
  onAskAstra,
  onViewData,
}) => {
  const [period, setPeriod] = useState<TrendPeriod>(14);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('HRV');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const slicedData = telemetryHistory.slice(-period);

  // Metric definitions & getters
  const getBase = (k: string) => baselines.find(b => b.metricKey === k);

  const metricConfigs: Record<MetricKey, {
    label: string;
    unit: string;
    baselineValue: number;
    getValue: (m: HealthMeasurement) => number;
    color: string;
    strokeColor: string;
    fillColor: string;
  }> = {
    HR: {
      label: 'Heart Rate',
      unit: 'bpm',
      baselineValue: getBase('restingHeartRate')?.baseline14d || 70,
      getValue: (m) => m.restingHeartRate,
      color: 'text-rose-400',
      strokeColor: '#f43f5e',
      fillColor: 'rgba(244, 63, 94, 0.12)',
    },
    HRV: {
      label: 'HRV (RMSSD)',
      unit: 'ms',
      baselineValue: getBase('hrv')?.baseline14d || 62,
      getValue: (m) => m.hrv,
      color: 'text-cyan-400',
      strokeColor: '#06b6d4',
      fillColor: 'rgba(6, 182, 212, 0.12)',
    },
    SLEEP: {
      label: 'Sleep Duration',
      unit: 'hrs',
      baselineValue: Number(((getBase('sleepDurationMinutes')?.baseline14d || 432) / 60).toFixed(1)),
      getValue: (m) => Number((m.sleepDurationMinutes / 60).toFixed(1)),
      color: 'text-purple-400',
      strokeColor: '#a855f7',
      fillColor: 'rgba(168, 85, 247, 0.12)',
    },
    SPO2: {
      label: 'SpO2 Oxygen',
      unit: '%',
      baselineValue: getBase('spo2')?.baseline14d || 98,
      getValue: (m) => m.spo2,
      color: 'text-cyan-400',
      strokeColor: '#06b6d4',
      fillColor: 'rgba(6, 182, 212, 0.12)',
    },
    FATIGUE: {
      label: 'Fatigue Score',
      unit: '/100',
      baselineValue: getBase('fatigueScore')?.baseline14d || 26,
      getValue: (m) => m.fatigueScore,
      color: 'text-amber-400',
      strokeColor: '#fbbf24',
      fillColor: 'rgba(251, 191, 36, 0.12)',
    },
    EXERCISE: {
      label: 'Exercise Protocol',
      unit: 'min',
      baselineValue: getBase('exerciseDurationMinutes')?.baseline14d || 120,
      getValue: (m) => m.exerciseDurationMinutes,
      color: 'text-emerald-400',
      strokeColor: '#10b981',
      fillColor: 'rgba(16, 185, 129, 0.12)',
    },
  };

  const currentConfig = metricConfigs[selectedMetric];
  const lastItem = slicedData[slicedData.length - 1] || telemetryHistory[telemetryHistory.length - 1];
  const currentValue = lastItem ? currentConfig.getValue(lastItem) : currentConfig.baselineValue;
  const baselineValue = currentConfig.baselineValue;
  
  const diff = currentValue - baselineValue;
  const percentChange = baselineValue > 0 ? ((diff / baselineValue) * 100).toFixed(1) : '0';
  const isUp = diff > 0;
  const isDown = diff < 0;

  // Chart coordinate mapping
  const values = slicedData.map(m => currentConfig.getValue(m));
  const minVal = Math.min(...values, baselineValue * 0.85);
  const maxVal = Math.max(...values, baselineValue * 1.15);
  const range = (maxVal - minVal) || 1;

  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / Math.max(1, values.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
    return { x, y, val, sol: slicedData[idx]?.sol || (170 + idx) };
  });

  const pathD = points.length > 0 
    ? points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, '')
    : '';

  // Baseline line & band Y coordinates
  const baselineY = height - paddingY - ((baselineValue - minVal) / range) * (height - paddingY * 2);
  const baselineUpperY = height - paddingY - (((baselineValue * 1.05) - minVal) / range) * (height - paddingY * 2);
  const baselineLowerY = height - paddingY - (((baselineValue * 0.95) - minVal) / range) * (height - paddingY * 2);

  const isGemini = activeAiSource.includes('GEMINI');

  return (
    <section 
      id="section-astra-intelligence"
      aria-label="ASTRA Intelligence & Trends"
      className="space-y-3"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base sm:text-lg font-mono font-black tracking-wider text-slate-100 uppercase">
            ASTRA INTELLIGENCE
          </h3>
        </div>
        <span className="text-xs sm:text-sm font-mono text-slate-400">
          Continuous Physiological Telemetry & Autonomous Inference
        </span>
      </div>

      {/* 12-Column Grid: 8 Columns Trend Chart + 4 Columns AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT (8 COLUMNS): HEALTH TREND */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          
          {/* Top Bar: Metric Selector & Period Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
            {/* Metric Buttons: HR, HRV, SLEEP, SPO2, FATIGUE, EXERCISE - Space Avionics Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {(['HR', 'HRV', 'SLEEP', 'SPO2', 'FATIGUE', 'EXERCISE'] as MetricKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-black transition cursor-pointer shrink-0 tracking-wider ${
                    selectedMetric === key
                      ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-300'
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Period Filters: [ 7D ] [ 14D ] [ 30D ] */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto font-mono text-xs shadow-inner">
              {([7, 14, 30] as TrendPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer font-black ${
                    period === p
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-400/60 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}D
                </button>
              ))}
            </div>
          </div>

          {/* Metric Stats Summary Row: CURRENT, BASELINE, CHANGE, TREND */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 font-mono">
            <div>
              <div className="text-xs uppercase text-slate-400 font-black">CURRENT</div>
              <div className="text-base sm:text-lg font-black text-slate-100 mt-0.5">
                {currentValue} <span className="text-xs font-normal text-slate-400">{currentConfig.unit}</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-400 font-black">BASELINE</div>
              <div className="text-base sm:text-lg font-bold text-slate-300 mt-0.5">
                {baselineValue} <span className="text-xs font-normal text-slate-400">{currentConfig.unit}</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-400 font-black">CHANGE</div>
              <div className={`text-base sm:text-lg font-black flex items-center gap-1 mt-0.5 ${
                Math.abs(Number(percentChange)) > 10 ? 'text-amber-400' : 'text-slate-200'
              }`}>
                {isUp ? '+' : ''}{percentChange}%
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-400 font-black">TREND</div>
              <div className="text-base sm:text-lg font-black flex items-center gap-1 text-slate-200 mt-0.5">
                {isUp ? (
                  <span className="flex items-center text-amber-400"><ArrowUp className="w-4 h-4" /> UP</span>
                ) : isDown ? (
                  <span className="flex items-center text-cyan-400"><ArrowDown className="w-4 h-4" /> DOWN</span>
                ) : (
                  <span className="flex items-center text-emerald-400"><Minus className="w-4 h-4" /> STABLE</span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Trend Chart with Personal Baseline Band */}
          <div className="relative w-full h-[190px] bg-slate-950/70 rounded-xl border border-slate-800/80 p-2 select-none overflow-hidden">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`grad-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentConfig.strokeColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={currentConfig.strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Personal Baseline Band (Confidence corridor) */}
              <rect
                x={paddingX}
                y={Math.min(baselineUpperY, baselineLowerY)}
                width={width - paddingX * 2}
                height={Math.max(8, Math.abs(baselineLowerY - baselineUpperY))}
                fill="rgba(148, 163, 184, 0.08)"
                stroke="rgba(148, 163, 184, 0.25)"
                strokeDasharray="4 4"
              />

              {/* Baseline Reference Line */}
              <line
                x1={paddingX}
                y1={baselineY}
                x2={width - paddingX}
                y2={baselineY}
                stroke="rgba(148, 163, 184, 0.5)"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />

              {/* Area under curve */}
              {points.length > 1 && (
                <path
                  d={`${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`}
                  fill={`url(#grad-${selectedMetric})`}
                />
              )}

              {/* Main Metric Telemetry Line */}
              <path
                d={pathD}
                fill="none"
                stroke={currentConfig.strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((pt, idx) => (
                <g key={idx} className="cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6 : 3.5}
                    fill={hoveredIndex === idx ? '#fff' : currentConfig.strokeColor}
                    stroke="#0b1120"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Hover tooltip */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <div 
                className="absolute z-10 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/50 text-slate-100 text-[11px] font-mono shadow-xl pointer-events-none"
                style={{
                  left: `${(points[hoveredIndex].x / width) * 100}%`,
                  top: '15px',
                  transform: 'translateX(-50%)',
                }}
              >
                <div>SOL {points[hoveredIndex].sol}: <strong className="text-cyan-400">{points[hoveredIndex].val} {currentConfig.unit}</strong></div>
                <div className="text-[10px] text-slate-400">Baseline: {baselineValue} {currentConfig.unit}</div>
              </div>
            )}

            <div className="absolute bottom-1 right-3 text-[10px] font-mono text-slate-500">
              Corridor: Personal 14-Day Baseline
            </div>
          </div>

        </div>

        {/* RIGHT (4 COLUMNS): ASTRA AI */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          
          <div className="space-y-4">
            {/* Header with Provider */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                {isGemini ? (
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Cpu className="w-4 h-4 text-purple-400" />
                )}
                <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                  ASTRA AI
                </span>
              </div>

              {/* Provider Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${isGemini ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-purple-400'}`} />
                <span className={isGemini ? 'text-cyan-300 font-bold' : 'text-purple-300 font-bold'}>
                  {isGemini ? 'GEMINI CLOUD' : 'LOCAL ASTRA AI'}
                </span>
              </div>
            </div>

            {/* AI Observation Text */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-xs font-mono font-black uppercase tracking-wider text-cyan-400 mb-1.5">
                AUTONOMOUS OBSERVATION
              </div>
              <p className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed">
                "Your sleep duration has decreased while HRV has also moved below your recent baseline."
              </p>
            </div>

            {/* DATA SUPPORTING THIS OBSERVATION */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-black uppercase tracking-wider text-slate-400">
                DATA SUPPORTING THIS OBSERVATION
              </div>
              
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono">
                  <div className="text-xs text-slate-400 font-bold">Sleep</div>
                  <div className="text-sm font-black text-amber-400 flex items-center justify-center mt-1">
                    <ArrowDown className="w-3.5 h-3.5" /> 14%
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono">
                  <div className="text-xs text-slate-400 font-bold">HRV</div>
                  <div className="text-sm font-black text-amber-400 flex items-center justify-center mt-1">
                    <ArrowDown className="w-3.5 h-3.5" /> 18%
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono">
                  <div className="text-xs text-slate-400 font-bold">Fatigue</div>
                  <div className="text-sm font-black text-amber-400 flex items-center justify-center mt-1">
                    <ArrowUp className="w-3.5 h-3.5" /> 12%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: [ ASK ASTRA ] [ VIEW DATA ] - Space Command Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-800/80 mt-4">
            <button
              onClick={() => onAskAstra('What physiological factors are contributing to my recent baseline divergence?')}
              className="space-cmd-btn-primary py-2.5 px-3 rounded-xl text-xs sm:text-sm font-mono font-black tracking-wider cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>ASK ASTRA</span>
            </button>

            <button
              onClick={onViewData}
              className="space-cmd-btn-secondary py-2.5 px-3 rounded-xl text-xs sm:text-sm font-mono font-black tracking-wider cursor-pointer"
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>VIEW DATA</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
