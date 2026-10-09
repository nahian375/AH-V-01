import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ActiveModuleType } from './CentralMissionCore';
import { spaceAudio } from '../../utils/spaceAudio';

export interface FeatureOrbitButtonProps {
  id: string;
  moduleKey: 'PHYSICAL' | 'MENTAL' | 'DASHBOARD' | 'AI';
  title: string;
  description: string;
  subValue?: string;
  icon: React.ReactNode;
  accentColor: 'cyan' | 'violet' | 'amber' | 'blue';
  onHoverStart: (module: ActiveModuleType) => void;
  onHoverEnd: () => void;
  onClick: () => void;
  parallaxOffset: { x: number; y: number };
  prefersReducedMotion: boolean;
  positionClasses: string; // Tailored layout classes for positioning
}

export const FeatureOrbitButton: React.FC<FeatureOrbitButtonProps> = ({
  id,
  moduleKey,
  title,
  description,
  subValue,
  icon,
  accentColor,
  onHoverStart,
  onHoverEnd,
  onClick,
  parallaxOffset,
  prefersReducedMotion,
  positionClasses,
}) => {
  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/40 hover:border-cyan-400/90',
      ringOuter: 'border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)]',
      ringProgress: 'border-t-cyan-300 border-r-cyan-400 border-b-cyan-600 border-l-transparent',
      glowBg: 'hover:shadow-[0_0_24px_rgba(6,182,212,0.25)]',
      iconBg: 'bg-cyan-950/80 text-cyan-300',
      arrowText: 'text-cyan-400 group-hover:translate-x-1.5',
      badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
    },
    violet: {
      border: 'border-purple-500/40 hover:border-purple-400/90',
      ringOuter: 'border-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.4)]',
      ringProgress: 'border-t-purple-300 border-r-purple-400 border-b-purple-600 border-l-transparent',
      glowBg: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.25)]',
      iconBg: 'bg-purple-950/80 text-purple-300',
      arrowText: 'text-purple-400 group-hover:translate-x-1.5',
      badge: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
    },
    amber: {
      border: 'border-amber-500/40 hover:border-amber-400/90',
      ringOuter: 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.4)]',
      ringProgress: 'border-t-amber-300 border-r-amber-400 border-b-amber-600 border-l-transparent',
      glowBg: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]',
      iconBg: 'bg-amber-950/80 text-amber-300',
      arrowText: 'text-amber-400 group-hover:translate-x-1.5',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    },
    blue: {
      border: 'border-blue-500/40 hover:border-blue-400/90',
      ringOuter: 'border-blue-400 shadow-[0_0_16px_rgba(59,130,246,0.4)]',
      ringProgress: 'border-t-blue-300 border-r-blue-400 border-b-blue-600 border-l-transparent',
      glowBg: 'hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]',
      iconBg: 'bg-blue-950/80 text-blue-300',
      arrowText: 'text-blue-400 group-hover:translate-x-1.5',
      badge: 'bg-blue-950/80 text-blue-300 border-blue-800/80',
    },
  }[accentColor];

  const handleClick = () => {
    spaceAudio.playQuindar();
    onClick();
  };

  const parallaxTransform = prefersReducedMotion
    ? undefined
    : {
        transform: `translate3d(${parallaxOffset.x * 7}px, ${parallaxOffset.y * 7}px, 0)`,
        transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
      };

  return (
    <div className={positionClasses} style={parallaxTransform}>
      <button
        id={id}
        aria-label={`${title}: ${description}`}
        onClick={handleClick}
        onMouseEnter={() => {
          spaceAudio.playClick();
          onHoverStart(moduleKey);
        }}
        onMouseLeave={onHoverEnd}
        onFocus={() => onHoverStart(moduleKey)}
        onBlur={onHoverEnd}
        className={`group relative flex items-center gap-3.5 sm:gap-4 p-2.5 sm:p-3 pr-5 sm:pr-6 rounded-full bg-[#040818]/90 hover:bg-[#07112d]/95 backdrop-blur-xl border ${colorStyles.border} ${colorStyles.glowBg} transition-all duration-300 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] w-full max-w-[340px] sm:max-w-[370px] shadow-2xl`}
      >
        {/* Glowing Circular Double-Ring with Central Icon */}
        <div className="relative shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16">
          {/* Outer Segmented Orbital Progress Ring */}
          <div 
            className={`absolute inset-0 rounded-full border-2 border-dashed opacity-40 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-700 ${colorStyles.ringOuter}`} 
          />

          {/* Inner Accent Arc */}
          <div 
            className={`absolute inset-1 rounded-full border-2 ${colorStyles.ringProgress} group-hover:scale-105 transition-transform duration-300`} 
          />

          {/* Center Circle with Domain Icon */}
          <div className={`relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full ${colorStyles.iconBg} border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>

        {/* Text Container */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold font-mono tracking-wider text-slate-100 group-hover:text-white transition">
              {title}
            </h3>
            {subValue && (
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${colorStyles.badge} hidden xs:inline-block`}>
                {subValue}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 group-hover:text-slate-200 transition font-sans mt-0.5 leading-snug line-clamp-2">
            {description}
          </p>
        </div>

        {/* Sleek Forward Action Arrow */}
        <div className={`shrink-0 transition-transform duration-300 ${colorStyles.arrowText}`}>
          <ArrowRight className="w-5 h-5" />
        </div>
      </button>
    </div>
  );
};
