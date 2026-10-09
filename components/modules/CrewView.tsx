/**
 * ASTRA Health - Crew & Role-Based Monitoring View
 * Displays crew health overview and lets reviewers toggle between roles:
 * - Astronaut (Self-monitoring)
 * - Medical Officer (Crew triage & privacy-preserving summaries)
 * - Mission Control (Uplink / Sync telemetry)
 * - System Engineer (Offline model & DB diagnostic)
 */

import React from 'react';
import { CrewMember, HealthSeverity } from '../../types/health';
import { Users, ShieldCheck, Heart, Moon, ShieldAlert, AlertTriangle, AlertCircle, UserCheck } from 'lucide-react';

interface CrewViewProps {
  crew: CrewMember[];
  currentRole: 'Astronaut' | 'Medical Officer' | 'Mission Control' | 'Administrator';
  onSelectRole: (role: 'Astronaut' | 'Medical Officer' | 'Mission Control' | 'Administrator') => void;
  onAskAstra: (prompt: string) => void;
}

export const CrewView: React.FC<CrewViewProps> = ({
  crew,
  currentRole,
  onSelectRole,
  onAskAstra,
}) => {
  const getStatusBadge = (status: HealthSeverity) => {
    switch (status) {
      case 'ORANGE':
        return {
          bg: 'bg-amber-950/60 border-amber-500/60 text-amber-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'ATTENTION',
        };
      case 'YELLOW':
        return {
          bg: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'MONITOR',
        };
      case 'RED':
        return {
          bg: 'bg-rose-950/60 border-rose-500/60 text-rose-200',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
          label: 'CRITICAL',
        };
      case 'GREEN':
      default:
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'STABLE',
        };
    }
  };

  return (
    <div id="crew-monitoring-view" className="space-y-4">
      
      {/* Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100">
              CREW HEALTH MATRIX & MULTI-ROLE MONITORING
            </h2>
            <p className="text-xs text-slate-400">
              Active mission complement physiological triage and privacy boundaries
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 px-2 hidden lg:inline">Active View:</span>
          {(['Astronaut', 'Medical Officer', 'Mission Control', 'Administrator'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onSelectRole(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                currentRole === r
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Role Context Bar */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span>
            Current Viewing Context: <strong className="text-cyan-300">{currentRole}</strong> — {
              currentRole === 'Medical Officer'
                ? 'Crew-wide readiness monitoring with autonomous triage prioritization.'
                : currentRole === 'Astronaut'
                ? 'Personal astronaut health dashboard with private subjective logging.'
                : currentRole === 'Mission Control'
                ? 'Uplink batch telemetry packet review and trend synchronization.'
                : 'System telemetry, WebGPU model status, and IndexedDB sync queue diagnostics.'
            }
          </span>
        </div>
      </div>

      {/* Crew Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {crew.map((member) => {
          const badge = getStatusBadge(member.status);
          const isCommander = member.id === 'sarah-chen';

          return (
            <div
              key={member.id}
              className={`p-5 rounded-2xl border transition backdrop-blur-sm ${
                isCommander && member.status === 'ORANGE'
                  ? 'bg-amber-950/20 border-amber-500/40 glow-amber'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Top Row: Name, Role, Status */}
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sm font-bold font-mono text-slate-200">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                      <span>{member.name}</span>
                      <span className="text-xs text-slate-400 font-normal">({member.callsign})</span>
                    </h3>
                    <div className="text-[11px] font-mono text-cyan-400">
                      {member.role}
                    </div>
                  </div>
                </div>

                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${badge.bg}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
              </div>

              {/* Vitals Summary Row */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> Resting HR
                  </div>
                  <div className="text-base font-bold text-slate-200 mt-0.5">
                    {member.restingHr} <span className="text-[10px] text-slate-500">bpm</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{member.keyMetricSummary}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Moon className="w-3 h-3 text-cyan-400" /> Sleep Volume
                  </div>
                  <div className="text-base font-bold text-slate-200 mt-0.5">
                    {member.sleepHours} <span className="text-[10px] text-slate-500">hrs</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Sol {member.lastCheckInSol} check-in</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onAskAstra(`Review crew readiness for ${member.name} (${member.role})`)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>QUERY ASTRA ON {member.callsign.toUpperCase()}</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
