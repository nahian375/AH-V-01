/**
 * ASTRA Health - Dedicated "What Changed?" Analysis View
 * Follows exact NASA aerospace requirements:
 * - Header: WHAT CHANGED? "Comparison with your recent personal baseline"
 * - KEY CHANGES: Resting HR, Sleep, HRV, Fatigue
 * - PATTERN: Explaining which measurements changed together
 * - ASTRA OBSERVATION: Plain language flight surgeon observation
 * - SUGGESTED NEXT STEP: Non-diagnostic wording
 * - Buttons: [ ASK ASTRA ], [ VIEW DATA ]
 */

import React from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  MessageSquare, 
  Database, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { MultiMetricChange, MetricBaseline } from '../../types/health';

interface WhatChangedViewProps {
  sol: number;
  whatChangedItems: {
    name: string;
    deviation: string;
    direction: 'UP' | 'DOWN';
    currentVal: string;
    baselineVal: string;
    isAttention: boolean;
  }[];
  multiMetricChanges: MultiMetricChange[];
  astraObservation: string;
  suggestedNextStep: string;
  onAskAstra: (prompt: string) => void;
  onViewData: () => void;
}

export const WhatChangedView: React.FC<WhatChangedViewProps> = ({
  sol,
  whatChangedItems,
  multiMetricChanges,
  astraObservation,
  suggestedNextStep,
  onAskAstra,
  onViewData,
}) => {
  const activePattern = multiMetricChanges[0];

  return (
    <div id="what-changed-dedicated-view" className="space-y-5 pb-10 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-800/40 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
          <Sparkles className="w-4 h-4" />
          <span>MULTI-METRIC DIVERGENCE DETECTION</span>
        </div>
        <h2 className="text-2xl font-bold font-mono text-slate-100 tracking-tight mt-1">
          WHAT CHANGED?
        </h2>
        <p className="text-sm text-slate-300 font-sans mt-0.5">
          Comparison with your recent personal baseline across Sol {sol}
        </p>
      </div>

      {/* SECTION 1: KEY CHANGES (Resting HR, Sleep, HRV, Fatigue) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            KEY CHANGES
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Diverged from 14-day rolling baseline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {whatChangedItems.slice(0, 4).map((item, idx) => {
            const isUp = item.direction === 'UP';
            const isWarn = item.isAttention;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border font-mono transition flex flex-col justify-between gap-2 ${
                  isWarn
                    ? 'bg-amber-950/20 border-amber-600/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-sans font-semibold text-slate-200">
                    {item.name}
                  </span>
                  <span className={`flex items-center text-xs font-bold ${
                    isWarn ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {item.deviation}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-xs text-slate-400 font-normal">Current: </span>
                    <strong className="text-slate-100 text-sm">{item.currentVal}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-normal">Baseline: </span>
                    <span className="text-slate-300 text-xs">{item.baselineVal}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PATTERN (Which measurements changed together) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            PHYSIOLOGICAL PATTERN
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="text-xs font-mono text-slate-400 uppercase">
            SYNCHRONOUS MULTI-METRIC SHIFT:
          </div>
          <p className="text-sm text-slate-200 font-sans leading-relaxed">
            {activePattern ? activePattern.summary : (
              "Resting heart rate elevation (+9%) coincides with a 29% depression in HRV (rMSSD) and an 18% compression in total sleep duration over the past 3 consecutive sols."
            )}
          </p>

          <div className="text-xs text-slate-400 font-mono pt-1">
            Clinical correlation: Simultaneous sympathetic activation with decreased parasympathetic recovery indicates cumulative operational workload fatigue.
          </div>
        </div>
      </div>

      {/* SECTION 3: ASTRA OBSERVATION (Plain language) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            ASTRA OBSERVATION
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-slate-100 font-sans text-sm leading-relaxed">
          {astraObservation || (
            "Several measurements have moved away from your recent baseline. Sleep duration decreased while fatigue increased, alongside a mild rise in resting heart rate."
          )}
        </div>
      </div>

      {/* SECTION 4: SUGGESTED NEXT STEP (Non-diagnostic wording) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            SUGGESTED NEXT STEP
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 font-sans text-sm leading-relaxed">
          {suggestedNextStep || (
            "Complete today's recovery check-in and consider scheduling a 45-minute passive rest period prior to your scheduled ARED resistive workout."
          )}
        </div>
      </div>

      {/* BUTTONS: [ ASK ASTRA ] [ VIEW DATA ] */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          id="what-changed-view-data-btn"
          onClick={onViewData}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 transition cursor-pointer border border-slate-700"
        >
          <Database className="w-4 h-4 text-slate-400" />
          <span>VIEW DATA</span>
        </button>

        <button
          id="what-changed-ask-astra-btn"
          onClick={() => onAskAstra('What is the clinical significance of my recent multi-metric baseline drift?')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition cursor-pointer shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          <span>ASK ASTRA</span>
        </button>
      </div>

    </div>
  );
};
