import React from 'react';
import { NavTab } from '../layout/Navigation';
import { HealthTabType } from '../modules/HealthView';

interface QuickAccessCompactSectionProps {
  onNavigateTab: (tab: NavTab) => void;
  onNavigateToDomain: (domain: HealthTabType) => void;
}

export const QuickAccessCompactSection: React.FC<QuickAccessCompactSectionProps> = ({
  onNavigateTab,
  onNavigateToDomain,
}) => {
  return (
    <div 
      id="quick-access-command-area"
      className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/70 p-4 sm:p-5"
    >
      <div className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-3">
        QUICK ACCESS
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 font-mono text-xs">
        {/* PHYSICAL */}
        <div>
          <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-2">
            PHYSICAL
          </div>
          <div className="flex flex-col gap-1 text-slate-300">
            <button
              onClick={() => onNavigateToDomain('CARDIO')}
              className="text-left hover:text-cyan-300 transition py-0.5 cursor-pointer"
            >
              Cardio
            </button>
            <button
              onClick={() => onNavigateToDomain('RESPIRATORY')}
              className="text-left hover:text-cyan-300 transition py-0.5 cursor-pointer"
            >
              Respiratory
            </button>
            <button
              onClick={() => onNavigateToDomain('FITNESS')}
              className="text-left hover:text-cyan-300 transition py-0.5 cursor-pointer"
            >
              Fitness
            </button>
          </div>
        </div>

        {/* MENTAL */}
        <div>
          <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-2">
            MENTAL
          </div>
          <div className="flex flex-col gap-1 text-slate-300">
            <button
              onClick={() => onNavigateToDomain('COGNITIVE')}
              className="text-left hover:text-purple-300 transition py-0.5 cursor-pointer"
            >
              Cognitive
            </button>
            <button
              onClick={() => onNavigateToDomain('RECOVERY')}
              className="text-left hover:text-purple-300 transition py-0.5 cursor-pointer"
            >
              Sleep
            </button>
            <button
              onClick={() => onNavigateToDomain('COGNITIVE')}
              className="text-left hover:text-purple-300 transition py-0.5 cursor-pointer"
            >
              Wellbeing
            </button>
          </div>
        </div>

        {/* INTELLIGENCE */}
        <div>
          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-2">
            INTELLIGENCE
          </div>
          <div className="flex flex-col gap-1 text-slate-300">
            <button
              onClick={() => onNavigateTab('trends')}
              className="text-left hover:text-emerald-300 transition py-0.5 cursor-pointer"
            >
              Trends
            </button>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-left hover:text-emerald-300 transition py-0.5 cursor-pointer"
            >
              Alerts
            </button>
            <button
              onClick={() => onNavigateTab('astra-ai')}
              className="text-left hover:text-emerald-300 transition py-0.5 cursor-pointer"
            >
              ASTRA AI
            </button>
          </div>
        </div>

        {/* MISSION */}
        <div>
          <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-2">
            MISSION
          </div>
          <div className="flex flex-col gap-1 text-slate-300">
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-left hover:text-amber-300 transition py-0.5 cursor-pointer"
            >
              Timeline
            </button>
            <button
              onClick={() => onNavigateTab('mission')}
              className="text-left hover:text-amber-300 transition py-0.5 cursor-pointer"
            >
              Mission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
