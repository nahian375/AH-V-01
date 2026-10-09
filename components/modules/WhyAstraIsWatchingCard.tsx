/**
 * ASTRA Health - Why ASTRA is Watching Card
 * Explainable monitoring interface displaying active surveillance factors
 * strictly based on real recorded baseline deviations and check-ins.
 */

import React from 'react';
import { Eye, ShieldAlert, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { WhyAstraIsWatchingItem } from '../../types/spaceContext';
import { spaceAudio } from '../../utils/spaceAudio';

interface WhyAstraIsWatchingCardProps {
  items: WhyAstraIsWatchingItem[];
  onNavigateDetails?: () => void;
  onAskAstra?: (prompt: string) => void;
  className?: string;
}

export const WhyAstraIsWatchingCard: React.FC<WhyAstraIsWatchingCardProps> = ({
  items,
  onNavigateDetails,
  onAskAstra,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden font-mono text-xs ${className}`}>
      {/* Top ambient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/50 via-cyan-500/30 to-amber-500/50" />

      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-slate-100 tracking-wider uppercase text-sm">
            WHY ASTRA IS WATCHING
          </h3>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-950/70 border border-amber-800/80 px-2.5 py-0.5 rounded-full font-bold">
          {items.length} ACTIVE FACTORS
        </span>
      </div>

      <div className="mt-3.5 space-y-2.5">
        {items.length > 0 ? (
          items.map((item) => (
            <div 
              key={item.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <span className={`w-2 h-2 rounded-full ${
                    item.severity === 'ATTENTION' ? 'bg-rose-400 shadow-[0_0_6px_#f43f5e]' :
                    item.severity === 'WATCH' ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' :
                    'bg-cyan-400'
                  }`} />
                  <span>{item.observedChange}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase">{item.category}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans pl-3.5">
                {item.spaceContextNote}
              </p>
              <div className="text-[10px] text-cyan-400/80 font-mono pl-3.5">
                Baseline context: {item.baselineComparison}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/50 border border-emerald-900/40 text-emerald-300/90 text-center space-y-1">
            <span className="font-bold block">● All Parameters in Nominal Equilibrium</span>
            <p className="text-[11px] text-slate-400 font-sans">
              No active multi-metric alerts or abnormal baseline deviations recorded on this Sol.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        {onAskAstra && items.length > 0 && (
          <button
            onClick={() => {
              spaceAudio.playClick();
              onAskAstra('What health indicators are ASTRA currently watching and why?');
            }}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>Ask ASTRA to Explain Factors</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
        {onNavigateDetails && (
          <button
            onClick={() => {
              spaceAudio.playClick();
              onNavigateDetails();
            }}
            className="text-[11px] text-slate-400 hover:text-white font-bold ml-auto transition cursor-pointer"
          >
            [ VIEW DETAILS ]
          </button>
        )}
      </div>
    </div>
  );
};
