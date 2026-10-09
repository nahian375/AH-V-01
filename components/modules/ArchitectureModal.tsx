/**
 * ASTRA Health - System Architecture Modal
 * Visualizes the dual-AI routing engine, deterministic safety boundary,
 * offline IndexedDB persistence, and synchronization pipeline.
 */

import React from 'react';
import { X, Layers, Cpu, Sparkles, Database, ShieldAlert, ArrowDown, ArrowRight, RefreshCw } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="architecture-modal"
        className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-slate-100">
                ASTRA HEALTH • SYSTEM ARCHITECTURE & DATAFLOW
              </h3>
              <p className="text-xs text-slate-400">
                Deterministic medical safety boundary + Dual-AI router + Offline-first sync engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagram Body */}
        <div className="p-6 space-y-6">
          
          {/* Top Layer: Sensors & Local Database */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-mono font-bold text-cyan-400 mb-1">
                1. ASTRONAUT TELEMETRY & CHECK-INS
              </div>
              <p className="text-[11px] text-slate-400">
                Continuous wearable sensors (ECG, PPG, SpO2, Accelerometry) + Subjective daily recovery check-ins.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-mono font-bold text-cyan-400 mb-1">
                2. OFFLINE INDEXEDDB CACHE (DEXIE)
              </div>
              <p className="text-[11px] text-slate-400">
                Zero data loss storage. Stores 30-day telemetry, check-ins, baselines, and pending sync items locally.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-mono font-bold text-cyan-400 mb-1">
                3. SYNC QUEUE ENGINE
              </div>
              <p className="text-[11px] text-slate-400">
                Autonomous background synchronization with Earth Mission Control when communication is restored.
              </p>
            </div>

          </div>

          {/* Critical Safety Boundary Box */}
          <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <ShieldAlert className="w-4 h-4" />
              DETERMINISTIC HEALTH & BASELINE ENGINE (100% LOCAL & NON-GENERATIVE)
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
              Safety Principle: Generative AI does NOT invent alerts or decide clinical severity. The Health Engine deterministically calculates 7-day, 14-day, and 30-day personal rolling baselines, detects multi-metric divergence, and outputs structured findings.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded bg-slate-950 border border-emerald-900/60 text-emerald-300">
                Rolling Baselines (7d/14d/30d)
              </div>
              <div className="p-2 rounded bg-slate-950 border border-emerald-900/60 text-emerald-300">
                Multi-Metric Divergence Rules
              </div>
              <div className="p-2 rounded bg-slate-950 border border-emerald-900/60 text-emerald-300">
                Deterministic Alert Triage
              </div>
              <div className="p-2 rounded bg-slate-950 border border-emerald-900/60 text-emerald-300">
                Recovery Score Calculator
              </div>
            </div>
          </div>

          {/* Dual-AI Router Box */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3">
              <Cpu className="w-4 h-4 text-cyan-400" />
              ASTRA DUAL-AI INTELLIGENCE ROUTER (`askASTRA()`)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Online Path */}
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-700/60">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  ONLINE: GEMINI CLOUD PROVIDER
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Secured server-side proxy (`/api/ai/chat`) communicating with Gemini 3.8 Flash. Analyzes mission telemetry with Earth-side clinical reasoning when uplink is operational.
                </p>
              </div>

              {/* Offline Path */}
              <div className="p-4 rounded-xl bg-slate-900 border border-amber-700/60">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 mb-1">
                  <Cpu className="w-4 h-4" />
                  OFFLINE: LOCAL ASTRA CORE PROVIDER
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  100% on-device inside browser. Combines Local RAG across Space Medicine Evidence Books with structured natural language synthesis. Operates without internet during comms blackout.
                </p>
              </div>

            </div>
          </div>

          {/* Structured Output Contract */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase tracking-wider">
              STRUCTURED CLINICAL AI RESPONSE SCHEMA:
            </span>
            <div className="mt-2 text-slate-300 space-y-1">
              <div><strong className="text-cyan-400">OBSERVATION:</strong> Factual summary of what diverged from baseline.</div>
              <div><strong className="text-slate-400">CONTEXT:</strong> Comparison against personal 14-day equilibrium and mission phase.</div>
              <div><strong className="text-amber-400">CONTRIBUTING FACTORS:</strong> Telemetry-supported drivers (sleep, noise, training).</div>
              <div><strong className="text-emerald-400">SUGGESTED NEXT STEP:</strong> Actionable non-diagnostic monitoring recommendations.</div>
              <div><strong className="text-rose-400">SAFETY DISCLAIMER:</strong> Decision-support prototype declaration.</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition"
          >
            CLOSE ARCHITECTURE DIAGRAM
          </button>
        </div>
      </div>
    </div>
  );
};
