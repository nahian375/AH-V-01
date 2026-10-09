import React, { useState } from 'react';
import { DashboardViewModel, WellbeingTask } from '../../health/dashboardViewModel';
import { Sparkles, CheckCircle2, RotateCw, Check } from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';

interface ImproveWellbeingCardProps {
  task: WellbeingTask;
  onCompleteTask: (taskId: string) => void;
  onNextTask: () => void;
}

export const ImproveWellbeingCard: React.FC<ImproveWellbeingCardProps> = ({
  task,
  onCompleteTask,
  onNextTask,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteComplete = () => {
    if (task.completed) return;
    setIsExecuting(true);
    spaceAudio.playExecute();
    
    setTimeout(() => {
      onCompleteTask(task.id);
      setIsExecuting(false);
    }, 400);
  };

  const handleCycleNext = () => {
    spaceAudio.playClick();
    onNextTask();
  };

  return (
    <article
      id="card-improve-wellbeing"
      aria-labelledby="heading-improve-wellbeing"
      className="bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl shadow-black/40 flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Subtle top radar accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/40 via-cyan-500/60 to-emerald-500/40 opacity-75" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label="Sparkles">✨</span>
            <h2 
              id="heading-improve-wellbeing"
              className="text-sm sm:text-base font-bold font-mono tracking-wider text-slate-100 uppercase"
            >
              IMPROVE MY WELLBEING
            </h2>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Operational Protocol
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400 tracking-wider uppercase mb-1 flex items-center justify-between">
          <span>TODAY&apos;S TASK</span>
          <span className="text-[10px] text-cyan-400/80 font-mono">SOL PROTOCOL</span>
        </div>

        {/* Task description block */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          task.completed 
            ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.15)]' 
            : 'bg-slate-950/70 border-slate-800/80 text-slate-100'
        }`}>
          <div className="text-sm font-sans font-medium leading-relaxed">
            &ldquo;{task.title}&rdquo;
          </div>
          <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
            {task.rationale}
          </p>
        </div>
      </div>

      {/* Aerodynamic Round Capsule Buttons */}
      <div className="flex items-center gap-3 mt-5 pt-1">
        {task.completed ? (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-mono font-extrabold tracking-wider shadow-[0_0_14px_rgba(16,185,129,0.25)]">
            <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>✓ PROTOCOL COMPLETED</span>
          </div>
        ) : (
          <button
            onClick={handleExecuteComplete}
            disabled={isExecuting}
            className="flex-1 space-capsule-btn space-capsule-btn-emerald text-xs tracking-wider shadow-lg disabled:opacity-50"
            title="Execute and log completed wellbeing action"
          >
            <Check className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'LOGGING TELEMETRY...' : '✓ COMPLETE'}</span>
          </button>
        )}

        <button
          onClick={handleCycleNext}
          title="Cycle to another approved astronaut wellbeing recommendation"
          className="space-capsule-btn space-capsule-btn-glass text-xs py-2.5 px-4 text-slate-300 hover:text-white shrink-0"
        >
          <RotateCw className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          <span>↻ NEW TASK</span>
        </button>
      </div>
    </article>
  );
};
