import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Calendar } from 'lucide-react';

interface TodayActionSectionProps {
  checkInComplete: boolean;
  recoveryReviewPending: boolean;
  onContinueToday: () => void;
}

export const TodayActionSection: React.FC<TodayActionSectionProps> = ({
  checkInComplete,
  recoveryReviewPending,
  onContinueToday,
}) => {
  return (
    <div 
      id="today-command-section"
      className="flex flex-col justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-md shadow-black/30"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              OPERATIONAL CYCLE
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-slate-400">IMMEDIATE</span>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 mb-4">
          TODAY
        </h3>

        {/* Immediate Tasks: 2 items */}
        <div className="space-y-2.5 mb-5 font-mono">
          {/* Item 1: Daily Check-in */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-200">
              Daily Check-in
            </span>
            {checkInComplete ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ✓ Complete
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Circle className="w-3.5 h-3.5" />
                ○ Pending
              </span>
            )}
          </div>

          {/* Item 2: Recovery Review */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-200">
              Recovery Review
            </span>
            {recoveryReviewPending ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Circle className="w-3.5 h-3.5" />
                ○ Pending
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ✓ Complete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary button: [ CONTINUE TODAY → ] */}
      <button
        id="btn-continue-today"
        onClick={onContinueToday}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold tracking-wider uppercase transition group cursor-pointer shadow-md shadow-cyan-900/30"
      >
        <span>CONTINUE TODAY</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
