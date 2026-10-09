/**
 * ASTRA Health - Mission Context View
 * Displays MARS-01 mission parameters, light delay (14.2 min), ECLSS environmental life support data,
 * NASA RadLab environment context, and NASA OSDR research reference links.
 */

import React, { useState } from 'react';
import { MissionContext } from '../../types/mission';
import { NasaRadiationContext, NasaSpaceWeatherEvent, NasaResearchItem } from '../../types/nasa';
import { NasaResearchView } from './NasaResearchView';
import { 
  Compass, 
  Radio, 
  Users, 
  Moon, 
  Dumbbell, 
  Shield, 
  Gauge, 
  Sun, 
  Activity, 
  BookOpen, 
  Bot, 
  Sparkles,
  Layers,
  Thermometer,
  Wind
} from 'lucide-react';

interface MissionViewProps {
  mission: MissionContext;
  nasaRadiation?: NasaRadiationContext | null;
  nasaSpaceWeather?: NasaSpaceWeatherEvent[];
  nasaResearch?: NasaResearchItem[];
  onAskAstra: (prompt: string) => void;
}

export const MissionView: React.FC<MissionViewProps> = ({ 
  mission, 
  nasaRadiation,
  nasaSpaceWeather = [],
  nasaResearch = [],
  onAskAstra 
}) => {
  const [activeTab, setActiveTab] = useState<'FLIGHT' | 'RESEARCH'>('FLIGHT');

  return (
    <div id="mission-context-view" className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/50">
            <Compass className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-slate-100 uppercase">
                MISSION CONTEXT • {mission.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                DEEP SPACE CRUISE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interplanetary trajectory, Deep Space Network (DSN) latency, habitat life support, and NASA space science data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('FLIGHT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'FLIGHT'
                  ? 'bg-cyan-600 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>FLIGHT & ECLSS</span>
            </button>
            <button
              onClick={() => setActiveTab('RESEARCH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'RESEARCH'
                  ? 'bg-cyan-600 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>NASA RESEARCH ({nasaResearch.length})</span>
            </button>
          </div>

          <button
            onClick={() => onAskAstra('Explain the mission communication delay and how ASTRA supports crew autonomy during blackouts.')}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>ASK ASTRA</span>
          </button>
        </div>
      </div>

      {activeTab === 'FLIGHT' && (
        <div className="space-y-4">
          {/* Flight Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-cyan-400" /> Mission Sol</span>
                <span className="text-cyan-400 font-bold">MET {mission.metDays}D</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-100">
                Sol {mission.sol}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Phase: {mission.missionPhase}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-amber-400" /> DSN Light Delay</span>
                <span className="text-amber-400 font-bold">One-Way</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-400">
                {mission.earthCommsDelayMinutes} <span className="text-xs text-slate-400">min</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Round-trip latency: ~28.4 min</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-emerald-400" /> Crew Complement</span>
                <span className="text-emerald-400 font-bold">Nominal</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-100">
                {mission.crewCount} <span className="text-xs text-slate-400">Astronauts</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Commander, Pilot, Eng, Specialist</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-purple-400" /> NASA RadLab Ambient</span>
                <span className="text-purple-400 font-bold">RAD Suite</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-purple-300">
                {nasaRadiation?.absorbedDoseRate || 482.4} <span className="text-xs text-slate-400">µGy/d</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">GCR & Solar Minimum Baseline</div>
            </div>

          </div>

          {/* Environmental Life Support System (ECLSS) Telemetry */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>HABITAT LIFE SUPPORT (ECLSS) ATMOSPHERIC TELEMETRY</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                ALL SUBSYSTEMS GREEN
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">Cabin CO2 Partial Pressure</div>
                <div className="text-lg font-bold font-mono text-slate-200 mt-1">0.32 <span className="text-xs text-slate-500">kPa</span></div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">Nominal (&lt;0.40 kPa)</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">Habitat Cabin Pressure</div>
                <div className="text-lg font-bold font-mono text-slate-200 mt-1">101.3 <span className="text-xs text-slate-500">kPa</span></div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">1.00 atm Standard</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">Oxygen Partial Concentration</div>
                <div className="text-lg font-bold font-mono text-slate-200 mt-1">21.0%</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">Nominal O2 balance</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">Cabin Temperature & Humidity</div>
                <div className="text-lg font-bold font-mono text-slate-200 mt-1">21.4°C <span className="text-xs text-slate-500">/ 48%</span></div>
                <div className="text-[10px] font-mono text-cyan-400 mt-1">Optimal Comfort Band</div>
              </div>
            </div>
          </div>

          {/* NASA Space Weather Status Banner */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>NASA DONKI SPACE WEATHER SYNOPSIS</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Source: NASA DONKI Stream
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 font-mono text-[10px]">Recent Solar Events</div>
                <div className="text-slate-200 font-medium">
                  {nasaSpaceWeather.length > 0 
                    ? `${nasaSpaceWeather[0].type} (${nasaSpaceWeather[0].eventID}) logged`
                    : 'Solar surface quiet. No high-energy SPE events.'}
                </div>
                <div className="text-slate-500 text-[10px] font-mono">
                  {nasaSpaceWeather[0]?.note?.slice(0, 90) || 'Interplanetary magnetic field nominal.'}...
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 font-mono text-[10px]">Radiation Telemetry Link</div>
                <div className="text-emerald-400 font-mono font-bold">
                  NASA RADLAB • {nasaRadiation?.dataStatus?.toUpperCase() || 'CACHED'}
                </div>
                <div className="text-slate-500 text-[10px] font-mono">
                  Absorbed dose: {nasaRadiation?.absorbedDoseRate || 482.4} µGy/day
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'RESEARCH' && (
        <NasaResearchView
          researchList={nasaResearch}
          onAskAstra={onAskAstra}
        />
      )}

    </div>
  );
};
