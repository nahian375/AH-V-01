import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles,
  LayoutDashboard, 
  Heart, 
  Brain, 
  TrendingUp, 
  Bot, 
  ClipboardCheck, 
  BellRing, 
  Rocket, 
  History, 
  Users, 
  Settings as SettingsIcon,
  ShieldCheck,
  Activity,
  Cpu,
  Radio,
  Volume2,
  VolumeX,
  HelpCircle,
  Layers,
  ArrowRight,
  Database,
  User
} from 'lucide-react';
import { NavTab } from '../layout/Navigation';
import { ConnectionState } from '../../services/connectivityManager';
import { AIMode, AISource } from '../../types/ai';
import { HealthSeverity } from '../../types/health';
import { spaceAudio } from '../../utils/spaceAudio';

interface MissionCommandMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unacknowledgedAlertsCount: number;
  connectionState: ConnectionState;
  aiMode: AIMode;
  activeAiSource: AISource;
  syncPendingCount: number;
  overallSeverity?: HealthSeverity;
  sol: number;
  onOpenOnboarding?: () => void;
}

export const MissionCommandMenuModal: React.FC<MissionCommandMenuModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  unacknowledgedAlertsCount,
  connectionState,
  aiMode,
  activeAiSource,
  syncPendingCount,
  overallSeverity = 'GREEN',
  sol,
  onOpenOnboarding,
}) => {
  const isOffline = connectionState === 'COMMS_BLACKOUT' || aiMode === 'OFFLINE';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavClick = (tab: NavTab) => {
    spaceAudio.playQuindar();
    onSelectTab(tab);
    onClose();
  };

  const menuSections = [
    {
      category: 'PRIMARY HEALTH DOMAINS',
      items: [
        {
          id: 'landing' as NavTab,
          label: 'Spatial Command Hub',
          sub: 'Orbital view & central telemetry matrix',
          icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
          color: 'border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/30',
          badge: 'ACTIVE HUB',
        },
        {
          id: 'physical' as NavTab,
          label: 'Bio Signal',
          sub: 'Cardio, HRV, biomarkers, radiation dosimetry',
          icon: <Heart className="w-5 h-5 text-rose-400" />,
          color: 'border-rose-500/40 hover:border-rose-400 bg-rose-950/30',
          badge: 'BIOMETRICS',
        },
        {
          id: 'mental' as NavTab,
          label: 'Neural Signal',
          sub: 'Cognitive acuity, circadian rhythms, stress score',
          icon: <Brain className="w-5 h-5 text-purple-400" />,
          color: 'border-purple-500/40 hover:border-purple-400 bg-purple-950/30',
          badge: 'NEURAL FLUX',
        },
        {
          id: 'overview' as NavTab,
          label: 'Health Dashboard',
          sub: '14-day rolling baselines, telemetry overview',
          icon: <LayoutDashboard className="w-5 h-5 text-amber-400" />,
          color: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/30',
          badge: 'TELEMETRY',
        },
      ],
    },
    {
      category: 'INTELLIGENCE & OPERATIONS',
      items: [
        {
          id: 'astra-ai' as NavTab,
          label: 'ASTRA AI Assistant',
          sub: 'On-device local LLM & Gemini hybrid clinical assistant',
          icon: <Bot className="w-5 h-5 text-blue-400" />,
          color: 'border-blue-500/40 hover:border-blue-400 bg-blue-950/30',
          badge: isOffline ? 'LOCAL LLaMA' : 'GEMINI 2.5',
        },
        {
          id: 'trends' as NavTab,
          label: 'Biomarker Trends',
          sub: 'Multi-metric historical time-series analytics',
          icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
          color: 'border-cyan-500/40 hover:border-cyan-400 bg-slate-900/50',
          badge: 'ANALYTICS',
        },
        {
          id: 'check-in' as NavTab,
          label: 'Daily Check-In',
          sub: 'Subjective fatigue, sleep quality, workload logging',
          icon: <ClipboardCheck className="w-5 h-5 text-emerald-400" />,
          color: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/30',
          badge: 'DAILY LOG',
        },
        {
          id: 'alerts' as NavTab,
          label: 'Health Alerts',
          sub: 'Deterministic threshold notifications & warnings',
          icon: <BellRing className="w-5 h-5 text-rose-400" />,
          color: 'border-rose-500/40 hover:border-rose-400 bg-rose-950/30',
          badge: unacknowledgedAlertsCount > 0 ? `${unacknowledgedAlertsCount} ACTIVE` : 'NOMINAL',
          alertCount: unacknowledgedAlertsCount,
        },
      ],
    },
    {
      category: 'EXPEDITION & MISSION CONTEXT',
      items: [
        {
          id: 'profile' as NavTab,
          label: 'Mission Profile & Identity',
          sub: 'Astronaut credentials, call sign, role & preferences',
          icon: <User className="w-5 h-5 text-cyan-400" />,
          color: 'border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/30',
          badge: 'IDENTITY',
        },
        {
          id: 'mission' as NavTab,
          label: 'Mission Context & NASA APIs',
          sub: 'Mars trajectory, solar weather, planetary data',
          icon: <Rocket className="w-5 h-5 text-purple-400" />,
          color: 'border-purple-500/40 hover:border-purple-400 bg-slate-900/50',
          badge: 'NASA FEEDS',
        },
        {
          id: 'timeline' as NavTab,
          label: 'Clinical Timeline',
          sub: 'Historical sequence of medical events and notes',
          icon: <History className="w-5 h-5 text-sky-400" />,
          color: 'border-sky-500/40 hover:border-sky-400 bg-slate-900/50',
          badge: 'RECORDS',
        },
        {
          id: 'crew' as NavTab,
          label: 'Crew Health Matrix',
          sub: '4-person Mars-01 expedition health overview',
          icon: <Users className="w-5 h-5 text-teal-400" />,
          color: 'border-teal-500/40 hover:border-teal-400 bg-slate-900/50',
          badge: '4 CREW',
        },
        {
          id: 'settings' as NavTab,
          label: 'System Settings & Cache',
          sub: 'IndexedDB storage, audio toggles, network simulations',
          icon: <SettingsIcon className="w-5 h-5 text-amber-400" />,
          color: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/30',
          badge: 'SYSTEM',
        },
      ],
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-7 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP MODAL BAR */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-mono tracking-widest text-slate-100 uppercase">
                  MISSION COMMAND MATRIX
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 font-bold">
                  SOL {sol}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                All operational flight telemetry, modules, and diagnostic services
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenOnboarding && (
              <button
                onClick={() => {
                  spaceAudio.playClick();
                  onClose();
                  onOpenOnboarding();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-mono text-xs transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>ORIENTATION</span>
              </button>
            )}

            <button
              onClick={() => {
                spaceAudio.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Close menu (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SYSTEM STATUS MINI-STRIP */}
        <div className="mb-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold">
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-400'} animate-ping`} />
              <span className={isOffline ? 'text-amber-400' : 'text-emerald-400'}>
                {isOffline ? 'OFFLINE AUTONOMOUS' : 'SYSTEM NOMINAL'}
              </span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline">DETERMINISTIC SAFETY BUS</span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-cyan-400 hidden md:inline">INDEXEDDB ENCRYPTED</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
              {activeAiSource}
            </span>
            {syncPendingCount > 0 && (
              <span className="text-[11px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800">
                {syncPendingCount} QUEUED
              </span>
            )}
          </div>
        </div>

        {/* MODULE CATEGORIES GRID */}
        <div className="space-y-5">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <div className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-2.5 flex items-center gap-2">
                <span>{section.category}</span>
                <div className="h-px flex-1 bg-slate-800/80" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {section.items.map((item) => {
                  const isCurrent = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      onMouseEnter={() => spaceAudio.playClick()}
                      className={`group relative text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent 
                          ? 'bg-slate-900 text-cyan-300 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.3)]' 
                          : `${item.color} hover:bg-slate-900/90 text-slate-200`
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold font-mono tracking-wide text-slate-100 group-hover:text-white truncate">
                              {item.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans truncate">
                            {item.sub}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.alertCount !== undefined && item.alertCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                            {item.alertCount}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-slate-200">
                            {item.badge}
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM FOOTER / RESEARCH NOTICE */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RESEARCH PROTOTYPE: Non-diagnostic flight surgeon decision support</span>
          </div>
          <span className="text-slate-400">PRESS [ESC] OR CLICK OUTSIDE TO CLOSE</span>
        </div>
      </div>
    </div>
  );
};

export default MissionCommandMenuModal;
