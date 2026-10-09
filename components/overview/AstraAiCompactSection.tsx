import React from 'react';
import { AISource } from '../../types/ai';
import { Sparkles, Cpu, ArrowRight, Bot } from 'lucide-react';

interface AstraAiCompactSectionProps {
  activeAiSource: AISource;
  isOffline: boolean;
  latestObservation?: string;
  onAskAstra: () => void;
}

export const AstraAiCompactSection: React.FC<AstraAiCompactSectionProps> = ({
  activeAiSource,
  isOffline,
  latestObservation,
  onAskAstra,
}) => {
  const isCloud = activeAiSource.includes('GEMINI') && !isOffline;

  const observationText = isOffline
    ? 'Cloud communication unavailable. Local health intelligence remains active.'
    : latestObservation || 'Your recovery indicators have shifted below your recent baseline.';

  return (
    <div 
      id="astra-ai-command-section"
      className="flex flex-col justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-md shadow-black/30"
    >
      <div>
        {/* Top Header: ASTRA AI + Source indicator */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100">
              ASTRA AI
            </h3>
          </div>

          {/* AI Source Pill: ● GEMINI CLOUD or ● LOCAL ASTRA AI */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
              isCloud 
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
                : 'bg-purple-950/60 text-purple-300 border-purple-700/60'
            }`}
          >
            {isCloud ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                <span>GEMINI CLOUD</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                <span>LOCAL ASTRA AI</span>
              </>
            )}
          </div>
        </div>

        {/* Observation text */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
            LATEST CLINICAL OBSERVATION
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans italic">
            "{observationText}"
          </p>
        </div>
      </div>

      {/* Button: [ ASK ASTRA → ] */}
      <button
        id="btn-ask-astra-front"
        onClick={onAskAstra}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white border border-slate-700/80 hover:border-cyan-500/60 font-mono text-xs font-bold tracking-wider uppercase transition group cursor-pointer shadow-sm"
      >
        <span>ASK ASTRA</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
