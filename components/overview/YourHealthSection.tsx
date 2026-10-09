/**
 * ASTRA Health - Priority 1 & 2: YOUR HEALTH & HEALTH DOMAIN MATRIX
 * 
 * Aerospace-grade monitoring table displaying personal physiological telemetry.
 * 
 * Layout per Sections 7, 8, 9:
 * 
 * Header:
 * YOUR CURRENT HEALTH
 * STATUS: ● STABLE / MONITOR / ATTENTION / CRITICAL
 * MISSION HEALTH INDEX: 86 / 100
 * Compared with personal baseline: NORMAL / DEVIATED
 * Last updated: 09:41
 * BASELINE: [ 7 DAYS ] [ 14 DAYS ] [ 30 DAYS ]
 * 
 * Health Domain Matrix Table:
 * DOMAIN | CURRENT | BASELINE | CHANGE | TREND | SPARKLINE | STATUS
 * Rows:
 * - CARDIOVASCULAR | 78 bpm | 68–74 bpm | +8% | ↑ | [sparkline] | MONITOR
 * - RESPIRATORY | 98% | 95–100% | 0% | → | [sparkline] | NORMAL
 * - SLEEP | 6h 18m | 7h 12m | -13% | ↓ | [sparkline] | MONITOR
 * - HRV | 44 ms | 60–70 ms | -18% | ↓ | [sparkline] | ATTENTION
 * - FITNESS | 72% | 65–80% | +3% | → | [sparkline] | NORMAL
 * - RADIATION | 428 µSv | Mission Range | +4% | ↑ | [sparkline] | NORMAL
 * 
 * Each row is clickable to open the relevant detailed module.
 */

import React, { useState, useMemo } from 'react';
import { 
  HealthMeasurement, 
  MetricBaseline, 
  HealthSeverity, 
  HealthStatusText 
} from '../../types/health';
import { 
  Heart, 
  Wind, 
  Moon, 
  Dumbbell, 
  Activity, 
  Radiation, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  ChevronRight,
  Sliders
} from 'lucide-react';
import { HealthTabType } from '../modules/HealthView';

interface YourHealthSectionProps {
  current: HealthMeasurement;
  baselines: MetricBaseline[];
  telemetry?: HealthMeasurement[];
  severity: HealthSeverity;
  statusText: HealthStatusText;
  lastUpdated?: string;
  onNavigateToDomain: (domain: HealthTabType) => void;
}

type BaselineWindow = 7 | 14 | 30;

