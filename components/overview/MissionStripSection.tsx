/**
 * ASTRA Health - Section 18: MISSION CONTEXT
 * Operational mission-context strip placed near the bottom of the overview page.
 * 
 * Items per Section 18:
 * - MISSION: MARS-01
 * - SOL: 184
 * - PHASE: CRUISE
 * - CREW: 4 / 4
 * - COMMUNICATION: ONLINE / OFFLINE
 * - RADIATION ENVIRONMENT: MODERATE
 * - SLEEP WINDOW: 22:00–06:00
 * - EXERCISE WINDOW: 10:00–11:00
 */

import React from 'react';
import { Rocket, Users, Radio, Shield, Moon, Dumbbell, ExternalLink } from 'lucide-react';

interface MissionStripSectionProps {
  missionName?: string;
  sol: number;
  phase?: string;
  crewCount?: number;
  isOnline: boolean;
  radiationLevel?: string;
  sleepWindow?: string;
  exerciseWindow?: string;
  onNavigateToMission: () => void;
}

export const MissionStripSection: React.FC<MissionStripSectionProps> = ({
  missionName = 'MARS-01',
  sol,
  phase = 'CRUISE',
  crewCount = 4,
  isOnline,
  radiationLevel = 'MODERATE',
  sleepWindow = '22:00–06:00',
  exerciseWindow = '10:00–11:00',
  onNavigateToMission,
}) => {
  return (
    <section 
      id="section-mission-context"
      aria-label="Mission Context Strip"
      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs sm:text-sm shadow-xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 text-slate-300">
        
        {/* Left Group: Mission, Sol, Phase, Crew */}
        <div className="flex items-center gap-3.5 sm:gap-5 flex-wrap">
          
          {/* MISSION */}
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-400 uppercase text-xs font-bold">MISSION:</span>
            <span className="font-black text-slate-100">{missionName}</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* SOL */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase text-xs font-bold">SOL:</span>
            <span className="font-black text-amber-400 text-sm">{sol}</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* PHASE */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase text-xs font-bold">PHASE:</span>
            <span className="font-bold text-slate-200 uppercase">{phase}</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* CREW */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-slate-400 uppercase text-xs font-bold">CREW:</span>
            <span className="font-black text-slate-100">{crewCount} / {crewCount}</span>
          </div>

        </div>

        {/* Right Group: Communication, Radiation, Sleep Window, Exercise Window */}
        <div className="flex items-center gap-3.5 sm:gap-5 flex-wrap">
          
          {/* COMMUNICATION */}
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400 uppercase text-xs font-bold">COMMUNICATION:</span>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-amber-400'}`} />
            <span className={isOnline ? 'text-emerald-400 font-black' : 'text-amber-400 font-black'}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* RADIATION */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-400 uppercase text-xs font-bold">RADIATION:</span>
            <span className="text-amber-300 font-black">{radiationLevel}</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* SLEEP WINDOW */}
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-slate-400 uppercase text-xs font-bold">SLEEP:</span>
            <span className="text-slate-200 font-semibold">{sleepWindow}</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* EXERCISE WINDOW */}
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400 uppercase text-xs font-bold">EXERCISE:</span>
            <span className="text-slate-200 font-semibold">{exerciseWindow}</span>
          </div>

          {/* Details Link */}
          <button
            onClick={onNavigateToMission}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 text-xs font-black cursor-pointer flex items-center gap-1.5 transition"
          >
            <span>DETAILS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </section>
  );
};
