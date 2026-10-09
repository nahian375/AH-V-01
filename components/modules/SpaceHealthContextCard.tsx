/**
 * ASTRA Health - Space Health Context Card & Detail Modal
 * Provides the astronaut with an immediate overview of environmental conditions,
 * spaceflight hazards, and mission health factors surrounding their biometric data.
 */

import React, { useState } from 'react';
import { 
  Rocket, 
  Orbit, 
  Radio, 
  Radiation, 
  Moon, 
  BatteryCharging, 
  Brain, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  ChevronRight, 
  X, 
  Info, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { SpaceHealthContext, SpaceRiskContextItem, WhyThisMattersItem } from '../../types/spaceContext';
import { WHY_THIS_MATTERS_KNOWLEDGE } from '../../services/spaceContextEngine';
import { spaceAudio } from '../../utils/spaceAudio';

interface SpaceHealthContextCardProps {
  spaceContext: SpaceHealthContext;
  onOpenAstraAi?: (prompt?: string) => void;
  onNavigateTab?: (tab: any) => void;
  className?: string;
}

export const SpaceHealthContextCard: React.FC<SpaceHealthContextCardProps> = ({
  spaceContext,
  onOpenAstraAi,
  onNavigateTab,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<WhyThisMattersItem | null>(null);

  const profile = spaceContext.astronautProfile;
  const mission = spaceContext.missionContext;
  const current = spaceContext.currentHealth;
  const brief = spaceContext.missionHealthBrief;

  const handleOpenModal = () => {
    spaceAudio.playClick();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    spaceAudio.playClick();
    setIsModalOpen(false);
    setSelectedTopic(null);
  };

  // Derive contextual indicators
  const sleepHrs = (current.sleepDurationMinutes / 60).toFixed(1);
  const sleepStatus = (current.sleepDurationMinutes / 60) < 6.5 ? 'Below recent baseline' : 'Within baseline';
  const recoveryLabel = `${Math.round(current.recoveryScore / 20)} / 5`;
  const neuralStatus = (current.reactionTimeMs && current.reactionTimeMs > 280) ? 'Monitoring' : 'Within baseline';

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DASHBOARD COMPACT CARD                                    */}
      {/* ============================================================ */}
      <div className={`p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-xl relative overflow-hidden font-mono text-xs ${className}`}>
        {/* Subtle cyan/purple ambient gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/60 via-purple-500/40 to-cyan-500/60" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 tracking-wider uppercase text-sm">
              SPACE HEALTH CONTEXT
            </h3>
          </div>
          <span className="text-[10px] text-cyan-400/90 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/80 font-bold">
            SOL {mission.sol}
          </span>
        </div>

        {/* Key Context Matrix */}
        <div className="mt-3.5 space-y-2.5">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-purple-400" /> Mission Phase
            </span>
            <span className="text-slate-200 font-bold">{profile.mission?.phase || mission.missionPhase || 'Transit'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Orbit className="w-3.5 h-3.5 text-cyan-400" /> Gravity
            </span>
            <span className="text-cyan-300 font-bold">{spaceContext.gravityEnvironment}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radiation className="w-3.5 h-3.5 text-amber-400" /> Radiation
            </span>
            <span className="text-amber-400 font-bold">Monitoring ({(current.dailyRadiation_uSv / 1000).toFixed(2)} mSv/d)</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" /> Communication
            </span>
            <span className={`font-bold ${mission.communicationStatus === 'ONLINE' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {mission.communicationStatus} ({mission.earthCommsDelayMinutes}m delay)
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep
            </span>
            <span className={`font-bold ${sleepStatus.includes('Below') ? 'text-amber-400' : 'text-slate-200'}`}>
              {sleepStatus} ({sleepHrs}h)
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Recovery
            </span>
            <span className="text-slate-200 font-bold">{recoveryLabel}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-pink-400" /> Neural
            </span>
            <span className="text-emerald-400 font-bold">{neuralStatus}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleOpenModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 hover:text-cyan-200 border border-cyan-800/80 font-bold transition cursor-pointer shadow-xs"
          >
            <span>[ VIEW FULL CONTEXT ]</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. FULL SPACE HEALTH CONTEXT MODAL                           */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl overflow-hidden font-mono text-xs">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  <Orbit className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-wider">
                    SPACE HEALTH CONTEXT & HAZARD INTELLIGENCE
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sol {mission.sol} • {profile.mission?.missionName || 'Mars Transit'} • {profile.identity.fullName}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              
              {/* Mission Health Brief Sol Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
                    MISSION HEALTH BRIEF — SOL {mission.sol}
                  </span>
                  <span className="text-[10px] text-slate-400">Autonomous Evaluation</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-sans">
                  {brief.astraNote}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">CARDIOVASCULAR:</span>
                    <strong className="text-amber-400">{brief.physicalSummary.cardioStatus}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">NEURAL SPEED:</span>
                    <strong className="text-emerald-400">{brief.neuralSummary.reactionStatus}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">RECOVERY INDEX:</span>
                    <strong className="text-slate-200">{brief.physicalSummary.recoveryStatus}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">COMMUNICATION:</span>
                    <strong className="text-emerald-400">{brief.missionContext.commsStatus}</strong>
                  </div>
                </div>
              </div>

              {/* 5 NASA Spaceflight Hazards Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                    5 NASA HUMAN SPACEFLIGHT HAZARD DOMAINS
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {spaceContext.spaceRisks.map((risk) => (
                    <div key={risk.hazard} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 text-xs">{risk.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          risk.status === 'MONITORING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          risk.status === 'ELEVATED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {risk.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        {risk.details}
                      </p>
                      <div className="pt-1 text-[10px] text-cyan-400/90">
                        <span className="text-slate-500">Mitigation:</span> {risk.operationalMitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pre-Flight vs In-Flight Personal Baseline Comparison */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                    PERSONAL SPACE BASELINE (PRE-FLIGHT vs IN-FLIGHT)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                        <th className="py-2 px-3">Metric</th>
                        <th className="py-2 px-3">Pre-Flight Earth</th>
                        <th className="py-2 px-3">In-Flight 14d Baseline</th>
                        <th className="py-2 px-3">Current</th>
                        <th className="py-2 px-3">Delta vs Baseline</th>
                        <th className="py-2 px-3">Spaceflight Adaptation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-[11px]">
                      {spaceContext.preFlightBaselines.map((row) => (
                        <tr key={row.metricKey} className="hover:bg-slate-800/40 transition">
                          <td className="py-2 px-3 font-bold text-slate-200">{row.label}</td>
                          <td className="py-2 px-3 text-slate-400">{row.preFlightValue} {row.unit}</td>
                          <td className="py-2 px-3 text-cyan-400 font-semibold">{row.inFlight14dBaseline} {row.unit}</td>
                          <td className="py-2 px-3 font-bold text-slate-100">{row.currentValue} {row.unit}</td>
                          <td className="py-2 px-3">
                            <span className={`font-bold ${row.deltaFromInFlight > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                              {row.deltaFromInFlight > 0 ? '+' : ''}{row.deltaFromInFlight} {row.unit}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[10px] text-slate-400 font-sans max-w-xs">{row.adaptationNote}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* "Why This Matters in Space" Expandable Educational Knowledge */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                    WHY THIS MATTERS IN SPACE (NASA HRP RESEARCH)
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WHY_THIS_MATTERS_KNOWLEDGE.map((item: WhyThisMattersItem) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedTopic(selectedTopic?.id === item.id ? null : item)}
                      className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 text-xs">{item.title}</span>
                        <span className="text-[10px] text-cyan-400">{selectedTopic?.id === item.id ? 'Collapse ▲' : 'Expand ▼'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        {selectedTopic?.id === item.id ? item.spaceExplanation : `${item.spaceExplanation.slice(0, 110)}...`}
                      </p>
                      {selectedTopic?.id === item.id && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] font-sans">
                          <div className="text-cyan-300 font-semibold">
                            Relevance: {item.missionRelevance}
                          </div>
                          <div className="text-slate-500 italic">
                            Source: {item.referenceSource}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-[10px] text-slate-500 text-center sm:text-left">
                ASTRA Space Context Engine • Deterministic Mission Surveillance & Research Support
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {onOpenAstraAi && (
                  <button
                    onClick={() => {
                      handleCloseModal();
                      onOpenAstraAi('What spaceflight context should I be aware of today?');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask ASTRA About Space Context</span>
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
