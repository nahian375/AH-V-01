import React from 'react';
import { DashboardViewModel } from '../../health/dashboardViewModel';
import { Bot, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';

interface AstraAiCardProps {
  ai: DashboardViewModel['ai'];
  onOpenAiChat: () => void;
}

export const AstraAiCard: React.FC<AstraAiCardProps> = ({
  ai,
  onOpenAiChat,
}) => {
  const handleOpenAi = () => {
    spaceAudio.playQuindar();
    onOpenAiChat();
  };

  return (
    <article
      id="card-astra-ai"
      aria-labelledby="heading-astra-ai"
      className="bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl shadow-black/40 flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Top radiant accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/40 via-blue-500/60 to-cyan-500/40 opacity-75" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <h2 
              id="heading-astra-ai"
              className="text-sm sm:text-base font-bold font-mono tracking-wider text-slate-100 uppercase"
            >
              ASTRA AI
            </h2>
          </div>

          {/* Provider state indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950/90 border border-slate-700/80 shadow-inner">
            {ai.isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                <span className="text-emerald-300 tracking-wider">ONLINE AI · GEMINI</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-300 tracking-wider">OFFLINE · LOCAL AI READY</span>
              </>
            )}
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 tracking-wider uppercase mb-1 flex items-center justify-between">
          <span>HEALTH INTELLIGENCE COCKPIT</span>
          <span className="text-[10px] text-cyan-400 font-mono">AUTONOMOUS</span>
        </div>

        {/* AI Health Observation Speech Bubble */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 relative">
          <div className="text-sm font-sans italic text-slate-200 leading-relaxed">
            &ldquo;{ai.observation}&rdquo;
          </div>
          {!ai.isOnline && (
            <div className="mt-2 text-[10px] font-mono text-amber-300/90 bg-amber-950/50 p-2 rounded-lg border border-amber-900/60">
              COMMUNICATION UNAVAILABLE · ASTRA flight models executing locally on spacecraft avionics.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-1">
        <button
          onClick={handleOpenAi}
          className="w-full space-capsule-btn space-capsule-btn-primary text-xs py-2.5 px-5 shadow-lg group-hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>QUERY ASTRA AI COCKPIT</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </article>
  );
};
