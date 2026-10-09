/**
 * ASTRA Health - Section 11: ATTENTION CENTER
 * Operational alert area showing active operational alerts.
 * 
 * Layout:
 * Title: ATTENTION CENTER
 * Summary: 0 CRITICAL | 1 ATTENTION | 2 MONITOR
 * Active Item:
 * - ATTENTION
 * - RECOVERY PATTERN CHANGED
 * - Detected 08:42
 * - Contributing metrics: Sleep ↓, HRV ↓, Fatigue ↑
 * - Status: REVIEW RECOMMENDED
 * - Buttons: [ REVIEW ALERT ] [ VIEW TREND ]
 */

import React from 'react';
import { HealthAlert, HealthSeverity } from '../../types/health';
import { ShieldCheck, AlertTriangle, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';

interface AttentionCenterPanelProps {
  alerts?: HealthAlert[];
  overallSeverity: HealthSeverity;
  onReviewAlert: () => void;
  onViewTrend: () => void;
}

export const AttentionCenterPanel: React.FC<AttentionCenterPanelProps> = ({
  alerts = [],
  overallSeverity,
  onReviewAlert,
  onViewTrend,
}) => {
  // Compute counts
  const criticalCount = alerts.filter(a => a.severity === 'RED' && !a.acknowledged).length;
  const attentionCount = alerts.filter(a => a.severity === 'ORANGE' && !a.acknowledged).length + (overallSeverity === 'ORANGE' ? 1 : 0);
  const monitorCount = alerts.filter(a => a.severity === 'YELLOW' && !a.acknowledged).length;

  const hasAlerts = criticalCount > 0 || attentionCount > 0 || monitorCount > 0 || overallSeverity !== 'GREEN';

  // Get top active alert
  const topAlert = alerts.find(a => !a.acknowledged && (a.severity === 'RED' || a.severity === 'ORANGE')) || alerts[0];

  const alertTitle = topAlert ? topAlert.title : 'RECOVERY PATTERN CHANGED';
  const detectedTime = topAlert ? new Date(topAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:42';
  const factors = topAlert && topAlert.contributingFactors?.length > 0
    ? topAlert.contributingFactors.join(', ')
    : 'Sleep ↓, HRV ↓, Fatigue ↑';

  return (
    <div 
      id="panel-attention-center"
      className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm"
    >
      <div>
        {/* Header & Alert Summary: 0 CRITICAL | 1 ATTENTION | 2 MONITOR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${hasAlerts ? 'text-amber-400' : 'text-emerald-400'}`} />
            <h3 className="text-sm font-mono font-black tracking-wider text-slate-100 uppercase">
              ATTENTION CENTER
            </h3>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className={criticalCount > 0 ? 'text-rose-400 font-black' : 'text-slate-500'}>
              {criticalCount} CRITICAL
            </span>
            <span className="text-slate-700">|</span>
            <span className={attentionCount > 0 ? 'text-amber-400 font-black' : 'text-slate-500'}>
              {attentionCount} ATTENTION
            </span>
            <span className="text-slate-700">|</span>
            <span className={monitorCount > 0 ? 'text-amber-300 font-bold' : 'text-slate-500'}>
              {monitorCount} MONITOR
            </span>
          </div>
        </div>

        {/* Content Body */}
        {!hasAlerts ? (
          <div className="my-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                <span className="text-sm font-black tracking-wider text-emerald-400 uppercase">
                  ALL MONITORED DOMAINS NOMINAL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
                No acute physiological deviations require operational intervention.
              </p>
            </div>
          </div>
        ) : (
          <div className="my-3.5 p-3.5 sm:p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/70 text-amber-300 font-mono text-xs font-black flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  ATTENTION
                </span>
                <span className="text-sm font-mono font-black text-slate-100 uppercase tracking-wide">
                  {alertTitle}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Detected {detectedTime}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 text-xs uppercase font-bold block mb-1">
                CONTRIBUTING FACTORS:
              </span>
              <span className="text-amber-300 text-xs sm:text-sm font-bold">{factors}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">OPERATIONAL STATUS:</span>
              <span className="text-amber-400 font-black">REVIEW RECOMMENDED</span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons: [ REVIEW ALERT ] [ VIEW TREND ] - Space Command Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <button
          onClick={onReviewAlert}
          className="space-cmd-btn-amber py-2.5 px-3 rounded-xl text-xs sm:text-sm font-mono font-black tracking-wider cursor-pointer"
        >
          <AlertCircle className="w-4 h-4" />
          <span>REVIEW ALERT</span>
        </button>

        <button
          onClick={onViewTrend}
          className="space-cmd-btn-secondary py-2.5 px-3 rounded-xl text-xs sm:text-sm font-mono font-black tracking-wider cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>VIEW TREND</span>
        </button>
      </div>
    </div>
  );
};
