/**
 * ASTRA Health - Mission Health Brief & Spaceflight Risk Context Modal
 * Complete deep-dive into daily health brief, NASA 5 hazards, and space physiology education.
 */

import React, { useState } from 'react';
import { 
  X, 
  Compass, 
  Shield, 
  Radio, 
  Activity, 
  Heart, 
  Moon, 
  Zap, 
  Brain, 
  Layers, 
  FileText, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { 
  SpaceHealthContext, 
  getMissionHealthBrief, 
  getSpaceflightRiskContext, 
  getMissionAdaptation,
  WHY_THIS_MATTERS_TOPICS 
} from '../../services/spaceContextEngine';
import { spaceAudio } from '../../utils/spaceAudio';

interface MissionHealthBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: SpaceHealthContext;
  onAskAstra?: (prompt: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const MissionHealthBriefModal: React.FC<MissionHealthBriefModalProps> = ({
  isOpen,
  onClose,
  context,
  onAskAstra,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'hazards' | 'adaptation' | 'education'>('brief');
  const [expandedTopic, setExpandedTopic] = useState<string | null>('sleep');

  if (!isOpen) return null;

  const brief = getMissionHealthBrief(context);
  const hazards = getSpaceflightRiskContext();
  const adaptation = getMissionAdaptation(context);

  const handleTabChange = (tab: typeof activeTab) => {
    spaceAudio.playClick();
    setActiveTab(tab);
  };

  const toggleTopic = (key: string) => {
    spaceAudio.playClick();
    setExpandedTopic(prev => prev === key ? null : key);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Top ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-wider">
                  SPACE HEALTH CONTEXT & MISSION BRIEF
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-400 font-bold">
                  SOL {context.missionContext.sol}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Integrated mission environment, adaptation surveillance, and NASA 5 Hazards.
              </p>
            </div>
          </div>

          <button
            onClick={() => { spaceAudio.playClick(); onClose(); }}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/90 border-b border-slate-800 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleTabChange('brief')}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
              activeTab === 'brief'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mission Health Brief
          </button>
          <button
            onClick={() => handleTabChange('hazards')}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
              activeTab === 'hazards'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NASA 5 Hazards Context
          </button>
          <button
            onClick={() => handleTabChange('adaptation')}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
              activeTab === 'adaptation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mission Adaptation
          </button>
          <button
            onClick={() => handleTabChange('education')}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
              activeTab === 'education'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Why This Matters In Space
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: MISSION HEALTH BRIEF (Section 33) */}
          {activeTab === 'brief' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                  <span className="text-xs font-black text-cyan-400 tracking-wider uppercase">
                    DAILY BRIEF · SOL {brief.sol}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {brief.missionName} · {brief.missionPhase}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Physical */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">PHYSICAL</span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      <li>● Cardiovascular: <strong className="text-slate-100">{brief.physical.cardiovascular}</strong></li>
                      <li>● Respiratory: <strong className="text-slate-100">{brief.physical.respiratory}</strong></li>
                      <li>● Recovery: <strong className="text-slate-100">{brief.physical.recovery}</strong></li>
                      <li>● Radiation: <strong className="text-slate-100">{brief.physical.radiation}</strong></li>
                    </ul>
                  </div>

                  {/* Neural */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-pink-400 uppercase tracking-widest font-bold">NEURAL & COGNITIVE</span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      <li>● Reaction performance: <strong className="text-slate-100">{brief.neural.reactionPerformance}</strong></li>
                      <li>● Sleep status: <strong className="text-slate-100">{brief.neural.sleep}</strong></li>
                    </ul>
                  </div>

                  {/* Mental Wellbeing */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">MENTAL WELLBEING</span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      <li>● Stress score: <strong className="text-slate-100">{brief.mentalWellbeing.stress}</strong></li>
                      <li>● Subjective mood: <strong className="text-slate-100">{brief.mentalWellbeing.mood}</strong></li>
                      <li>● Energy rating: <strong className="text-slate-100">{brief.mentalWellbeing.energy}</strong></li>
                    </ul>
                  </div>

                  {/* Mission Context */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">MISSION CONTEXT</span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      <li>● Communication: <strong className="text-emerald-400">{brief.missionContext.communication}</strong></li>
                      <li>● Radiation: <strong className="text-slate-100">{brief.missionContext.radiationEnvironment}</strong></li>
                      <li>● Gravity: <strong className="text-indigo-300">{brief.missionContext.gravity}</strong></li>
                    </ul>
                  </div>
                </div>

                {/* ASTRA NOTE */}
                <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/80">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="tracking-wider uppercase text-[11px]">ASTRA NOTE</span>
                  </div>
                  <p className="text-slate-200 text-xs font-sans leading-relaxed">
                    "{brief.astraNote}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NASA 5 HAZARDS CONTEXT (Section 35) */}
          {activeTab === 'hazards' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-xs font-sans">
                NASA Human Research Program (HRP) identifies these five fundamental hazards as key operational domains for human missions beyond Low Earth Orbit.
              </div>

              <div className="space-y-2.5">
                {hazards.map((h, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <strong className="text-slate-100 text-xs tracking-wider">{h.title}</strong>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-bold text-cyan-300">
                        {h.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs font-sans leading-relaxed pl-7">
                      {h.description}
                    </p>
                    <div className="text-[10px] text-slate-500 pl-7 tracking-wide">
                      Domain: {h.nasaHrpDomain}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MISSION ADAPTATION (Section 16) */}
          {activeTab === 'adaptation' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-xs font-sans">
                Summary of physiological adaptation across 7 spaceflight domains. Tracks evolving in-flight equilibrium without declaring subjective clinical diagnosis.
              </div>

              <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950/80 overflow-hidden">
                {adaptation.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs uppercase">{item.domain}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{item.summary}</p>
                    </div>
                    <span className={`self-start sm:self-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shrink-0 ${
                      item.status === 'Stable' 
                        ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800'
                        : item.status === 'Monitoring' 
                        ? 'text-amber-300 bg-amber-950/60 border-amber-800'
                        : 'text-cyan-300 bg-cyan-950/60 border-cyan-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WHY THIS MATTERS IN SPACE (Section 34) */}
          {activeTab === 'education' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-xs font-sans">
                Educational evidence-based physiological mechanisms explaining how spaceflight environments interact with human body systems.
              </div>

              <div className="space-y-2">
                {Object.entries(WHY_THIS_MATTERS_TOPICS).map(([key, topic]) => {
                  const isExpanded = expandedTopic === key;
                  return (
                    <div 
                      key={key}
                      className="border border-slate-800 rounded-xl bg-slate-950/80 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => toggleTopic(key)}
                        className="w-full p-3.5 text-left flex items-center justify-between text-slate-200 hover:text-cyan-300 transition cursor-pointer"
                      >
                        <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                          {topic.title}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>

                      {isExpanded && (
                        <div className="p-3.5 pt-0 text-slate-300 font-sans text-xs space-y-2 border-t border-slate-800/60 mt-1">
                          <p className="leading-relaxed text-slate-300 pt-2">
                            {topic.explanation}
                          </p>
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                            Evidence Source: {topic.hrpCitation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-500 font-sans">
            NASA Human Research Program (HRP) Guidelines · Non-Diagnostic Decision Support
          </div>

          <div className="flex items-center gap-2">
            {onAskAstra && (
              <button
                onClick={() => {
                  onClose();
                  onAskAstra('What mission context and space hazards should I be aware of today?');
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Ask ASTRA</span>
              </button>
            )}
            <button
              onClick={() => { spaceAudio.playClick(); onClose(); }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
