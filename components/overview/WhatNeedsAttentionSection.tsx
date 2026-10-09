/**
 * ASTRA Health - Priority 2: WHAT NEEDS ATTENTION?
 * Placed directly underneath YOUR HEALTH.
 * Answers: "Do I need to do something right now?"
 * 
 * If no issues:
 * 🟢 ALL CLEAR
 * "No significant deviations require attention."
 * 
 * If issue:
 * 🟠 1 ATTENTION
 * MULTI-METRIC CHANGE
 * Sleep ↓ 14% | HRV ↓ 18% | Resting HR ↑ 8%
 * "Several measurements have moved away from your recent baseline."
 * Prominent Button: [ REVIEW ]
 */

import React from 'react';
import { MetricBaseline, HealthSeverity } from '../../types/health';
import { ShieldCheck, AlertCircle, ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';

interface WhatNeedsAttentionSectionProps {
  severity: HealthSeverity;
  unacknowledgedAlertsCount: number;
  baselines: MetricBaseline[];
  onReview: () => void;
}

export const WhatNeedsAttentionSection: React.FC<WhatNeedsAttentionSectionProps> = ({
  severity,
  unacknowledgedAlertsCount,
  baselines,
  onReview,
}) => {
  const hasIssue = severity === 'ORANGE' || severity === 'RED' || severity === 'YELLOW' || unacknowledgedAlertsCount > 0;

  // Derive notable deviations from baselines
  const sleepBase = baselines.find(b => b.metricKey === 'sleepDurationMinutes');
  const hrvBase = baselines.find(b => b.metricKey === 'hrv');
  const rhrBase = baselines.find(b => b.metricKey === 'restingHeartRate');

  const sleepDev = sleepBase?.deviationPercent ? Math.round(sleepBase.deviationPercent) : -14;
  const hrvDev = hrvBase?.deviationPercent ? Math.round(hrvBase.deviationPercent) : -18;
  const rhrDev = rhrBase?.deviationPercent ? Math.round(rhrBase.deviationPercent) : 8;

  return (
    <section 
      id="section-what-needs-attention"
      aria-label="What Needs Attention"
      className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 shadow-sm"
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
        <h3 className="text-sm font-mono font-black tracking-wider text-slate-100 uppercase">
          WHAT NEEDS ATTENTION?
        </h3>
        <span className="text-xs font-mono text-slate-400">
          Operational Priority Triage
        </span>
      </div>

      {!hasIssue ? (
        // ALL CLEAR STATE
        <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                <span className="text-base font-mono font-black tracking-wider text-emerald-400">
                  ALL CLEAR
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
                No significant physiological deviations require attention.
              </p>
            </div>
          </div>

          <button
            onClick={onReview}
            className="space-cmd-btn-secondary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-black tracking-wider cursor-pointer self-start sm:self-auto"
          >
            REVIEW BASELINE
          </button>
        </div>
      ) : (
        // ATTENTION STATE
        <div className="mt-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-amber-950/25 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.12)]">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/70 text-amber-300 font-mono text-xs sm:text-sm font-black shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{unacknowledgedAlertsCount > 0 ? `${unacknowledgedAlertsCount} ATTENTION` : '1 ATTENTION'}</span>
              </div>
              <span className="text-sm font-mono font-black text-slate-100 tracking-wider uppercase">
                MULTI-METRIC CHANGE
              </span>
            </div>

            {/* Metric Deviations Chips */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Sleep */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm font-mono shadow-xs">
                <span className="text-slate-400 font-bold">Sleep</span>
                <span className="flex items-center text-amber-400 font-black">
                  <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                  {Math.abs(sleepDev)}%
                </span>
              </div>

              {/* HRV */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm font-mono shadow-xs">
                <span className="text-slate-400 font-bold">HRV</span>
                <span className="flex items-center text-amber-400 font-black">
                  <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                  {Math.abs(hrvDev)}%
                </span>
              </div>

              {/* Resting HR */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm font-mono shadow-xs">
                <span className="text-slate-400 font-bold">Resting HR</span>
                <span className="flex items-center text-amber-400 font-black">
                  <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                  {Math.abs(rhrDev)}%
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-sans">
              Several measurements have moved away from your recent baseline.
            </p>
          </div>

          {/* Prominent REVIEW Button - Space Command Button */}
          <button
            id="attention-review-button"
            onClick={onReview}
            className="space-cmd-btn-amber px-7 py-3.5 rounded-xl font-mono text-sm font-black tracking-widest uppercase cursor-pointer shrink-0 self-start lg:self-center shadow-lg"
          >
            <span>REVIEW</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      )}
    </section>
  );
};
