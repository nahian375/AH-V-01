/**
 * ASTRA Health - Banners (Offline Mode Status, Comms Loss & Disclaimer)
 * Follows exact NASA aerospace guidelines for non-alarming offline indicators.
 */

import React from 'react';
import { 
  AlertTriangle, 
  Radio, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  PauseCircle,
  Database,
  Activity
} from 'lucide-react';

interface OfflineModeBannerProps {
  isOfflineMode: boolean;
  onSwitchOnline: () => void;
}

export const OfflineModeBanner: React.FC<OfflineModeBannerProps> = ({ isOfflineMode, onSwitchOnline }) => {
  if (!isOfflineMode) return null;

  return (
    <div 
      id="offline-mode-status-banner"
      className="bg-slate-900 border-b border-amber-500/30 px-4 py-2.5 text-slate-200 text-xs font-mono shadow-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-600/60 text-amber-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>OFFLINE MODE</span>
          </div>
          
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>ASTRA CORE ACTIVE</span>
          </div>

          <span className="hidden md:inline text-slate-400 text-[11px] font-sans">
            "Cloud communication is disabled. Local health intelligence remains available."
          </span>
        </div>

        {/* Feature status badges */}
        <div className="flex items-center gap-3 text-[11px] text-slate-300 flex-wrap">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Local AI <strong className="text-emerald-400">Available</strong>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Local Health Engine <strong className="text-emerald-400">Active</strong>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Local Data <strong className="text-emerald-400">Available</strong>
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <PauseCircle className="w-3.5 h-3.5 text-amber-400" /> Cloud Sync: Paused
          </span>

          <button
            onClick={onSwitchOnline}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-bold transition cursor-pointer text-[10px]"
          >
            SWITCH ONLINE
          </button>
        </div>
      </div>
    </div>
  );
};

interface CommsLossBannerProps {
  isCommsLoss: boolean;
  onRestore: () => void;
}

export const CommsLossBanner: React.FC<CommsLossBannerProps> = ({ isCommsLoss, onRestore }) => {
  if (!isCommsLoss) return null;

  return (
    <div 
      id="comms-loss-alert-banner"
      className="bg-rose-950/90 border-b border-rose-700/80 px-4 py-2 text-rose-100 flex items-center justify-between gap-4 text-xs font-mono"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
        <Radio className="w-4 h-4 text-rose-400" />
        <span>
          <strong className="tracking-wider">EARTH COMMUNICATION UNAVAILABLE:</strong> All local telemetry monitoring, deterministic safety rules, and Local ASTRA AI assistant remain 100% operational offline.
        </span>
      </div>
      <button
        id="restore-comms-btn"
        onClick={onRestore}
        className="px-3 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs tracking-wide transition shrink-0 cursor-pointer shadow-xs"
      >
        RESTORE COMMUNICATION
      </button>
    </div>
  );
};

export const DisclaimerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = React.useState(() => {
    return localStorage.getItem('astra_disclaimer_dismissed') === 'true';
  });

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('astra_disclaimer_dismissed', 'true');
  };

  return (
    <div className="bg-slate-900/95 border-b border-slate-800/80 px-4 py-1 text-[11px] text-slate-400 flex items-center justify-between font-mono">
      <div className="flex items-center gap-2 overflow-hidden">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate">
          <strong className="text-slate-300">RESEARCH PROTOTYPE:</strong> Decision-support for deep-space flight surgeons. Non-diagnostic.
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
        <span className="hidden sm:inline text-slate-500 text-[10px]">Deep Space Telemetry</span>
        <button
          onClick={handleDismiss}
          className="text-slate-500 hover:text-slate-300 underline text-[10px]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
