import React from 'react';
import { ActiveModuleType } from './CentralMissionCore';

interface OrbitalSystemProps {
  activeHoverModule: ActiveModuleType;
  parallaxOffset: { x: number; y: number };
  prefersReducedMotion: boolean;
}

/**
 * Clean, Understated Orbital Visualization
 * Scientific Trajectory Accents (Realism & Cleanness First):
 * - Single partial Keplerian trajectory arc fading gracefully into darkness
 * - Fine 0.75px lines, zero heavy neon glow filters or loud particle loops
 * - Contextual module guidance paths that only illuminate softly upon hover
 */
export const OrbitalSystem: React.FC<OrbitalSystemProps> = ({
  activeHoverModule,
  parallaxOffset,
  prefersReducedMotion,
}) => {
  const transformStyle = prefersReducedMotion
    ? undefined
    : {
        transform: `translate3d(${parallaxOffset.x * 3}px, ${parallaxOffset.y * 3}px, 0)`,
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      };

  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden z-0"
      style={transformStyle}
    >
      <svg 
        className="w-full h-full max-w-[1400px] max-h-[850px]"
        viewBox="0 0 1200 800"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle linear gradients for calm guidance vectors */}
          <linearGradient id="orbit-grad-physical" x1="280" y1="190" x2="490" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="orbit-grad-mental" x1="920" y1="190" x2="710" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="orbit-grad-dashboard" x1="280" y1="610" x2="490" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="orbit-grad-ai" x1="920" y1="610" x2="710" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* ============================================================ */}
        {/* 1. SINGLE, ELEGANT SCIENTIFIC TRAJECTORY ARC                  */}
        {/* Very low opacity (0.05), slow 240s rotation, fades into dark  */}
        {/* ============================================================ */}
        <g 
          style={{ 
            transformOrigin: '600px 400px',
            animation: prefersReducedMotion ? 'none' : 'spin 240s linear infinite',
          }}
        >
          <ellipse 
            cx="600" 
            cy="400" 
            rx="460" 
            ry="240" 
            stroke="rgba(56, 189, 248, 0.06)" 
            strokeWidth="0.75"
            strokeDasharray="3 14"
          />
          {/* Subtle telemetry ticks */}
          <line x1="140" y1="400" x2="148" y2="400" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.75" />
          <line x1="1052" y1="400" x2="1060" y2="400" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.75" />
        </g>

        {/* ============================================================ */}
        {/* 2. RESTRAINED MODULE GUIDANCE PATHWAYS                        */}
        {/* Barely visible when idle (0.08), softly illuminate on hover   */}
        {/* ============================================================ */}

        {/* Physical Health Vector (Top-Left) */}
        <g className="transition-opacity duration-300">
          <path
            d="M 290 200 C 370 200, 430 260, 480 320"
            stroke="url(#orbit-grad-physical)"
            strokeWidth="0.75"
            strokeOpacity={activeHoverModule === 'PHYSICAL' ? 0.7 : 0.12}
            strokeDasharray={activeHoverModule === 'PHYSICAL' ? 'none' : '2 6'}
            fill="none"
          />
          {activeHoverModule === 'PHYSICAL' && (
            <circle cx="390" cy="245" r="2" fill="#22d3ee" opacity="0.8" />
          )}
        </g>

        {/* Mental Health Vector (Top-Right) */}
        <g className="transition-opacity duration-300">
          <path
            d="M 910 200 C 830 200, 770 260, 720 320"
            stroke="url(#orbit-grad-mental)"
            strokeWidth="0.75"
            strokeOpacity={activeHoverModule === 'MENTAL' ? 0.7 : 0.12}
            strokeDasharray={activeHoverModule === 'MENTAL' ? 'none' : '2 6'}
            fill="none"
          />
          {activeHoverModule === 'MENTAL' && (
            <circle cx="810" cy="245" r="2" fill="#c084fc" opacity="0.8" />
          )}
        </g>

        {/* Health Dashboard Vector (Bottom-Left) */}
        <g className="transition-opacity duration-300">
          <path
            d="M 290 600 C 370 600, 430 540, 480 480"
            stroke="url(#orbit-grad-dashboard)"
            strokeWidth="0.75"
            strokeOpacity={activeHoverModule === 'DASHBOARD' ? 0.7 : 0.12}
            strokeDasharray={activeHoverModule === 'DASHBOARD' ? 'none' : '2 6'}
            fill="none"
          />
          {activeHoverModule === 'DASHBOARD' && (
            <circle cx="390" cy="555" r="2" fill="#fbbf24" opacity="0.8" />
          )}
        </g>

        {/* AI Assistant Vector (Bottom-Right) */}
        <g className="transition-opacity duration-300">
          <path
            d="M 910 600 C 830 600, 770 540, 720 480"
            stroke="url(#orbit-grad-ai)"
            strokeWidth="0.75"
            strokeOpacity={activeHoverModule === 'AI' ? 0.7 : 0.12}
            strokeDasharray={activeHoverModule === 'AI' ? 'none' : '2 6'}
            fill="none"
          />
          {activeHoverModule === 'AI' && (
            <circle cx="810" cy="555" r="2" fill="#60a5fa" opacity="0.8" />
          )}
        </g>
      </svg>
    </div>
  );
};

export default OrbitalSystem;