export const YourHealthSection: React.FC<YourHealthSectionProps> = ({
  current,
  baselines,
  telemetry = [],
  severity,
  statusText,
  lastUpdated = '09:41',
  onNavigateToDomain,
}) => {
  const [baselineWindow, setBaselineWindow] = useState<BaselineWindow>(14);

  // Status mapping
  const statusDisplay = {
    GREEN: {
      label: 'STABLE',
      colorText: 'text-emerald-400',
      dotBg: 'bg-emerald-400',
      badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
      baselineComparison: 'NORMAL',
      subtext: 'All physiological telemetry within personal baseline tolerance.',
    },
    BLUE: {
      label: 'REMINDER',
      colorText: 'text-cyan-400',
      dotBg: 'bg-cyan-400',
      badgeBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80',
      baselineComparison: 'SCHEDULED ACTION',
      subtext: 'Daily operational measurement or check-in recommended.',
    },
    YELLOW: {
      label: 'MONITOR',
      colorText: 'text-amber-400',
      dotBg: 'bg-amber-400',
      badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
      baselineComparison: 'MILD VARIANCE',
      subtext: 'Single metric variance detected. Continued autonomous tracking active.',
    },
    ORANGE: {
      label: 'ATTENTION',
      colorText: 'text-amber-400',
      dotBg: 'bg-amber-500',
      badgeBg: 'bg-amber-950/70 text-amber-200 border-amber-700/80',
      baselineComparison: 'DIVERGENT',
      subtext: 'Multi-metric recovery pattern changed compared to personal baseline.',
    },
    RED: {
      label: 'CRITICAL',
      colorText: 'text-rose-400',
      dotBg: 'bg-rose-500',
      badgeBg: 'bg-rose-950/80 text-rose-200 border-rose-700/80',
      baselineComparison: 'EXCEEDED SAFETY BOUNDS',
      subtext: 'Critical physiological threshold alert requires immediate operational review.',
    },
  }[severity] || {
    label: 'STABLE',
    colorText: 'text-emerald-400',
    dotBg: 'bg-emerald-400',
    badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
    baselineComparison: 'NORMAL',
    subtext: 'All physiological telemetry within personal baseline tolerance.',
  };

  // Calculate Mission Health Index (0-100)
  const cardioScore = Math.max(0, 100 - Math.abs((current.restingHeartRate || 68) - 65) * 1.5);
  const sleepHours = (current.sleepDurationMinutes || 420) / 60;
  const sleepScore = Math.min(100, (sleepHours / 8) * 100);
  const compositeIndex = Math.round(
    (cardioScore * 0.3) + 
    ((current.recoveryScore || 72) * 0.3) + 
    (sleepScore * 0.25) + 
    (82 * 0.15)
  );

  // Baseline getter helper
  const getBaselineForMetric = (key: string) => {
    return baselines.find(b => b.metricKey === key);
  };

  // Sliced telemetry for sparklines
  const recentTelemetry = useMemo(() => {
    if (!telemetry || telemetry.length === 0) return [];
    const sorted = [...telemetry].sort((a, b) => a.sol - b.sol);
    return sorted.slice(-baselineWindow);
  }, [telemetry, baselineWindow]);

  // Sparkline generator helper
  const renderSparkline = (dataPoints: number[], color: string) => {
    if (dataPoints.length < 2) return <div className="w-16 h-4" />;
    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = max - min || 1;
    const width = 64;
    const height = 18;
    const pts = dataPoints.map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * width;
      const y = height - 2 - ((val - min) / range) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts}
        />
      </svg>
    );
  };

  // Matrix Row Specifications per Section 8
  const rhrBase = getBaselineForMetric('restingHeartRate');
  const hrvBase = getBaselineForMetric('hrv');
  const sleepBase = getBaselineForMetric('sleepDurationMinutes');
  const spo2Base = getBaselineForMetric('spo2');
  const recoveryBase = getBaselineForMetric('recoveryScore');

  // Value calculations depending on chosen baseline window (7D, 14D, 30D)
  const getBaseValue = (baseObj: MetricBaseline | undefined, fallback: number) => {
    if (!baseObj) return fallback;
    if (baselineWindow === 7) return baseObj.baseline7d || fallback;
    if (baselineWindow === 30) return baseObj.baseline30d || fallback;
    return baseObj.baseline14d || fallback;
  };

  // 1. Cardiovascular
  const rhrCurrent = current.restingHeartRate || 74;
  const rhrBaseVal = Math.round(getBaseValue(rhrBase, 68));
  const rhrChange = Math.round(((rhrCurrent - rhrBaseVal) / rhrBaseVal) * 100);
  const rhrStatus = rhrChange > 10 ? 'ATTENTION' : rhrChange > 5 ? 'MONITOR' : 'NORMAL';

  // 2. Respiratory
  const spo2Current = current.spo2 || 98;
  const spo2BaseVal = Math.round(getBaseValue(spo2Base, 98));
  const spo2Change = Math.round(((spo2Current - spo2BaseVal) / spo2BaseVal) * 100);
  const spo2Status = spo2Current < 95 ? 'ATTENTION' : spo2Current < 97 ? 'MONITOR' : 'NORMAL';

  // 3. Sleep
  const sleepMinutesCurrent = current.sleepDurationMinutes || 378;
  const sleepHoursCurrentStr = `${Math.floor(sleepMinutesCurrent / 60)}h ${sleepMinutesCurrent % 60}m`;
  const sleepMinutesBaseVal = Math.round(getBaseValue(sleepBase, 432));
  const sleepHoursBaseStr = `${Math.floor(sleepMinutesBaseVal / 60)}h ${sleepMinutesBaseVal % 60}m`;
  const sleepChange = Math.round(((sleepMinutesCurrent - sleepMinutesBaseVal) / sleepMinutesBaseVal) * 100);
  const sleepStatus = sleepChange < -15 ? 'ATTENTION' : sleepChange < -8 ? 'MONITOR' : 'NORMAL';

  // 4. HRV
  const hrvCurrent = current.hrv || 44;
  const hrvBaseVal = Math.round(getBaseValue(hrvBase, 62));
  const hrvChange = Math.round(((hrvCurrent - hrvBaseVal) / hrvBaseVal) * 100);
  const hrvStatus = hrvChange < -18 ? 'ATTENTION' : hrvChange < -10 ? 'MONITOR' : 'NORMAL';

  // 5. Fitness
  const fitnessCurrent = current.recoveryScore || 72;
  const fitnessBaseVal = Math.round(getBaseValue(recoveryBase, 75));
  const fitnessChange = Math.round(((fitnessCurrent - fitnessBaseVal) / fitnessBaseVal) * 100);
  const fitnessStatus = fitnessCurrent < 60 ? 'MONITOR' : 'NORMAL';

  // 6. Radiation
  const radCurrent = current.dailyRadiation_uSv || 428;
  const radChange = +4;
  const radStatus = radCurrent > 650 ? 'ATTENTION' : radCurrent > 500 ? 'MONITOR' : 'NORMAL';

  const domainRows = [
    {
      id: 'cardio',
      domainId: 'CARDIO' as HealthTabType,
      domain: 'CARDIOVASCULAR',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      current: `${rhrCurrent} bpm`,
      baseline: `${rhrBaseVal - 3}–${rhrBaseVal + 3} bpm`,
      changePercent: rhrChange,
      changeText: `${rhrChange > 0 ? '+' : ''}${rhrChange}%`,
      trend: rhrChange > 2 ? 'UP' : rhrChange < -2 ? 'DOWN' : 'STABLE',
      status: rhrStatus,
      sparklineData: recentTelemetry.map(t => t.restingHeartRate || 70),
      sparkColor: '#f43f5e',
    },
    {
      id: 'respiratory',
      domainId: 'RESPIRATORY' as HealthTabType,
      domain: 'RESPIRATORY',
      icon: <Wind className="w-4 h-4 text-cyan-400" />,
      current: `${spo2Current}%`,
      baseline: `95–100%`,
      changePercent: spo2Change,
      changeText: `${spo2Change > 0 ? '+' : ''}${spo2Change}%`,
      trend: spo2Change > 1 ? 'UP' : spo2Change < -1 ? 'DOWN' : 'STABLE',
      status: spo2Status,
      sparklineData: recentTelemetry.map(t => t.spo2 || 98),
      sparkColor: '#06b6d4',
    },
    {
      id: 'sleep',
      domainId: 'RECOVERY' as HealthTabType,
      domain: 'SLEEP',
      icon: <Moon className="w-4 h-4 text-purple-400" />,
      current: sleepHoursCurrentStr,
      baseline: sleepHoursBaseStr,
      changePercent: sleepChange,
      changeText: `${sleepChange > 0 ? '+' : ''}${sleepChange}%`,
      trend: sleepChange > 3 ? 'UP' : sleepChange < -3 ? 'DOWN' : 'STABLE',
      status: sleepStatus,
      sparklineData: recentTelemetry.map(t => t.sleepDurationMinutes || 420),
      sparkColor: '#a855f7',
    },
    {
      id: 'hrv',
      domainId: 'CARDIO' as HealthTabType,
      domain: 'HRV',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      current: `${hrvCurrent} ms`,
      baseline: `${hrvBaseVal - 5}–${hrvBaseVal + 5} ms`,
      changePercent: hrvChange,
      changeText: `${hrvChange > 0 ? '+' : ''}${hrvChange}%`,
      trend: hrvChange > 3 ? 'UP' : hrvChange < -3 ? 'DOWN' : 'STABLE',
      status: hrvStatus,
      sparklineData: recentTelemetry.map(t => t.hrv || 55),
      sparkColor: '#38bdf8',
    },
    {
      id: 'fitness',
      domainId: 'FITNESS' as HealthTabType,
      domain: 'FITNESS',
      icon: <Dumbbell className="w-4 h-4 text-emerald-400" />,
      current: `${fitnessCurrent}%`,
      baseline: `65–80%`,
      changePercent: fitnessChange,
      changeText: `${fitnessChange > 0 ? '+' : ''}${fitnessChange}%`,
      trend: fitnessChange > 2 ? 'UP' : fitnessChange < -2 ? 'DOWN' : 'STABLE',
      status: fitnessStatus,
      sparklineData: recentTelemetry.map(t => t.recoveryScore || 70),
      sparkColor: '#10b981',
    },
    {
      id: 'radiation',
      domainId: 'RADIATION' as HealthTabType,
      domain: 'RADIATION',
      icon: <Radiation className="w-4 h-4 text-amber-400" />,
      current: `${radCurrent} µSv`,
      baseline: `Mission range`,
      changePercent: radChange,
      changeText: `+${radChange}%`,
      trend: 'UP',
      status: radStatus,
      sparklineData: recentTelemetry.map(t => t.dailyRadiation_uSv || 400),
      sparkColor: '#f59e0b',
    },
  ];

  return (
    <section 
      id="section-your-health" 
      aria-label="Your Health and Telemetry Matrix"
      className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-6 shadow-sm space-y-5"
    >
      {/* 1. HEALTH COMMAND PANEL (Section 7) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black tracking-widest text-cyan-400 uppercase">
              LEVEL 2 • HEALTH STATE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-100 font-mono mt-0.5">
            YOUR CURRENT HEALTH
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
            Continuous autonomous physiological telemetry compared against personal baseline history.
          </p>
        </div>

        {/* Status Callout & Metadata */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap font-mono text-xs sm:text-sm">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
            <span className="text-slate-400 uppercase text-xs font-bold">STATUS:</span>
            <span className={`w-3 h-3 rounded-full ${statusDisplay.dotBg} shadow-sm`} />
            <span className={`font-black text-sm sm:text-base tracking-wider ${statusDisplay.colorText}`}>
              ● {statusDisplay.label}
            </span>
          </div>

          {/* Mission Health Index */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
            <span className="text-slate-400 uppercase text-xs font-bold">HEALTH INDEX:</span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-lg font-black text-cyan-400">{compositeIndex}</span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
          </div>

          {/* Compared with personal baseline */}
          <div className="hidden lg:block text-slate-300">
            <span className="text-slate-400 uppercase text-xs font-bold block">PERSONAL BASELINE:</span>
            <strong className={`font-black text-xs sm:text-sm ${statusDisplay.colorText}`}>
              {statusDisplay.baselineComparison}
            </strong>
          </div>

          {/* Last updated */}
          <div className="hidden sm:block text-slate-300">
            <span className="text-slate-400 uppercase text-xs font-bold block">LAST UPDATED:</span>
            <strong className="text-slate-200 text-xs sm:text-sm font-mono">{lastUpdated}</strong>
          </div>
        </div>
      </div>

      {/* 2. BASELINE TIME-WINDOW CONTROLLER (Section 9) - Aerospace Switch Console */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-200">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 uppercase font-black text-xs">BASELINE REFERENCE:</span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Comparing against your personal Mars-01 flight telemetry
          </span>
        </div>

        {/* Space Avionics Baseline Selector: [ 7 DAYS ] [ 14 DAYS ] [ 30 DAYS ] */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs self-start sm:self-auto shadow-inner">
          {([7, 14, 30] as BaselineWindow[]).map((days) => (
            <button
              key={days}
              id={`baseline-window-${days}d`}
              onClick={() => setBaselineWindow(days)}
              className={`px-3.5 py-1.5 rounded-lg transition font-black tracking-wider cursor-pointer ${
                baselineWindow === days
                  ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {days} DAYS
            </button>
          ))}
        </div>
      </div>

      {/* 3. HEALTH DOMAIN MATRIX TABLE (Section 8) */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/90 bg-slate-950/80">
        <table className="w-full text-left font-mono text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900 text-xs text-slate-300 uppercase tracking-wider font-black">
              <th className="py-3 px-4">DOMAIN</th>
              <th className="py-3 px-3">CURRENT</th>
              <th className="py-3 px-3">BASELINE ({baselineWindow}D)</th>
              <th className="py-3 px-3">CHANGE</th>
              <th className="py-3 px-3 text-center">TREND</th>
              <th className="py-3 px-3 text-center hidden md:table-cell">SPARKLINE</th>
              <th className="py-3 px-4 text-right">STATUS</th>
              <th className="py-3 px-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {domainRows.map((row) => (
              <tr 
                key={row.id}
                id={`row-domain-${row.id}`}
                onClick={() => onNavigateToDomain(row.domainId)}
                className="group hover:bg-slate-900/90 transition cursor-pointer"
                title={`Click to open detailed ${row.domain} analysis`}
              >
                {/* DOMAIN */}
                <td className="py-3.5 px-4 font-black text-slate-100 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition shrink-0">
                    {row.icon}
                  </div>
                  <span className="tracking-wide text-xs sm:text-sm group-hover:text-cyan-300 transition">
                    {row.domain}
                  </span>
                </td>

                {/* CURRENT */}
                <td className="py-3.5 px-3 font-black text-slate-100 text-sm sm:text-base">
                  {row.current}
                </td>

                {/* BASELINE */}
                <td className="py-3.5 px-3 font-semibold text-slate-400 text-xs sm:text-sm">
                  {row.baseline}
                </td>

                {/* CHANGE */}
                <td className="py-3.5 px-3">
                  <span className={`font-black text-xs sm:text-sm ${
                    Math.abs(row.changePercent) > 10
                      ? 'text-amber-400'
                      : Math.abs(row.changePercent) > 5
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}>
                    {row.changeText}
                  </span>
                </td>

                {/* TREND */}
                <td className="py-3.5 px-3 text-center">
                  <div className="inline-flex items-center justify-center">
                    {row.trend === 'UP' ? (
                      <ArrowUp className="w-4 h-4 text-amber-400" />
                    ) : row.trend === 'DOWN' ? (
                      <ArrowDown className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Minus className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </td>

                {/* SPARKLINE */}
                <td className="py-3.5 px-3 text-center hidden md:table-cell">
                  {renderSparkline(row.sparklineData, row.sparkColor)}
                </td>

                {/* STATUS */}
                <td className="py-3.5 px-4 text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${
                    row.status === 'ATTENTION'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/70 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                      : row.status === 'MONITOR'
                      ? 'bg-amber-950/50 text-amber-300 border-amber-700/60'
                      : 'bg-emerald-950/50 text-emerald-400 border-emerald-700/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      row.status === 'ATTENTION'
                        ? 'bg-amber-400 animate-pulse'
                        : row.status === 'MONITOR'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`} />
                    <span>{row.status}</span>
                  </span>
                </td>

                {/* DRILL DOWN ARROW */}
                <td className="py-3.5 px-2 text-slate-600 group-hover:text-cyan-400 transition text-right pr-3">
                  <ChevronRight className="w-4 h-4 inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
        <span>Click any row to view physiological waveforms and longitudinal trends</span>
        <span className="hidden sm:inline">Aerospace Medical Standard ISO-14620</span>
      </div>
    </section>
  );
};
