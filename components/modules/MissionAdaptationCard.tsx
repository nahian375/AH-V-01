/**
 * ASTRA Health - Mission Adaptation Summary View
 * Summarizes physiological adaptation across spaceflight domains using
 * objective status tags (Stable, Changing, Monitoring, Insufficient Data).
 */

import React from 'react';
import { ShieldCheck, Heart, Brain, Moon, BatteryCharging, Dumbbell, Radiation, Wind, Activity } from 'lucide-react';
import { MissionAdaptationDomain } from '../../types/spaceContext';

interface MissionAdaptationCardProps {
  domains: MissionAdaptationDomain[];
  onNavigateTab?: (tab: any) => void;
  className?: string;
}

export const MissionAdaptationCard: React.FC<MissionAdaptationCardProps> = ({
  domains,
  onNavigateTab,
  className = '',
}) => {
  const getDomainIcon = (domain: MissionAdaptationDomain['domain']) => {
    switch (domain) {
      case 'CARDIOVASCULAR': return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'NEURAL': return <Brain className="w-3.5 h-3.5 text-pink-400" />;
      case 'SLEEP': return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'RECOVERY': return <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />;
      case 'FITNESS': return <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />;
      case 'RADIATION': return <Radiation className="w-3.5 h-3.5 text-amber-400" />;
      case 'RESPIRATORY': return <Wind className="w-3.5 h-3.5 text-sky-400" />;
      default: return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: MissionAdaptationDomain['status']) => {
    switch (status) {
      case 'STABLE':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-[10px]">STABLE</span>;
      case 'CHANGING':
        return <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-800 text-sky-400 font-bold text-[10px]">CHANGING</span>;
      case 'MONITORING':
        return <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800 text-amber-400 font-bold text-[10px]">MONITORING</span>;
      case 'INSUFFICIENT_DATA':
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400 font-bold text-[10px]">INSUFFICIENT DATA</span>;
    }
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden font-mono text-xs ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 via-cyan-500/30 to-emerald-500/50" />

      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-slate-100 tracking-wider uppercase text-sm">
            MISSION ADAPTATION OVERVIEW
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">
          MULTISYSTEM SURVEILLANCE
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {domains.map((dom) => (
          <div key={dom.domain} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                {getDomainIcon(dom.domain)}
                <span>{dom.label}</span>
              </div>
              {getStatusBadge(dom.status)}
            </div>

            <div className="text-[11px] font-bold text-cyan-300">
              {dom.primaryMetric}
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              {dom.trendSummary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
