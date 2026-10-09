import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Bookmark, 
  Radio, 
  Sparkles, 
  Check, 
  Copy, 
  Play, 
  ArrowRight,
  Filter,
  Compass
} from 'lucide-react';
import { 
  MISSION_THOUGHTS, 
  MissionThought, 
  MissionThoughtCategory, 
  PresentationMode 
} from '../../data/missionThoughts';
import { 
  getFavoriteThoughtIds, 
  toggleFavoriteThought, 
  setActiveThought,
  setPresentationMode
} from '../../services/missionThoughtService';
import { spaceAudio } from '../../utils/spaceAudio';

interface MissionThoughtArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThoughtId: string;
  currentSol: number;
}

const ALL_CATEGORIES: MissionThoughtCategory[] = [
  'EARTH & HOME',
  'COURAGE',
  'PURPOSE',
  'DISCOVERY',
  'RESILIENCE',
  'SOLITUDE',
  'HUMANITY',
  'THE UNKNOWN',
  'TIME',
  'LIFE',
  'HOPE',
  'FAILURE & RECOVERY',
  'TEAM & CREW',
  'MARS / DEEP SPACE',
  'FUTURE GENERATIONS'
];

export const MissionThoughtArchiveModal: React.FC<MissionThoughtArchiveModalProps> = ({
  isOpen,
  onClose,
  activeThoughtId,
  currentSol
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MissionThoughtCategory | 'ALL'>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => getFavoriteThoughtIds());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredThoughts = useMemo(() => {
    return MISSION_THOUGHTS.filter(thought => {
      if (onlyFavorites && !favorites.includes(thought.id)) {
        return false;
      }
      if (selectedCategory !== 'ALL' && thought.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuote = thought.quote.toLowerCase().includes(query);
        const matchesSupporting = thought.supportingLine?.toLowerCase().includes(query) ?? false;
        const matchesCategory = thought.category.toLowerCase().includes(query);
        const matchesCode = thought.transmissionCode.toLowerCase().includes(query);
        if (!matchesQuote && !matchesSupporting && !matchesCategory && !matchesCode) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedCategory, onlyFavorites, favorites]);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteThought(id);
    setFavorites(getFavoriteThoughtIds());
  };

  const handleCopy = (thought: MissionThought, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `"${thought.quote}"\n${thought.supportingLine ? thought.supportingLine + '\n' : ''}— ASTRA [${thought.transmissionCode}]`;
    navigator.clipboard?.writeText(text);
    setCopiedId(thought.id);
    spaceAudio.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectThought = (thought: MissionThought) => {
    setActiveThought(thought);
    if (thought.preferredMode) {
      setPresentationMode(thought.preferredMode);
    }
    spaceAudio.playExecute();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Mission Thought Archive"
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900/95 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-slate-100 overflow-hidden font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-mono tracking-wider text-slate-100 uppercase">
                  ASTRA REFLECTIONS ARCHIVE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {MISSION_THOUGHTS.length} THOUGHTS
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  SOL {currentSol}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Curated philosophical and motivational reflections for long-duration space flight.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              spaceAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close archive"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-950/40 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reflections, keywords, or codes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Favorites Toggle */}
          <button
            onClick={() => {
              spaceAudio.playClick();
              setOnlyFavorites(!onlyFavorites);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
              onlyFavorites
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>SAVED ({favorites.length})</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-5 py-2.5 border-b border-slate-800/40 bg-slate-950/20 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              spaceAudio.playClick();
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider uppercase whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            ALL ({MISSION_THOUGHTS.length})
          </button>
          {ALL_CATEGORIES.map(cat => {
            const count = MISSION_THOUGHTS.filter(t => t.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  spaceAudio.playClick();
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider uppercase whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Thought List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-800/40">
          {filteredThoughts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-mono text-sm">
              <Radio className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse text-cyan-400" />
              <p>NO REFLECTIONS FOUND</p>
              <p className="text-xs text-slate-600 mt-1">Adjust search parameters or category filter.</p>
            </div>
          ) : (
            filteredThoughts.map(thought => {
              const isActive = thought.id === activeThoughtId;
              const isFav = favorites.includes(thought.id);
              const isCopied = copiedId === thought.id;

              return (
                <div
                  key={thought.id}
                  className={`pt-3 first:pt-0 group rounded-xl p-3 sm:p-4 transition border ${
                    isActive
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-950/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">
                        {thought.transmissionCode}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                        {thought.category}
                      </span>
                      {thought.preferredMode && (
                        <span className="hidden sm:inline-block text-[9px] font-mono text-slate-500 px-1 rounded bg-slate-900 border border-slate-800">
                          {thought.preferredMode}
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE NOW
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={e => handleCopy(thought, e)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                        title="Copy Quote"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={e => handleToggleFavorite(thought.id, e)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition"
                        title={isFav ? 'Remove Favorite' : 'Save Reflection'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      {!isActive && (
                        <button
                          onClick={() => handleSelectThought(thought)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 hover:border-cyan-400 font-mono text-[10px] transition cursor-pointer font-semibold ml-1"
                          title="Display on Landing Page"
                        >
                          <span>SET ACTIVE</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quote Body */}
                  <div className="mt-2.5 cursor-pointer" onClick={() => handleSelectThought(thought)}>
                    <blockquote className="text-sm sm:text-base font-light text-slate-100 tracking-wide font-sans leading-relaxed">
                      “{thought.quote}”
                    </blockquote>
                    {thought.supportingLine && (
                      <p className="mt-1 text-xs font-mono text-slate-400">
                        {thought.supportingLine}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div>
            <span>100% OFFLINE PERSISTENCE • ASTRA CORE REPOSITORY</span>
          </div>
          <button
            onClick={() => {
              spaceAudio.playClick();
              onClose();
            }}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
