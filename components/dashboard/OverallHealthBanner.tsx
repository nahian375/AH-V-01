/**
 * ASTRA Health - Overall Health Status Banner
 * High-visibility mission control health condition display (GREEN / YELLOW / ORANGE / RED).
 */

import React from 'react';
import { HealthSeverity, HealthStatusText } from '../../types/health';
import { ShieldAlert, ShieldCheck, AlertCircle, AlertTriangle, Sparkles, MessageSquare, ClipboardEdit, Info } from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';

interface OverallHealthBannerProps {
  severity: HealthSeverity;
  statusText: HealthStatusText;
  sol: number;
  crewName: string;
  callsign: string;
  summaryText: string;
  onOpenWhatChanged: () => void;
  onOpenAI: (initialPrompt?: string) => void;
  onOpenCheckIn: () => void;
}

export const OverallHealthBanner: React.FC<OverallHealthBannerProps> = ({
  severity,
  statusText,
  sol,
  crewName,
  callsign,
  summaryText,
  onOpenWhatChanged,
  onOpenAI,
  onOpenCheckIn,
}) => {
  const statusConfig = {
    GREEN: {
      bg: 'bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      subtext: 'All vital signs are tracking within your personalized 14-day rolling baseline equilibrium.',
    },
    BLUE: {
      bg: 'bg-cyan-950/40 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      icon: <Info className="w-6 h-6 text-cyan-400" />,
      subtext: 'Operational check-in reminder or informational update.',
    },
    YELLOW: {
      bg: 'bg-amber-950/40 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      icon: <AlertCircle className="w-6 h-6 text-amber-400" />,
      subtext: 'Mild single-metric divergence observed. Routine monitoring recommended.',
    },
    ORANGE: {
      bg: 'bg-amber-950/60 border-amber-500/60 shadow-[0_0_24px_rgba(245,158,11,0.3)]',
      badge: 'bg-amber-500/30 text-amber-300 border-amber-500/60',
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      subtext: 'Multiple physiological indicators have moved away from your personal baseline. Autonomic recovery debt detected.',
    },
    RED: {
      bg: 'bg-rose-950/70 border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.35)] animate-pulse',
      badge: 'bg-rose-500/40 text-rose-200 border-rose-500/70',
      icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
      subtext: 'Critical physiological threshold divergence detected. Immediate operational protocol advised.',
    },
  }[severity] || {
    bg: 'bg-emerald-950/40 border-emerald-500/40',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    subtext: 'All vital signs are tracking within your personalized 14-day rolling baseline equilibrium.',
  };

  const handleWhatChanged = () => {
    spaceAudio.playClick();
    onOpenWhatChanged();
  };

  const handleAskAstra = () => {
    spaceAudio.playQuindar();
    onOpenAI('What changed this week?');
  };

  const handleCheckIn = () => {
    spaceAudio.playClick();
    onOpenCheckIn();
  };

  return (
    <div 
      id="overall-health-status-banner"
      className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-md transition-all relative overflow-hidden ${statusConfig.bg}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Astronaut + Overall Health Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
            {statusConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Astronaut: <strong className="text-slate-200">{crewName}</strong> ({callsign}) • Sol {sol}
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider border ${statusConfig.badge}`}>
                STATUS: {statusText}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1 font-mono tracking-tight">
              {summaryText}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-sans max-w-3xl leading-relaxed">
              {statusConfig.subtext}
            </p>
          </div>
        </div>

        {/* Right: Signature Aerodynamic Capsule Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            id="btn-banner-what-changed"
            onClick={handleWhatChanged}
            className="space-capsule-btn space-capsule-btn-primary text-xs py-2 px-3.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>WHAT CHANGED?</span>
          </button>

          <button
            id="btn-banner-ask-astra"
            onClick={handleAskAstra}
            className="space-capsule-btn space-capsule-btn-glass text-cyan-300 text-xs py-2 px-3.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>ASK ASTRA</span>
          </button>

          <button
            id="btn-banner-checkin"
            onClick={handleCheckIn}
            className="space-capsule-btn space-capsule-btn-glass text-amber-300 text-xs py-2 px-3.5"
          >
            <ClipboardEdit className="w-3.5 h-3.5 text-amber-400" />
            <span>CHECK-IN</span>
          </button>
        </div>

      </div>
    </div>
  );
};
