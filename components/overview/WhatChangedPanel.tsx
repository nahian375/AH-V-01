/**
 * ASTRA Health - Section 10: WHAT CHANGED?
 * Dedicated analysis area showing the top meaningful physiological changes
 * compared with personal baseline.
 * 
 * Layout:
 * Title: WHAT CHANGED?
 * Subtitle: Compared with your recent personal baseline
 * 
 * Meaningful changes (3 to 5):
 * - SLEEP ↓ 14%
 * - HRV ↓ 18%
 * - RESTING HR ↑ 8%
 * - FATIGUE ↑ 12%
 * 
 * Interpretation:
 * "Several recovery-related measurements have moved away from baseline over the last 3 days."
 * 
 * Button: [ VIEW CHANGE ANALYSIS ]
 */

import React from 'react';
import { MetricBaseline } from '../../types/health';
import { ArrowDown, ArrowUp, BarChart3, ChevronRight } from 'lucide-react';

interface WhatChangedPanelProps {
  baselines?: MetricBaseline[];
  onViewChangeAnalysis: () => void;
}

export const WhatChangedPanel: React.FC<WhatChangedPanelProps> = ({
  baselines = [],
  onViewChangeAnalysis,
}) => {
  // Extract specific baselines or fallback to representative values
  const sleepBase = baselines.find(b => b.metricKey === 'sleepDurationMinutes');
  const hrvBase = baselines.find(b => b.metricKey === 'hrv');
  const rhrBase = baselines.find(b => b.metricKey === 'restingHeartRate');
  const fatigueBase = baselines.find(b => b.metricKey === 'fatigueScore');

  const sleepDev = sleepBase ? Math.round(sleepBase.deviationPercent) : -14;
  const hrvDev = hrvBase ? Math.round(hrvBase.deviationPercent) : -18;
  const rhrDev = rhrBase ? Math.round(rhrBase.deviationPercent) : 8;
  const fatigueDev = fatigueBase ? Math.round(fatigueBase.deviationPercent) : 12;

  const changes = [
    { label: 'SLEEP', dev: sleepDev, isUp: sleepDev > 0, unit: '%' },
    { label: 'HRV', dev: hrvDev, isUp: hrvDev > 0, unit: '%' },
    { label: 'RESTING HR', dev: rhrDev, isUp: rhrDev > 0, unit: '%' },
    { label: 'FATIGUE', dev: fatigueDev, isUp: fatigueDev > 0, unit: '%' },
  ];

  return (
    <div 
      id="panel-what-changed"
      className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm"
    >
      <div>
        {/* Header & Subtitle */}
        <div className="pb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-black tracking-wider text-slate-100 uppercase">
              WHAT CHANGED?
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
            Comparative deviation against your recent personal baseline
          </p>
        </div>

        {/* 4 Core Changes Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
          {changes.map((item) => (
            <div 
              key={item.label}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono shadow-xs"
            >
              <div className="text-xs text-slate-400 font-black uppercase truncate">
                {item.label}
              </div>
              <div className="text-lg font-black mt-1 flex items-center justify-center gap-1 text-amber-400">
                {item.isUp ? (
                  <ArrowUp className="w-4 h-4 text-amber-400" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-amber-400" />
                )}
                <span>{Math.abs(item.dev)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Concise Human Interpretation */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm font-sans text-slate-200">
          <span className="text-xs font-mono uppercase font-black text-cyan-400 block mb-1">
            AUTONOMOUS SUMMARY
          </span>
          "Several recovery-related measurements have moved away from baseline over the last 3 days."
        </div>
      </div>

      {/* Action Button: [ VIEW CHANGE ANALYSIS ] - Space Command Button */}
      <div className="pt-3 border-t border-slate-800/80 mt-3">
        <button
          onClick={onViewChangeAnalysis}
          className="space-cmd-btn-secondary w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-mono font-black tracking-wider cursor-pointer"
        >
          <span>VIEW CHANGE ANALYSIS</span>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
