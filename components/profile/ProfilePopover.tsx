import React, { useEffect, useRef } from 'react';
import { 
  User, 
  ArrowRight, 
  Shield, 
  Settings as SettingsIcon, 
  Activity, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { AstronautProfile } from '../../types/profile';
import { AstronautAvatar } from './AstronautBadge';
import { calculateProfileCompletion } from '../../services/profileService';
import { spaceAudio } from '../../utils/spaceAudio';

interface ProfilePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AstronautProfile;
  sol: number;
  missionPhase?: string;
  onNavigateProfile: () => void;
  onNavigateBaseline: () => void;
  onNavigatePreferences: () => void;
  onNavigatePrivacy: () => void;
}

export const ProfilePopover: React.FC<ProfilePopoverProps> = ({
  isOpen,
  onClose,
  profile,
  sol,
  missionPhase = 'DEEP SPACE',
  onNavigateProfile,
  onNavigateBaseline,
  onNavigatePreferences,
  onNavigatePrivacy,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { percentage, missingFields } = calculateProfileCompletion(profile);

  const getSyncStatusDisplay = () => {
    switch (profile.syncStatus) {
      case 'synced':
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
          label: 'PROFILE SYNCHRONIZED',
          badgeClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80',
        };
      case 'pending':
        return {
          icon: <Clock className="w-3 h-3 text-amber-400 animate-spin" />,
          label: 'LOCAL CHANGES PENDING',
          badgeClass: 'text-amber-400 bg-amber-950/60 border-amber-800/80',
        };
      case 'local':
      default:
        return {
          icon: <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />,
          label: 'LOCAL PROFILE',
          badgeClass: 'text-cyan-300 bg-cyan-950/60 border-cyan-800/80',
        };
    }
  };

  const syncInfo = getSyncStatusDisplay();

  const handleAction = (callback: () => void) => {
    spaceAudio.playClick();
    callback();
    onClose();
  };

  return (
    <div 
      ref={popoverRef}
      id="astronaut-profile-popover"
      className="absolute right-0 top-full mt-2.5 w-80 sm:w-88 z-50 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.15)] overflow-hidden font-mono text-xs select-none transition-all duration-200 animate-in fade-in zoom-in-95"
      role="dialog"
      aria-label="Astronaut Mission Profile Overview"
    >
      {/* 1. TOP IDENTITY HEADER */}
      <div className="p-4 bg-gradient-to-b from-slate-900/90 to-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <AstronautAvatar 
            avatarUrl={profile.identity.avatarUrl} 
            fullName={profile.identity.fullName}
            size="md" 
          />
          <div>
            <div className="text-sm font-black text-slate-100 tracking-wide flex items-center gap-1.5">
              <span>{profile.identity.fullName || 'UNREGISTERED ASTRONAUT'}</span>
            </div>
            <div className="text-[11px] font-bold text-cyan-400 tracking-wider">
              {profile.identity.astronautId || 'ID: NOT CONFIGURED'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 tracking-wide">
              {profile.identity.role || 'Science Operations'}
            </div>
          </div>
        </div>

        {/* Identity metadata pills */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
          {profile.identity.callSign && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-slate-500 uppercase">CALL SIGN:</span>
              <span className="text-amber-400 font-bold">{profile.identity.callSign}</span>
            </div>
          )}
          {profile.identity.age && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-slate-500 uppercase">AGE:</span>
              <span className="text-slate-200 font-bold">{profile.identity.age}y</span>
            </div>
          )}
          {profile.identity.bloodGroup && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-slate-500 uppercase">BLOOD:</span>
              <span className="text-cyan-300 font-bold">{profile.identity.bloodGroup}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. MISSION CONTEXT BLOCK */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800/80">
        <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">
          MISSION
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-200 tracking-wider">
            {profile.mission.missionName || 'MARS-01'}
          </span>
          <span className="text-[11px] font-bold text-amber-400">
            SOL {sol} • {missionPhase}
          </span>
        </div>
      </div>

      {/* 3. PROFILE COMPLETION PROGRESS (IF INCOMPLETE) */}
      {percentage < 100 && (
        <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-400">MISSION PROFILE</span>
            <span className="text-cyan-400 font-bold">{percentage}% COMPLETE</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {missingFields.length > 0 && (
            <div className="text-[9px] text-slate-500 mt-1 truncate">
              Missing: {missingFields.slice(0, 2).map(f => `+ ${f}`).join(' ')}
            </div>
          )}
        </div>
      )}

      {/* 4. NAVIGATION LINKS */}
      <div className="p-2 space-y-1">
        <button
          onClick={() => handleAction(onNavigateProfile)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">Mission Profile</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => handleAction(onNavigateBaseline)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2.5">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">Health Baseline</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => handleAction(onNavigatePreferences)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">Preferences</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => handleAction(onNavigatePrivacy)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">Data & Privacy</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 5. FOOTER STATUS STRIP */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${syncInfo.badgeClass}`}>
          {syncInfo.icon}
          <span>{syncInfo.label}</span>
        </div>

        <button
          onClick={() => handleAction(onNavigateProfile)}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition cursor-pointer px-2 py-1 rounded-md hover:bg-slate-900"
        >
          <span>EDIT PROFILE</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
