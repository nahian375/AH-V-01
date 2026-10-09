/**
 * ASTRA Health - Personal Space Baseline Card
 * Distinguishes Pre-Flight Earth baseline from In-Flight 14-day rolling baseline
 * to prevent assuming Earth physiological normal remains static in microgravity.
 */

import React from 'react';
import { Layers, Activity, TrendingUp, Info } from 'lucide-react';
import { PreFlightBaselineComparison } from '../../types/spaceContext';

interface PersonalSpaceBaselineCardProps {
  baselines: PreFlightBaselineComparison[];
  onNavigateTrends?: () => void;
  className?: string;
}

export const PersonalSpaceBaselineCard: React.FC<PersonalSpaceBaselineCardProps> = ({
  baselines,
  onNavigateTrends,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden font-mono text-xs ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 via-cyan-500/30 to-purple-500/50" />

      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-slate-100 tracking-wider uppercase text-sm">
            PERSONAL SPACE BASELINE
          </h3>
        </div>
        <span className="text-[10px] text-purple-300 bg-purple-950/70 border border-purple-800/80 px-2.5 py-0.5 rounded-full font-bold">
          14-DAY ROLLING
        </span>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 font-sans leading-relaxed">
        ASTRA separates your pre-flight Earth baseline from your active in-flight baseline to monitor physiological adaptation without treating spaceflight adaptation as permanent baseline.
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {baselines.map((item) => (
          <div key={item.metricKey} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">{item.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                item.status === 'ATTENTION' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                item.status === 'MONITORING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/60">
                <span className="text-slate-500 block">Pre-Flight</span>
                <strong className="text-slate-300 text-xs">{item.preFlightValue} {item.unit}</strong>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/60">
                <span className="text-slate-500 block">In-Flight 14d</span>
                <strong className="text-cyan-400 text-xs">{item.inFlight14dBaseline} {item.unit}</strong>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/60">
                <span className="text-slate-500 block">Current</span>
                <strong className="text-slate-100 text-xs">{item.currentValue} {item.unit}</strong>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-sans pt-1">
              Delta from In-Flight Baseline: <strong className={item.deltaFromInFlight > 0 ? 'text-amber-400' : 'text-slate-200'}>{item.deltaFromInFlight > 0 ? '+' : ''}{item.deltaFromInFlight} {item.unit}</strong>
            </div>
          </div>
        ))}
      </div>

      {onNavigateTrends && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onNavigateTrends}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer"
          >
            [ VIEW BASELINE HISTORY & TRENDS ]
          </button>
        </div>
      )}
    </div>
  );
};
