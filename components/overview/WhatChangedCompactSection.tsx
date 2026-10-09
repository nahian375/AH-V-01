import React from 'react';
import { HealthSeverity } from '../../types/health';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  TrendingDown
} from 'lucide-react';

interface MetricDelta {
  name: string;
  deltaStr: string; // e.g. "↓ 14%" or "↑ 8%"
  direction: 'UP' | 'DOWN';
  isAttention: boolean;
}

interface WhatChangedCompactSectionProps {
  changes: MetricDelta[];
  summaryNote: string;
  hasAttention: boolean;
  attentionSeverity?: HealthSeverity;
  attentionTitle?: string;
  onViewChanges: () => void;
  onReviewAttention: () => void;
}

export const WhatChangedCompactSection: React.FC<WhatChangedCompactSectionProps> = ({
  changes,
  summaryNote,
  hasAttention,
  attentionSeverity = 'ORANGE',
  attentionTitle = 'Recovery pattern changed.',
  onViewChanges,
  onReviewAttention,
}) => {
  // Always limit to 3 most meaningful changes per Section 13
  const topChanges = changes.slice(0, 3);

  return (
    <div 
      id="what-changed-command-section"
      className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-md shadow-black/30 space-y-4"
    >
      {/* Top row: Section Title + Integrated Attention Badge (Section 14) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
            AUTONOMOUS DELTA TRACKING
          </span>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 mt-0.5">
            WHAT CHANGED?
          </h3>
        </div>

        {/* Integrated Attention Strip (Section 14) */}
        {hasAttention ? (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-700/80 text-amber-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider">
              {attentionSeverity === 'RED' ? '🔴 CRITICAL' : '🟠 ATTENTION'}:
            </span>
            <span className="text-slate-200 truncate max-w-[200px] sm:max-w-xs">{attentionTitle}</span>
            <button
              onClick={onReviewAttention}
              className="ml-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-bold uppercase cursor-pointer transition"
            >
              REVIEW →
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/70 text-emerald-300 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold tracking-wider uppercase">🟢 ALL CLEAR:</span>
            <span className="text-slate-300">No significant changes require attention.</span>
          </div>
        )}
      </div>

      {/* Middle row: The 3 most meaningful changes in compact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {topChanges.map((item, idx) => {
          const isNegative = item.direction === 'DOWN' && item.isAttention;
          const isElevated = item.direction === 'UP' && item.isAttention;

          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between font-mono"
            >
              <div className="text-xs font-semibold text-slate-300 truncate mr-2">
                {item.name}
              </div>
              <div 
                className={`text-sm font-bold flex items-center gap-1 shrink-0 ${
                  isNegative || isElevated ? 'text-amber-400' : 'text-slate-200'
                }`}
              >
                {item.direction === 'DOWN' ? (
                  <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{item.deltaStr.replace(/[↓↑]/g, '').trim()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom row: Concise summary sentence + [ VIEW CHANGES → ] button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <p className="text-xs sm:text-sm text-slate-400 font-sans italic">
          "{summaryNote || 'Recovery indicators have moved below your recent baseline.'}"
        </p>

        <button
          id="btn-view-changes"
          onClick={onViewChanges}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white border border-slate-700 font-mono text-xs font-bold tracking-wider uppercase transition self-start sm:self-auto cursor-pointer group shrink-0"
        >
          <span>VIEW CHANGES</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
