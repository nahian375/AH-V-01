/**
 * ASTRA Health - Section 13: TODAY'S OPERATIONS
 * Operational protocol & scheduled daily medical tasks checklist.
 * 
 * Layout:
 * Title: TODAY
 * Subtitle: Operational protocol & scheduled daily medical tasks
 * Completion indicator: 72% COMPLETE
 * 
 * Checklist Items:
 * ✓ DAILY CHECK-IN (Completed 08:15)
 * ✓ VITAL MEASUREMENTS (Completed 08:20)
 * ✓ EXERCISE (Completed 11:30)
 * ○ RECOVERY REVIEW (Pending)
 * ○ COGNITIVE TEST (Pending)
 * 
 * Primary Action: [ CONTINUE TODAY ]
 */

import React from 'react';
import { CheckCircle2, Circle, ArrowRight, ClipboardCheck } from 'lucide-react';

interface TodaysActionsSectionProps {
  onContinueCheckIn: () => void;
  onNavigateToExercise?: () => void;
  onNavigateToCognitive?: () => void;
}

export const TodaysActionsSection: React.FC<TodaysActionsSectionProps> = ({
  onContinueCheckIn,
  onNavigateToExercise,
  onNavigateToCognitive,
}) => {
  const tasks = [
    { 
      id: 'check-in', 
      label: 'DAILY CHECK-IN', 
      detail: 'Completed 08:15', 
      status: 'Complete' as const,
      onClick: onContinueCheckIn,
    },
    { 
      id: 'vitals', 
      label: 'VITAL MEASUREMENTS', 
      detail: 'Completed 08:20', 
      status: 'Complete' as const,
      onClick: onContinueCheckIn,
    },
    { 
      id: 'exercise', 
      label: 'EXERCISE', 
      detail: 'Completed 11:30', 
      status: 'Complete' as const,
      onClick: onNavigateToExercise,
    },
    { 
      id: 'recovery', 
      label: 'RECOVERY REVIEW', 
      detail: 'Pending', 
      status: 'Pending' as const,
      onClick: onContinueCheckIn,
    },
    { 
      id: 'cognitive', 
      label: 'COGNITIVE TEST', 
      detail: 'Pending', 
      status: 'Pending' as const,
      onClick: onNavigateToCognitive,
    },
  ];

  const progressPercent = 72;

  return (
    <section 
      id="section-today-operations"
      aria-label="Today's Operations Checklist"
      className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 shadow-sm space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black tracking-widest text-cyan-400 uppercase">
                LEVEL 5 • DAILY PROTOCOL
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-mono font-black tracking-wider text-slate-100 uppercase">
              TODAY'S OPERATIONS
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
              Scheduled astronaut medical protocols & autonomous health tasks
            </p>
          </div>
        </div>

        {/* Overall Completion Indicator: 72% COMPLETE */}
        <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
          <div className="w-28 sm:w-40 bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-mono font-black text-cyan-300 whitespace-nowrap">
            {progressPercent}% COMPLETE
          </span>
        </div>
      </div>

      {/* Checklist and Action CTA */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Horizontal Checklist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
          {tasks.map((task) => {
            const isDone = task.status === 'Complete';
            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                onClick={task.onClick}
                className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer select-none ${
                  isDone
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200'
                    : 'bg-slate-950 border-amber-500/40 hover:border-amber-400 text-slate-100 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-bold tracking-tight truncate">
                      {task.label}
                    </div>
                    <div className={`text-[11px] font-mono mt-0.5 ${
                      isDone ? 'text-slate-400' : 'text-amber-400 font-extrabold'
                    }`}>
                      {task.detail}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Action Button: [ CONTINUE TODAY ] - Space Command Button */}
        <button
          id="btn-continue-today"
          onClick={onContinueCheckIn}
          className="space-cmd-btn-primary px-6 py-3.5 rounded-xl text-sm font-mono font-black tracking-widest cursor-pointer shadow-lg shrink-0 whitespace-nowrap"
        >
          <span>CONTINUE TODAY</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </section>
  );
};
