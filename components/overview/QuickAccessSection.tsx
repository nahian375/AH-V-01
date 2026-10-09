/**
 * ASTRA Health - Section 17: QUICK ACCESS / HEALTH MODULES
 * Organized into sleek, compact rows rather than a grid of giant cards.
 * 
 * Modules:
 * - CARDIOVASCULAR (Heart rate · HRV · BP →)
 * - RESPIRATORY (SpO₂ · respiratory rate →)
 * - SLEEP & RECOVERY (Sleep · fatigue · recovery →)
 * - FITNESS (Exercise · performance →)
 * - COGNITIVE (Reaction · memory · attention →)
 * - RADIATION (Exposure · cumulative dose →)
 * 
 * Plus secondary navigation (TRENDS, ASTRA AI, TIMELINE).
 */

import React from 'react';
import { 
  Heart, 
  Wind, 
  Moon, 
  Dumbbell, 
  Brain, 
  Radiation, 
  TrendingUp, 
  Bot, 
  History, 
  ArrowRight,
  LayoutGrid
} from 'lucide-react';
import { NavTab } from '../layout/Navigation';
import { HealthTabType } from '../modules/HealthView';

interface QuickAccessSectionProps {
  onNavigateTab: (tab: NavTab) => void;
  onNavigateHealthDomain: (domain: HealthTabType) => void;
}

export const QuickAccessSection: React.FC<QuickAccessSectionProps> = ({
  onNavigateTab,
  onNavigateHealthDomain,
}) => {
  const healthModules = [
    {
      id: 'cardio',
      name: 'CARDIOVASCULAR',
      desc: 'Heart rate · HRV · BP',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      onClick: () => onNavigateHealthDomain('CARDIO'),
    },
    {
      id: 'respiratory',
      name: 'RESPIRATORY',
      desc: 'SpO₂ · respiratory rate',
      icon: <Wind className="w-4 h-4 text-cyan-400" />,
      onClick: () => onNavigateHealthDomain('RESPIRATORY'),
    },
    {
      id: 'recovery',
      name: 'SLEEP & RECOVERY',
      desc: 'Sleep · fatigue · recovery',
      icon: <Moon className="w-4 h-4 text-purple-400" />,
      onClick: () => onNavigateHealthDomain('RECOVERY'),
    },
    {
      id: 'fitness',
      name: 'FITNESS',
      desc: 'Exercise · performance',
      icon: <Dumbbell className="w-4 h-4 text-emerald-400" />,
      onClick: () => onNavigateHealthDomain('FITNESS'),
    },
    {
      id: 'cognitive',
      name: 'COGNITIVE',
      desc: 'Reaction · memory · attention',
      icon: <Brain className="w-4 h-4 text-cyan-400" />,
      onClick: () => onNavigateHealthDomain('COGNITIVE'),
    },
    {
      id: 'radiation',
      name: 'RADIATION',
      desc: 'Exposure · cumulative dose',
      icon: <Radiation className="w-4 h-4 text-amber-400" />,
      onClick: () => onNavigateHealthDomain('RADIATION'),
    },
  ];

  const secondaryShortcuts = [
    {
      id: 'trends',
      name: 'TRENDS',
      desc: 'Longitudinal baseline tracking & drift analysis',
      icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
      onClick: () => onNavigateTab('trends'),
    },
    {
      id: 'astra-ai',
      name: 'ASTRA AI',
      desc: 'Clinical decision support & natural language query',
      icon: <Bot className="w-4 h-4 text-purple-400" />,
      onClick: () => onNavigateTab('astra-ai'),
    },
    {
      id: 'timeline',
      name: 'TIMELINE',
      desc: 'Chronological sol event log & synchronizations',
      icon: <History className="w-4 h-4 text-slate-400" />,
      onClick: () => onNavigateTab('timeline'),
    },
  ];

  return (
    <section 
      id="section-quick-access"
      aria-label="Health Modules Quick Access"
      className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-mono font-black tracking-wider text-slate-100 uppercase">
            HEALTH MODULES
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Direct Medical Subsystem Navigation
        </span>
      </div>

      {/* 6 Core Health Modules Organized as Compact Rows (2-column layout on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {healthModules.map((item) => (
          <button
            key={item.id}
            id={`quick-access-${item.id}`}
            onClick={item.onClick}
            className="group px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.18)] hover:bg-slate-900 transition flex items-center justify-between gap-3 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_8px_rgba(6,182,212,0.3)] transition">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-mono font-black text-slate-100 group-hover:text-cyan-300 transition truncate">
                  {item.name}
                </div>
                <div className="text-xs font-sans text-slate-300 truncate mt-0.5">
                  {item.desc}
                </div>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        ))}
      </div>

      {/* Secondary Subsystem Shortcuts */}
      <div className="pt-2.5 border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {secondaryShortcuts.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 text-left flex items-center justify-between gap-2.5 cursor-pointer transition text-xs sm:text-sm font-mono group"
            >
              <div className="flex items-center gap-2.5 truncate">
                {item.icon}
                <span className="font-black text-slate-200 group-hover:text-cyan-300 transition truncate">
                  {item.name}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
