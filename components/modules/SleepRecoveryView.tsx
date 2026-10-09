/**
 * ASTRA Health - Sleep & Recovery View
 * Visualizes 30-day sleep trends, baseline deviations, HRV correlations, and recovery debt.
 */

import React, { useState } from 'react';
import { HealthMeasurement, MetricBaseline } from '../../types/health';
import { Moon, Sparkles, TrendingDown, Clock, Activity, BatteryCharging, AlertCircle } from 'lucide-react';

interface SleepRecoveryViewProps {
  telemetry: HealthMeasurement[];
  baselines: MetricBaseline[];
  sol: number;
  onAskAstra: (prompt: string) => void;
}

export const SleepRecoveryView: React.FC<SleepRecoveryViewProps> = ({
  telemetry,
  baselines,
  sol,
  onAskAstra,
}) => {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);

  const displayData = telemetry.slice(-rangeDays);
  const current = telemetry[telemetry.length - 1];
  const sleepBase = baselines.find(b => b.metricKey === 'sleepDurationMinutes');
  const hrvBase = baselines.find(b => b.metricKey === 'hrv');
  const recoveryBase = baselines.find(b => b.metricKey === 'recoveryScore');

  const baselineHours = sleepBase ? (sleepBase.baseline14d / 60).toFixed(1) : '7.2';
  const currentHours = current ? (current.sleepDurationMinutes / 60).toFixed(1) : '5.9';

  return (
    <div id="sleep-recovery-view" className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50">
            <Moon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100">
              SLEEP ARCHITECTURE & AUTONOMIC RECOVERY
            </h2>
            <p className="text-xs text-slate-400">
              Telemetry correlation between circadian rest, heart rate variability, and fatigue
            </p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setRangeDays(days as any)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                rangeDays === days
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> Sleep Duration</span>
            <span className="text-amber-400 font-bold">-18% vs Base</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-100">{currentHours}</span>
            <span className="text-xs font-mono text-slate-400">hours (Baseline: {baselineHours}h)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, (Number(currentHours) / 8) * 100)}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Heart Rate Variability</span>
            <span className="text-amber-400 font-bold">-29% vs Base</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-100">{current?.hrv}</span>
            <span className="text-xs font-mono text-slate-400">ms (Baseline: {hrvBase?.baseline14d || 62} ms)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, ((current?.hrv || 44) / 70) * 100)}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span className="flex items-center gap-1.5"><BatteryCharging className="w-3.5 h-3.5 text-purple-400" /> Recovery Index</span>
            <span className="text-amber-400 font-bold">Deficit</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-100">{current?.recoveryScore}</span>
            <span className="text-xs font-mono text-slate-400">/ 100 (Normal: {recoveryBase?.baseline14d || 84})</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: `${current?.recoveryScore || 62}%` }} />
          </div>
        </div>

      </div>

      {/* Interactive Sleep Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-mono text-slate-200">
            DAILY SLEEP VOLUME (HOURS) VS 14-DAY BASELINE OVER LAST {rangeDays} SOLS
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500" /> Measured Sleep
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 border border-dashed border-amber-400" /> Personal Baseline (7.2h)
            </span>
          </div>
        </div>

        {/* Bar visualization */}
        <div className="h-48 flex items-end gap-1.5 sm:gap-2 pt-6 border-b border-slate-800 pb-2">
          {displayData.map((item) => {
            const hours = item.sleepDurationMinutes / 60;
            const heightPercent = Math.min(100, Math.max(10, (hours / 9) * 100));
            const isDeficit = hours < 6.5;

            return (
              <div key={item.sol} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-950 border border-slate-700 text-slate-100 text-[10px] font-mono px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                  Sol {item.sol}: {hours.toFixed(1)}h (Quality {item.sleepQuality}%)
                </div>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isDeficit
                      ? 'bg-amber-500/80 group-hover:bg-amber-400'
                      : 'bg-cyan-600/80 group-hover:bg-cyan-400'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] font-mono text-slate-500 transform -rotate-45 sm:rotate-0 origin-top-left sm:origin-center mt-1">
                  {item.sol}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ASTRA Autonomic Analysis Box */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
              ASTRA SLEEP & RECOVERY ANALYSIS
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Consecutive reductions in sleep volume on Sol 182-184 have depressed HRV to 44 ms and elevated resting heart rate to 81 bpm. Data correlates with crew berth acoustic reports.
            </p>
          </div>
        </div>

        <button
          onClick={() => onAskAstra('Explain how my sleep compression affects my recovery score')}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition cursor-pointer shrink-0 shadow-xs"
        >
          ASK ASTRA ABOUT SLEEP
        </button>
      </div>

    </div>
  );
};
