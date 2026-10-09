/**
 * ASTRA Health - Section 6: GLOBAL SYSTEM STATUS
 * Thin operational status strip placed directly below the header.
 * 
 * Online state:
 * SYSTEM NOMINAL • HEALTH ENGINE ACTIVE • LOCAL STORAGE READY • AI READY • SYNC COMPLETE
 * 
 * Offline / Comms Loss state:
 * COMMUNICATION UNAVAILABLE • LOCAL HEALTH ENGINE ACTIVE • LOCAL AI ACTIVE • X RECORDS PENDING SYNC
 */

import React from 'react';
import { ConnectionState } from '../../services/connectivityManager';
import { AIMode, AISource } from '../../types/ai';
import { HealthSeverity } from '../../types/health';

interface SystemStatusBarProps {
  connectionState: ConnectionState;
  aiMode: AIMode;
  activeAiSource: AISource;
  syncPendingCount: number;
  overallSeverity?: HealthSeverity;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  connectionState,
  aiMode,
  activeAiSource,
  syncPendingCount,
  overallSeverity = 'GREEN',
}) => {
  const isOffline = connectionState === 'COMMS_BLACKOUT' || aiMode === 'OFFLINE';
  const isSyncPending = syncPendingCount > 0;

  return (
    <div 
      id="global-system-status-bar"
      aria-label="Global Autonomous System Status"
      className="bg-slate-950 border-b border-slate-800/80 px-4 py-2 font-mono text-xs select-none shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          {/* Status Indicator Dot */}
          <span 
            className={`w-2 h-2 rounded-full ${
              isOffline 
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                : overallSeverity === 'RED'
                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse'
                : overallSeverity === 'ORANGE'
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
            }`} 
          />

          {isOffline ? (
            <div className="flex items-center gap-2 text-amber-300">
              <span className="font-black tracking-wide">COMMUNICATION UNAVAILABLE</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-200">LOCAL HEALTH ENGINE ACTIVE</span>
              <span className="text-slate-600">|</span>
              <span className="text-purple-300 font-bold">LOCAL AI ACTIVE</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-black">
                {syncPendingCount > 0 ? `${syncPendingCount} RECORDS PENDING SYNC` : 'LOCAL QUEUE READY'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <span className={`font-black tracking-wide ${overallSeverity === 'GREEN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {overallSeverity === 'GREEN' ? 'SYSTEM NOMINAL' : 'HEALTH MONITORING ACTIVE'}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-200">HEALTH ENGINE ACTIVE</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-200">LOCAL STORAGE READY</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-bold">
                {activeAiSource.includes('GEMINI') ? 'GEMINI CLOUD READY' : 'AI READY'}
              </span>
              <span className="text-slate-600">|</span>
              <span className={isSyncPending ? 'text-amber-400 font-black' : 'text-emerald-400 font-black'}>
                {isSyncPending ? `${syncPendingCount} SYNC QUEUED` : 'SYNC COMPLETE'}
              </span>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
          <span className="font-semibold text-slate-400">DETERMINISTIC SAFETY BUS</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold">INDEXEDDB ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
};
