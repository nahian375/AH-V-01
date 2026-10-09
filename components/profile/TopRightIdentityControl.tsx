import React, { useState, useEffect } from 'react';
import { 
  getAstronautProfile, 
  subscribeToProfile, 
  getDisplayName 
} from '../../services/profileService';
import { AstronautProfile } from '../../types/profile';
import { AstronautAvatar } from './AstronautBadge';
import { ProfilePopover } from './ProfilePopover';
import { spaceAudio } from '../../utils/spaceAudio';

interface TopRightIdentityControlProps {
  sol?: number;
  missionPhase?: string;
  onNavigateTab: (tab: any) => void;
  className?: string;
}

export const TopRightIdentityControl: React.FC<TopRightIdentityControlProps> = ({
  sol = 184,
  missionPhase = 'DEEP SPACE',
  onNavigateTab,
  className = '',
}) => {
  const [profile, setProfile] = useState<AstronautProfile>(() => getAstronautProfile());
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    return subscribeToProfile(setProfile);
  }, []);

  const handleToggle = () => {
    spaceAudio.playClick();
    setIsPopoverOpen(prev => !prev);
  };

  const displayName = getDisplayName(profile);
  const fullName = profile.identity.fullName || 'Astronaut';
  const astronautId = profile.identity.astronautId || 'ASTRA-001';

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Astronaut Identity Trigger Button */}
      <button
        id="top-right-astronaut-profile-trigger"
        onClick={handleToggle}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-400/60 transition-all cursor-pointer font-mono select-none group shadow-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        aria-expanded={isPopoverOpen}
        aria-haspopup="dialog"
        title={`Astronaut Profile: ${fullName} (${astronautId})`}
      >
        {/* Avatar with status indicator dot */}
        <div className="relative shrink-0">
          <AstronautAvatar 
            avatarUrl={profile.identity.avatarUrl} 
            fullName={fullName} 
            size="sm" 
          />
          <span 
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950 shadow-[0_0_6px_#34d399] animate-pulse" 
            title="Profile Ready"
          />
        </div>

        {/* Identity Text Block - Responsive Breakpoints */}
        <div className="text-left hidden sm:block">
          {/* Desktop Full Name / Tablet Preferred Name */}
          <div className="flex items-center gap-1.5">
            <span className="hidden md:inline text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors uppercase tracking-wider">
              {fullName}
            </span>
            <span className="md:hidden text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors uppercase tracking-wider">
              {displayName}
            </span>
          </div>

          {/* Subtitle: Astronaut ID & Sol status */}
          <div className="text-[10px] text-cyan-400/90 font-medium tracking-wider flex items-center gap-1">
            <span>{astronautId}</span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">SOL {sol}</span>
          </div>
        </div>
      </button>

      {/* Compact Spacecraft Popover Menu */}
      <ProfilePopover
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        profile={profile}
        sol={sol}
        missionPhase={missionPhase}
        onNavigateProfile={() => onNavigateTab('profile')}
        onNavigateBaseline={() => onNavigateTab('overview')}
        onNavigatePreferences={() => onNavigateTab('settings')}
        onNavigatePrivacy={() => onNavigateTab('profile')}
      />
    </div>
  );
};
