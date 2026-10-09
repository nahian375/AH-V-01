/**
 * ASTRA Health - Section 19: RECENT HEALTH TIMELINE
 * Compact timeline near the bottom of the overview page.
 * 
 * Layout per Section 19:
 * Title: RECENT ACTIVITY
 * Items:
 * - 09:41 Vital measurement recorded
 * - 08:42 Recovery attention detected
 * - 08:20 Daily health check completed
 * - 07:55 Sleep data synchronized
 * 
 * Each item is clickable to open the full timeline or relevant event.
 * Button: [ VIEW FULL TIMELINE ]
 */

import React from 'react';
import { TimelineEvent } from '../../types/mission';
import { History, Activity, AlertCircle, CheckCircle2, RefreshCw, ChevronRight } from 'lucide-react';

interface RecentTimelineSectionProps {
  timeline?: TimelineEvent[];
  onNavigateToTimeline: () => void;
}

export const RecentTimelineSection: React.FC<RecentTimelineSectionProps> = ({
  timeline = [],
  onNavigateToTimeline,
}) => {
  // Use real events if available, or populate with realistic mission events
  const defaultEvents = [
    {
      id: 'evt-1',
      time: '09:41',
      title: 'Vital measurement recorded',
      category: 'VITALS',
      icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
      dotColor: 'bg-cyan-400',
    },
    {
      id: 'evt-2',
      time: '08:42',
      title: 'Recovery attention detected',
      category: 'ALERTS',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
      dotColor: 'bg-amber-400',
    },
    {
      id: 'evt-3',
      time: '08:20',
      title: 'Daily health check completed',
      category: 'CHECK_IN',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      dotColor: 'bg-emerald-400',
    },
    {
      id: 'evt-4',
      time: '07:55',
      title: 'Sleep data synchronized',
      category: 'SLEEP',
      icon: <RefreshCw className="w-3.5 h-3.5 text-purple-400" />,
      dotColor: 'bg-purple-400',
    },
  ];

  const displayEvents = timeline.length >= 4 
    ? timeline.slice(0, 4).map(e => ({
        id: e.id,
        time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: e.title,
        category: e.category,
        icon: e.category === 'ALERTS' 
          ? <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          : e.category === 'VITALS'
          ? <Activity className="w-3.5 h-3.5 text-cyan-400" />
          : e.category === 'CHECK_IN'
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          : <RefreshCw className="w-3.5 h-3.5 text-purple-400" />,
        dotColor: e.severity === 'RED' ? 'bg-rose-500' : e.severity === 'ORANGE' ? 'bg-amber-400' : 'bg-emerald-400',
      }))
    : defaultEvents;

  return (
    <section 
      id="section-recent-timeline"
      aria-label="Recent Health Activity Timeline"
      className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 shadow-sm space-y-3.5"
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-mono font-black tracking-wider text-slate-100 uppercase">
            RECENT ACTIVITY
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Continuous Autonomous Sol Log
        </span>
      </div>

      {/* Clickable Events List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayEvents.map((evt) => (
          <div
            key={evt.id}
            onClick={onNavigateToTimeline}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.18)] hover:bg-slate-900 transition flex items-center justify-between gap-3 cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 group-hover:border-cyan-400/50 transition">
                {evt.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-mono text-cyan-400 font-black">
                  {evt.time}
                </div>
                <div className="text-xs sm:text-sm font-sans text-slate-100 group-hover:text-cyan-300 transition truncate mt-0.5">
                  {evt.title}
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0" />
          </div>
        ))}
      </div>

      {/* Button: [ VIEW FULL TIMELINE ] - Space Command Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onNavigateToTimeline}
          className="space-cmd-btn-secondary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-black tracking-wider cursor-pointer"
        >
          <span>VIEW FULL TIMELINE</span>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </section>
  );
};
