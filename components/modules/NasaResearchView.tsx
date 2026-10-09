/**
 * ASTRA Health - NASA Open Science Data Repository (OSDR) Research Browser
 * Allows astronauts and medical officers to explore peer-reviewed NASA space-life-science
 * studies across cardiovascular, bone, muscle, radiation, sleep, circadian, immune, and cognitive topics.
 */

import React, { useState } from 'react';
import { NasaResearchItem, NasaResearchTopic } from '../../types/nasa';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Tag, 
  Layers, 
  CheckCircle, 
  Dna, 
  ShieldAlert, 
  Heart, 
  Brain, 
  Moon, 
  Clock, 
  Activity,
  Bot
} from 'lucide-react';

interface NasaResearchViewProps {
  researchList: NasaResearchItem[];
  onAskAstra: (prompt: string) => void;
  isLoading?: boolean;
}

const TOPICS: { id: NasaResearchTopic; label: string; icon: any }[] = [
  { id: 'ALL', label: 'All Topics', icon: Layers },
  { id: 'Cardiovascular', label: 'Cardiovascular', icon: Heart },
  { id: 'Sleep', label: 'Sleep & Rest', icon: Moon },
  { id: 'Radiation', label: 'Radiation', icon: ShieldAlert },
  { id: 'Bone', label: 'Bone Loss', icon: Activity },
  { id: 'Muscle', label: 'Muscle & Atrophy', icon: Activity },
  { id: 'Circadian', label: 'Circadian', icon: Clock },
  { id: 'Immune', label: 'Immune System', icon: Dna },
  { id: 'Cognition', label: 'Cognition & ICE', icon: Brain },
  { id: 'Exercise', label: 'Exercise Countermeasures', icon: Activity },
  { id: 'Behavioral Health', label: 'Behavioral Health', icon: Brain },
];

export const NasaResearchView: React.FC<NasaResearchViewProps> = ({
  researchList,
  onAskAstra,
  isLoading = false,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<NasaResearchTopic>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudy, setSelectedStudy] = useState<NasaResearchItem | null>(null);

  const filteredList = researchList.filter(item => {
    const matchesTopic = selectedTopic === 'ALL' || item.topic.toLowerCase() === selectedTopic.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesTopic;

    const matchesQuery = 
      item.title.toLowerCase().includes(query) ||
      item.accession.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.keyFindings.some(f => f.toLowerCase().includes(query));

    return matchesTopic && matchesQuery;
  });

  return (
    <div id="nasa-research-browser" className="space-y-4">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/50">
            <BookOpen className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-slate-100 uppercase">
                NASA SPACE-LIFE-SCIENCES RESEARCH (OSDR)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                OFFLINE GROUNDED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Peer-reviewed evidence from NASA Open Science Data Repository & Human Research Program
            </p>
          </div>
        </div>

        <button
          onClick={() => onAskAstra('What NASA research is relevant to my current recovery and health trends?')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>SYNTHESIZE WITH ASTRA AI</span>
        </button>
      </div>

      {/* Search & Topic Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NASA studies by accession (e.g. OSD-452), title, biomarker, or countermeasure..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 transition"
          />
        </div>

        {/* Topic Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{topic.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Study List & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Study Cards Grid */}
        <div className={`space-y-3 ${selectedStudy ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Showing {filteredList.length} NASA space-life-science studies</span>
            <span>Source: NASA OSDR Repository</span>
          </div>

          {filteredList.map((study) => {
            const isSelected = selectedStudy?.id === study.id;
            return (
              <div
                key={study.id}
                onClick={() => setSelectedStudy(study)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-md'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-950 text-cyan-400 border border-slate-800">
                        {study.accession}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {study.topic}
                      </span>
                      {study.missionOrPayload && (
                        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                          • {study.missionOrPayload}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 leading-snug">
                      {study.title}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAstra(`Explain NASA study ${study.accession}: "${study.title}" and how its findings apply to deep space mission health.`);
                    }}
                    title="Ask ASTRA about this study"
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 hover:bg-cyan-950 hover:border-cyan-700 transition shrink-0"
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-sans">
                  {study.summary}
                </p>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                  <span>{study.keyFindings.length} Key Countermeasure Findings</span>
                  <span className="text-cyan-400">Click to view study details →</span>
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-mono text-slate-400">No studies match your current filter.</div>
              <button
                onClick={() => { setSelectedTopic('ALL'); setSearchQuery(''); }}
                className="text-xs font-mono text-cyan-400 underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Selected Study Deep Dive Modal / Side Pane */}
        {selectedStudy && (
          <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4 lg:sticky lg:top-24 h-fit shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-black bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {selectedStudy.accession}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {selectedStudy.topic}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  {selectedStudy.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudy(null)}
                className="text-slate-500 hover:text-slate-300 text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Study Overview</div>
                <p className="text-slate-300 leading-relaxed font-sans bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  {selectedStudy.summary}
                </p>
              </div>

              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Key Scientific Evidence & Countermeasures</div>
                <div className="space-y-2">
                  {selectedStudy.keyFindings.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/60">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 font-sans text-xs">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500">Mission/Platform</div>
                  <div className="text-slate-200 mt-0.5">{selectedStudy.missionOrPayload || 'NASA HRP Standard'}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500">Source Repository</div>
                  <div className="text-cyan-400 mt-0.5">{selectedStudy.source}</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => onAskAstra(`How do the findings from NASA study ${selectedStudy.accession} on ${selectedStudy.topic} inform my daily exercise, sleep, or recovery protocol?`)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>CONSULT ASTRA ON THIS STUDY</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
