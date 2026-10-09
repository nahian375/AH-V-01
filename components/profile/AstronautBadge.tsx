import React from 'react';

interface AstronautAvatarProps {
  avatarUrl?: string;
  fullName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AstronautAvatar: React.FC<AstronautAvatarProps> = ({
  avatarUrl,
  fullName = 'Astronaut',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  if (avatarUrl) {
    return (
      <div 
        className={`relative rounded-full overflow-hidden border border-cyan-400/40 bg-slate-950 shadow-[0_0_14px_rgba(6,182,212,0.25)] shrink-0 ${dimension} ${className}`}
      >
        <img 
          src={avatarUrl} 
          alt={`${fullName} astronaut avatar`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-cyan-400/20 pointer-events-none" />
      </div>
    );
  }

  // Minimal professional astronaut silhouette inside a circular mission badge
  // (per spec: minimal astronaut silhouette inside a circular mission badge, no cartoon avatar)
  return (
    <div 
      className={`relative rounded-full bg-gradient-to-b from-cyan-950/60 via-slate-950 to-slate-900 border border-cyan-500/40 flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${dimension} ${className}`}
      aria-label={`${fullName} astronaut avatar badge`}
    >
      <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/4 h-3/4 text-cyan-400"
      >
        {/* Outer helmet structure */}
        <circle cx="20" cy="18" r="11" stroke="currentColor" strokeWidth="1.2" strokeDasharray="30 1.5" strokeOpacity="0.7" />
        
        {/* Visor shield fill */}
        <path 
          d="M13 18C13 13.8 16.1 10.5 20 10.5C23.9 10.5 27 13.8 27 18C27 21 23.9 22.8 20 22.8C16.1 22.8 13 21 13 18Z" 
          fill="#090d16" 
          stroke="currentColor" 
          strokeWidth="1.4" 
        />
        
        {/* Visor reflection curve */}
        <path 
          d="M15 14C16.2 12.2 18.2 11.5 20.5 11.5" 
          stroke="#38bdf8" 
          strokeWidth="1.4" 
          strokeLinecap="round" 
        />
        <path 
          d="M14.5 17C15 15.5 16 14.5 17.5 14" 
          stroke="#ffffff" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeOpacity="0.8" 
        />
        
        {/* Neck ring and suit contour */}
        <path 
          d="M13.5 26.5C15.2 25 17.5 24.5 20 24.5C22.5 24.5 24.8 25 26.5 26.5" 
          stroke="#64748b" 
          strokeWidth="1.2" 
        />
        <path 
          d="M9.5 36.5C10.8 31 15 28 20 28C25 28 29.2 31 30.5 36.5" 
          stroke="#475569" 
          strokeWidth="1.2" 
          strokeLinecap="round" 
        />
      </svg>

      {/* Subtle outer metallic ring sheen */}
      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none" />
    </div>
  );
};

interface MissionPatchBadgeProps {
  astronautId: string;
  missionName: string;
  role: string;
  className?: string;
}

export const MissionPatchBadge: React.FC<MissionPatchBadgeProps> = ({
  astronautId,
  missionName,
  role,
  className = '',
}) => {
  return (
    <div 
      className={`relative inline-flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-center font-mono select-none shadow-md ${className}`}
    >
      <div className="text-[9px] tracking-[0.25em] text-cyan-400 font-bold uppercase">
        ASTRA
      </div>
      <div className="w-12 h-px bg-slate-700 my-1" />
      <div className="text-[12px] font-black text-slate-100 tracking-wider">
        {astronautId || 'A-047'}
      </div>
      <div className="text-[10px] font-bold text-amber-400/90 tracking-wide mt-0.5">
        {missionName || 'ARES-01'}
      </div>
      <div className="text-[9px] font-medium text-slate-400 tracking-wider uppercase mt-0.5 max-w-[140px] truncate">
        {role || 'SCIENCE OPERATIONS'}
      </div>
    </div>
  );
};
