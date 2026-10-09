import React, { useState } from 'react';
import { AIMode, AISource } from '../../types/ai';
import { ConnectionState } from '../../services/connectivityManager';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Cpu, 
  HelpCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  Radio,
  Check,
  ArrowLeft,
  Settings as SettingsIcon,
  Menu,
  Compass
} from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';
import { TopRightIdentityControl } from '../profile/TopRightIdentityControl';
import { NavTab } from './Navigation';

interface HeaderProps {
  sol: number;
  missionName: string;
  aiMode: AIMode;
  activeAiSource: AISource;
  connectionState: ConnectionState;
  syncPendingCount: number;
  syncStatus: string;
  unacknowledgedAlertsCount?: number;
  currentSectionLabel?: string;
  canGoBack?: boolean;
  onGoBack?: () => void;
  onSetAiMode: (mode: AIMode) => void;
  onTriggerSync: () => void;
  onOpenOnboarding: () => void;
  onNavigateLanding?: () => void;
  onNavigateSettings?: () => void;
  onOpenCommandMenu?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sol,
  missionName,
  aiMode,
  activeAiSource,
  connectionState,
  syncPendingCount,
  syncStatus,
  unacknowledgedAlertsCount = 0,
  currentSectionLabel,
  canGoBack,
  onGoBack,
  onSetAiMode,
  onTriggerSync,
  onOpenOnboarding,
  onNavigateLanding,
  onNavigateSettings,
  onOpenCommandMenu,
  onNavigateTab,
}) => {
  const isOffline = connectionState === 'COMMS_BLACKOUT' || aiMode === 'OFFLINE';
  const isCloud = activeAiSource.includes('GEMINI') && !isOffline;
  const [audioMuted, setAudioMuted] = useState(() => spaceAudio.getMuted());

  const handleToggleAudio = () => {
    const nextMuted = spaceAudio.toggleMute();
    setAudioMuted(nextMuted);
  };

  const handleModeSelect = (mode: AIMode) => {
    spaceAudio.playClick();
    onSetAiMode(mode);
  };

  const handleLandingClick = () => {
    spaceAudio.playQuindar();
    if (onNavigateLanding) {
      onNavigateLanding();
    }
  };

  return (
    <header 
      id="permanent-command-bar"
      className="sticky top-0 z-50 bg-[#020612]/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 py-2.5"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        
        {/* LEFT: BACK BUTTON + ASTRA HEALTH */}
        <div className="flex items-center gap-2.5 shrink-0">
          {canGoBack && onGoBack && (
            <button
              id="header-back-button"
              onClick={onGoBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950/70 border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-mono text-xs font-bold transition cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Go back to previous page"
              title="Return to previous screen"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline">BACK</span>
            </button>
          )}

          <button
            onClick={handleLandingClick}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded-lg p-1 -m-1"
            title="Return to Space Spatial Command Hub"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_14px_rgba(6,182,212,0.3)] group-hover:scale-105 group-hover:border-cyan-400 transition-all">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black tracking-wider text-slate-100 uppercase leading-none font-mono group-hover:text-cyan-300 transition">
                ASTRA HEALTH
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold tracking-widest text-cyan-400 uppercase mt-0.5 font-mono">
                MISSION TELEMETRY
              </div>
            </div>
          </button>
        </div>

        {/* CENTER: MISSION CONTEXT + CURRENT SECTION */}
        <div className="flex items-center gap-2">
          {currentSectionLabel && (
            <div className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 font-mono text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.25)]">
              {currentSectionLabel}
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 sm:gap-3 px-3.5 py-1 rounded-full bg-slate-900/80 border border-slate-800/90 font-mono text-xs shadow-inner">
            <span className="font-bold text-slate-200 tracking-wider">
              {missionName || 'MARS-01'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-extrabold text-amber-400 tracking-wide">
              SOL {sol}
            </span>
          </div>

          {onNavigateLanding && (
            <button
              onClick={handleLandingClick}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 hover:text-white border border-cyan-700/60 font-mono text-xs transition cursor-pointer shadow-xs"
              title="Switch to Interactive 3D Astronaut Spatial Command Hub"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPATIAL HUB</span>
            </button>
          )}
        </div>

        {/* RIGHT: ● ONLINE/OFFLINE / ● AI READY / [ AUTO ] / AUDIO TOGGLE */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs shrink-0">
          
          {/* Connection Status: ● ONLINE / ● OFFLINE */}
          {isOffline ? (
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-700/70 text-xs font-bold shadow-xs"
              title="Operating offline without Earth uplink"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>OFFLINE</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-700/70 text-xs font-bold shadow-xs"
              title="Earth communication online"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span>ONLINE</span>
            </div>
          )}

          {/* AI Status: ● AI READY / ● LOCAL AI READY */}
          <div 
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-bold"
            title={isOffline ? 'Local autonomous health AI ready' : 'Gemini cloud intelligence ready'}
          >
            {isOffline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-purple-300">LOCAL AI READY</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span className="text-cyan-300">AI READY</span>
              </>
            )}
          </div>

          {/* Mode Switch: [ AUTO ] / Selector */}
          <div 
            id="ai-mode-selector"
            className="flex items-center p-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-[11px]"
            title="Telemetry and Intelligence Operating Mode"
          >
            <button
              onClick={() => handleModeSelect('ONLINE')}
              className={`px-2.5 py-0.5 rounded-full transition font-bold cursor-pointer ${
                aiMode === 'ONLINE'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ONLINE
            </button>
            <button
              onClick={() => handleModeSelect('OFFLINE')}
              className={`px-2.5 py-0.5 rounded-full transition font-bold cursor-pointer ${
                aiMode === 'OFFLINE'
                  ? 'bg-amber-600 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OFFLINE
            </button>
            <button
              onClick={() => handleModeSelect('AUTO')}
              className={`px-2.5 py-0.5 rounded-full transition font-bold cursor-pointer ${
                aiMode === 'AUTO'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AUTO
            </button>
          </div>

          {/* Space Telemetry Audio Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`p-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 text-[10px] font-mono ${
              !audioMuted 
                ? 'bg-cyan-950/80 border-cyan-700/80 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={audioMuted ? 'Enable NASA Quindar telemetry audio' : 'Mute space telemetry audio'}
          >
            {!audioMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xl:inline text-[9px] font-bold">AUDIO</span>
              </>
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Sync, Settings & Help icons */}
          <div className="flex items-center gap-1.5">
            {syncPendingCount > 0 && (
              <button
                onClick={() => {
                  spaceAudio.playSyncPing();
                  onTriggerSync();
                }}
                className="p-1.5 rounded-full text-amber-400 hover:bg-slate-900 transition border border-amber-800/60"
                title={`${syncPendingCount} records pending sync`}
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </button>
            )}
            <PWAInstallButton />
            
            {/* Quick Settings Shortcut */}
            {onNavigateSettings && (
              <button
                id="header-quick-settings-btn"
                onClick={() => {
                  spaceAudio.playClick();
                  onNavigateSettings();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 border border-amber-500/50 hover:border-amber-400 font-mono text-xs font-bold transition cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                title="Open System Settings & NASA API Diagnostics"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">SETTINGS</span>
              </button>
            )}

            {/* Unified Top-Right Mission Command Menu Button */}
            {onOpenCommandMenu && (
              <button
                id="header-mission-menu-btn"
                onClick={() => {
                  spaceAudio.playQuindar();
                  onOpenCommandMenu();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/60 hover:border-cyan-400 font-mono text-xs font-black transition cursor-pointer shadow-[0_0_14px_rgba(6,182,212,0.35)] relative ml-1"
                title="Open All Mission Modules & System Telemetry (⌘)"
              >
                <Menu className="w-4 h-4 text-cyan-400" />
                <span className="tracking-wider">MENU</span>
                {unacknowledgedAlertsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            )}

            <button
              onClick={() => {
                spaceAudio.playClick();
                onOpenOnboarding();
              }}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-900 transition border border-slate-800"
              title="Mission Operational Procedures"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Astronaut Profile / Mission Identity Top-Right Control */}
            <TopRightIdentityControl
              sol={sol}
              onNavigateTab={(tab) => {
                if (onNavigateTab) {
                  onNavigateTab(tab);
                } else if (tab === 'settings' && onNavigateSettings) {
                  onNavigateSettings();
                } else if (tab === 'landing' && onNavigateLanding) {
                  onNavigateLanding();
                }
              }}
              className="ml-1"
            />
          </div>

        </div>

      </div>
    </header>
  );
};
