import React, { useState } from 'react';
import { DashboardViewModel } from '../../health/dashboardViewModel';
import { TrendingUp, ArrowRight, LineChart, ChevronDown, ChevronUp, Layers, Activity, Moon, Brain, Compass } from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';

interface WhatChangedCardProps {
  changes: DashboardViewModel['changes'];
  changeSummary: string;
  onNavigateTrends: () => void;
  spaceContextCategories?: {
    category: 'PHYSICAL' | 'RECOVERY' | 'NEURAL' | 'MISSION CONTEXT';
    items: {
      label: string;
      changeText: string;
      direction: 'UP' | 'DOWN' | 'STABLE';
      contextNote: string;
    }[];
  }[];
}

export const WhatChangedCard: React.FC<WhatChangedCardProps> = ({
  changes,
  changeSummary,
  onNavigateTrends,
  spaceContextCategories,
}) => {
  const [showInContext, setShowInContext] = useState(false);

  const handleTrendsClick = () => {
    spaceAudio.playClick();
    onNavigateTrends();
  };

  const toggleInContext = () => {
    spaceAudio.playClick();
    setShowInContext(prev => !prev);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'PHYSICAL': return <Activity className="w-3.5 h-3.5 text-rose-400" />;
      case 'RECOVERY': return <Moon className="w-3.5 h-3.5 text-purple-400" />;
      case 'NEURAL': return <Brain className="w-3.5 h-3.5 text-pink-400" />;
      case 'MISSION CONTEXT':
      default: return <Compass className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <section 
      id="dashboard-what-changed"
      aria-label="What Changed and Health Trends"
      className="bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl shadow-black/40 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: What Changed Intelligence */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold font-mono tracking-widest text-slate-100 uppercase">
                {showInContext ? 'WHAT CHANGED IN CONTEXT' : 'WHAT CHANGED?'}
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/70">
                14-Day Baseline Delta
              </span>
            </div>

            <button
              onClick={toggleInContext}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>{showInContext ? 'STANDARD VIEW' : 'IN CONTEXT VIEW'}</span>
              {showInContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {!showInContext ? (
            <>
              {/* 3 Metric Delta Pills */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                {changes.map((change) => {
                  const isUp = change.direction === 'UP';
                  return (
                    <div 
                      key={change.name}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-2 shadow-inner"
                    >
                      <span className="text-xs font-mono font-medium text-slate-300 truncate">
                        {change.name}
                      </span>
                      <span className={`text-xs font-mono font-bold ${isUp ? 'text-amber-400' : 'text-rose-400'}`}>
                        {change.deltaStr}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {changeSummary}
              </p>
            </>
          ) : (
            /* Categorized In Context View (Section 14) */
            <div className="space-y-2.5 my-2 animate-fadeIn font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {(spaceContextCategories || [
                  {
                    category: 'PHYSICAL' as const,
                    items: [{ label: 'Resting HR', changeText: '↑ 8% (72 bpm)', direction: 'UP' as const, contextNote: 'Above 14-day flight baseline (67 bpm)' }],
                  },
                  {
                    category: 'RECOVERY' as const,
                    items: [{ label: 'Sleep', changeText: '↓ 1.2 h (5.9h)', direction: 'DOWN' as const, contextNote: 'Concurrent with high duty shifts' }],
                  },
                  {
                    category: 'NEURAL' as const,
                    items: [{ label: 'Reaction Time', changeText: '242 ms (Stable)', direction: 'STABLE' as const, contextNote: 'Within nominal cognitive baseline' }],
                  },
                  {
                    category: 'MISSION CONTEXT' as const,
                    items: [{ label: 'Radiation', changeText: '0.45 mSv today', direction: 'STABLE' as const, contextNote: 'Personal dosimeter active; NASA rate quiet' }],
                  },
                ]).map((cat) => (
                  <div key={cat.category} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {getCategoryIcon(cat.category)}
                      <span>{cat.category}</span>
                    </div>
                    {cat.items.map((item, idx) => (
                      <div key={idx} className="pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 text-[11px] font-semibold">{item.label}</span>
                          <span className={`text-[11px] font-bold ${
                            item.direction === 'UP' ? 'text-amber-400' : item.direction === 'DOWN' ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {item.changeText}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-tight">
                          {item.contextNote}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-sans italic pt-1">
                Note: Environmental and physiological changes are recorded concurrently without claiming unproven causation.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Health Trends Call-to-Action & Entry Point */}
        <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-800/80 md:pl-5">
          <div className="text-[11px] font-mono text-slate-400 max-w-xs hidden sm:block">
            View cardiovascular, respiratory, sleep, cognitive, and wellbeing telemetry trends.
          </div>
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={handleTrendsClick}
              className="flex-1 space-capsule-btn space-capsule-btn-primary text-xs py-2 px-4 shadow-md"
            >
              <LineChart className="w-3.5 h-3.5 text-slate-950" />
              <span>VIEW 14-DAY TRENDS</span>
              <ArrowRight className="w-3 h-3 text-slate-950" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
