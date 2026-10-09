import React, { useState, useEffect } from 'react';
import spaceOrbitBg from '../../assets/images/space_orbit_background_1789939376378.jpg';
import { Eye, EyeOff, Radio, Compass, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';

/**
 * ASTRA Health - Dynamic Space Orbit Background & Aerospace Environment
 * 
 * Features:
 * - Authentic Low Earth Orbit (LEO) background with astronaut EVA spacewalk
 * - Earth limb curvature with radiant blue atmospheric glow and orbital sunlight
 * - Realistic microgravity float physics (smooth 24s translation)
 * - Animated celestial star twinkle & radar telemetry sweep
 * - Dynamic flight telemetry stats (Orbital velocity, altitude, EVA elapsed time)
 * - Opacity control for optimal ergonomic readability (High Contrast / Cinematic / Full)
 */
export const SpaceBackground: React.FC = () => {
  const [bgMode, setBgMode] = useState<'CINEMATIC' | 'BALANCED' | 'STEALTH'>(() => {
    try {
      return (localStorage.getItem('astra_bg_mode') as any) || 'BALANCED';
    } catch {
      return 'BALANCED';
    }
  });

  const [orbitalStats, setOrbitalStats] = useState({
    velocity: 7.668,
    altitude: 408.4,
    evaTimer: '03:42:19',
    cabinO2: 20.9,
    gForce: 0.0002,
  });

  // Dynamic live orbital telemetry ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setOrbitalStats(prev => ({
        velocity: Number((7.665 + Math.sin(Date.now() / 8000) * 0.008).toFixed(3)),
        altitude: Number((408.2 + Math.cos(Date.now() / 12000) * 0.4).toFixed(1)),
        evaTimer: prev.evaTimer,
        cabinO2: 20.9,
        gForce: 0.0002,
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleModeChange = (mode: 'CINEMATIC' | 'BALANCED' | 'STEALTH') => {
    setBgMode(mode);
    spaceAudio.playClick();
    try {
      localStorage.setItem('astra_bg_mode', mode);
    } catch {}
  };

  // Dynamic opacity settings based on chosen mode
  const bgOpacity = {
    CINEMATIC: 'opacity-70',
    BALANCED: 'opacity-40',
    STEALTH: 'opacity-20',
  }[bgMode];

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Deep Space Cosmic Void Canvas */}
      <div className="absolute inset-0 bg-[#020612]" />

      {/* 2. PHOTOREALISTIC ASTRONAUT & EARTH ORBIT LAYER */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${bgOpacity}`}
      >
        <div className="relative w-full h-full animate-astronaut-float origin-center">
          <img
            src={spaceOrbitBg}
            alt="Astronaut spacewalk in Earth orbit"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 filter brightness-95 contrast-105"
          />

          {/* Atmospheric Blue Rim Lighting & Solar Horizon Radiance */}
          <div 
            className="absolute inset-0 animate-atmospheric-pulse mix-blend-screen pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 90%, rgba(56, 189, 248, 0.35) 0%, rgba(14, 116, 144, 0.15) 45%, transparent 80%)'
            }}
          />
        </div>
      </div>

      {/* 3. Deep-Space Atmospheric Vignette & Contrast Guard */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(2, 6, 18, 0.4) 0%, rgba(2, 6, 18, 0.8) 60%, #010308 100%)',
        }}
      />

      {/* 4. Twinkling Celestial Starfield Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9%" cy="14%" r="1.2" fill="#ffffff" className="animate-star-1" />
        <circle cx="16%" cy="24%" r="1" fill="#bae6fd" className="animate-star-2" />
        <circle cx="23%" cy="8%" r="0.8" fill="#ffffff" className="animate-star-3" />
        <circle cx="36%" cy="17%" r="1.4" fill="#e2e8f0" className="animate-star-1" />
        <circle cx="48%" cy="11%" r="0.9" fill="#bae6fd" className="animate-star-2" />
        <circle cx="68%" cy="15%" r="1.1" fill="#ffffff" className="animate-star-3" />
        <circle cx="77%" cy="28%" r="0.8" fill="#bae6fd" className="animate-star-1" />
        <circle cx="85%" cy="13%" r="1.5" fill="#e0f2fe" className="animate-star-2" />
        <circle cx="93%" cy="25%" r="0.9" fill="#ffffff" className="animate-star-3" />

        {/* Quiet celestial dots */}
        <circle cx="14%" cy="52%" r="0.7" fill="#cbd5e1" opacity="0.3" />
        <circle cx="31%" cy="61%" r="0.9" fill="#93c5fd" opacity="0.35" />
        <circle cx="71%" cy="49%" r="0.8" fill="#bae6fd" opacity="0.4" />
        <circle cx="88%" cy="56%" r="1" fill="#ffffff" opacity="0.35" />
      </svg>

      {/* 5. Orbital Radar Scanning Sweep Beam */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
        <div 
          className="w-full h-32 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-radar-sweep"
        />
      </div>

      {/* 6. Subtle Astronaut EVA Telemetry HUD watermark in lower corners */}
      <div className="hidden lg:flex absolute bottom-4 left-6 z-10 pointer-events-auto items-center gap-4 text-[10px] font-mono tracking-widest text-slate-400/70 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800/80 shadow-lg">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          EVA TELEMETRY
        </span>
        <span className="text-slate-600">|</span>
        <span>VEL: <strong className="text-slate-200">{orbitalStats.velocity} KM/S</strong></span>
        <span className="text-slate-600">|</span>
        <span>ALT: <strong className="text-slate-200">{orbitalStats.altitude} KM</strong></span>
        <span className="text-slate-600">|</span>
        <span>O₂: <strong className="text-slate-200">{orbitalStats.cabinO2}%</strong></span>
        <span className="text-slate-600">|</span>
        <span>G: <strong className="text-emerald-400">{orbitalStats.gForce}G</strong></span>
      </div>

      {/* 7. Ergonomic Background Viewport Switcher (Bottom right floating pill) */}
      <div className="absolute bottom-4 right-6 z-10 pointer-events-auto flex items-center gap-1 bg-slate-950/70 backdrop-blur-md p-1 rounded-full border border-slate-800/90 shadow-xl text-[10px] font-mono">
        <span className="text-slate-400 px-2 font-bold uppercase tracking-wider hidden sm:inline">
          ORBIT VIEW:
        </span>
        <button
          onClick={() => handleModeChange('STEALTH')}
          className={`px-2.5 py-1 rounded-full transition font-bold cursor-pointer ${
            bgMode === 'STEALTH' 
              ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-800' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Minimal background for maximum text contrast"
        >
          STEALTH
        </button>
        <button
          onClick={() => handleModeChange('BALANCED')}
          className={`px-2.5 py-1 rounded-full transition font-bold cursor-pointer ${
            bgMode === 'BALANCED' 
              ? 'bg-cyan-700 text-white shadow-xs' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Balanced space atmosphere with crisp UI contrast"
        >
          BALANCED
        </button>
        <button
          onClick={() => handleModeChange('CINEMATIC')}
          className={`px-2.5 py-1 rounded-full transition font-bold cursor-pointer ${
            bgMode === 'CINEMATIC' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-950' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Vibrant cinematic astronaut spacewalk view"
        >
          CINEMATIC
        </button>
      </div>
    </div>
  );
};
