/**
 * ASTRA Health - Simulation Dock (NASA Reviewer Controls)
 * Interactive demo controls for evaluating multi-metric drift, comms loss, sync, and baseline reset.
 */

import React, { useState } from 'react';
import { ConnectionState } from '../../services/connectivityManager';
import { Play, Radio, Wifi, RotateCcw, Layers, ChevronDown, ChevronUp, Sliders, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';

interface SimulationBarProps {
  connectionState: ConnectionState;
  simulationActive: boolean;
  onStartHealthEvent: () => void;
  onToggleCommsLoss: (enable: boolean) => void;
  onResetBaseline: () => void;
  onShowArchitecture: () => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  connectionState,
  simulationActive,
  onStartHealthEvent,
  onToggleCommsLoss,
  onResetBaseline,
  onShowArchitecture,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCommsLoss = connectionState === 'COMMS_BLACKOUT';

  const handleStartDrift = () => {
    spaceAudio.playExecute();
    onStartHealthEvent();
  };

  const handleToggleComms = (enable: boolean) => {
    spaceAudio.playQuindar();
    onToggleCommsLoss(enable);
  };

  const handleReset = () => {
    spaceAudio.playClick();
    onResetBaseline();
  };

  const handleArch = () => {
    spaceAudio.playClick();
    onShowArchitecture();
  };

  return (
    <div 
      id="simulation-controls-dock"
      className="rounded-2xl bg-slate-950/85 border border-slate-800/90 p-3 sm:p-3.5 backdrop-blur-md shadow-lg transition-all relative overflow-hidden"
    >
      {/* Top Header Strip with Status & Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-200 tracking-wider">
              DEMO SIMULATION DOCK
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="flex items-center gap-2">
              {simulationActive ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Health Drift Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Nominal Baseline
                </span>
              )}

              {isCommsLoss ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-600/60 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Comms Blackout
                </span>
              ) : (
                <span className="hidden md:flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Earth Uplink OK
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Expand / Collapse Capsule Button */}
        <button
          id="btn-toggle-sim-dock"
          onClick={() => {
            spaceAudio.playClick();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition cursor-pointer shrink-0"
        >
          <span>{isExpanded ? 'Hide Scenarios' : 'Simulate Scenarios'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Expanded Controls Drawer */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
            Test astronaut multi-metric drift, verify offline Local AI continuity during comms blackout, or inspect the dual-engine architecture.
          </p>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
            {/* 1. START HEALTH EVENT */}
            <button
              id="btn-sim-health-event"
              onClick={handleStartDrift}
              className={`space-capsule-btn text-xs py-1.5 px-3.5 ${
                simulationActive
                  ? 'bg-amber-600 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-700/70'
              }`}
              title="Inject multi-metric drift: Sleep compressed (-18%), HRV depressed (-29%), Resting HR elevated (+9%)"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{simulationActive ? 'DRIFT ACTIVE' : 'INJECT DRIFT'}</span>
            </button>

            {/* 2. SIMULATE COMMS LOSS / RESTORE */}
            {isCommsLoss ? (
              <button
                id="btn-sim-restore-comms"
                onClick={() => handleToggleComms(false)}
                className="space-capsule-btn space-capsule-btn-emerald text-xs py-1.5 px-3.5"
                title="Restore Earth connectivity and trigger sync upload"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>RESTORE COMMS</span>
              </button>
            ) : (
              <button
                id="btn-sim-comms-loss"
                onClick={() => handleToggleComms(true)}
                className="space-capsule-btn bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-700/70 text-xs py-1.5 px-3.5"
                title="Simulate complete Earth communications blackout. ASTRA transitions 100% to offline Local AI Core"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>SIMULATE COMMS LOSS</span>
              </button>
            )}

            {/* 3. RESET BASELINE */}
            <button
              id="btn-sim-reset-baseline"
              onClick={handleReset}
              className="space-capsule-btn space-capsule-btn-glass text-xs py-1.5 px-3.5"
              title="Reset telemetry to stable baseline values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            {/* 4. SHOW ARCHITECTURE */}
            <button
              id="btn-sim-show-arch"
              onClick={handleArch}
              className="space-capsule-btn space-capsule-btn-glass text-cyan-300 text-xs py-1.5 px-3.5"
              title="Inspect ASTRA Dual-AI & Health Engine Architecture Diagram"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>ARCHITECTURE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
