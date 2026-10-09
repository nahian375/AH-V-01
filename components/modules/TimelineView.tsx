/**
 * ASTRA Health - Timeline View
 * Chronological health events log with category filter chips and sync statuses.
 */

import React, { useState } from 'react';
import { TimelineEvent } from '../../types/mission';
import { History, Filter, CheckCircle2, AlertTriangle, Activity, Moon, Dumbbell, Sparkles, Radiation } from 'lucide-react';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  sol: number;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline, sol }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filtered = timeline.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'RADIATION':
        return <Radiation className="w-4 h-4 text-amber-400" />;
      case 'VITALS':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'SLEEP':
        return <Moon className="w-4 h-4 text-purple-400" />;
      case 'EXERCISE':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'ALERTS':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'CHECK_IN':
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case 'AI':
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div id="timeline-view" className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
            <History className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100">
              MISSION HEALTH TIMELINE • AUDIT LOG
            </h2>
            <p className="text-xs text-slate-400">
              Chronological log of telemetry measurements, check-ins, AI queries, and safety events
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['ALL', 'RADIATION', 'ALERTS', 'VITALS', 'SLEEP', 'EXERCISE', 'CHECK_IN', 'AI'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
          {filtered.map((event) => (
            <div key={event.id} className="relative pl-6">
              
              {/* Event Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>

              {/* Event Content */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(event.category)}
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                      {event.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {event.category}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Sol {event.sol} • {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  {event.description}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
