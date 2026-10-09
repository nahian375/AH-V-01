import React from 'react';

interface OrbitingSpacecraftProps {
  showHudTelemetry: boolean;
}

export const OrbitingSpacecraft: React.FC<OrbitingSpacecraftProps> = ({ showHudTelemetry }) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10">
      {/* ============================================================ */}
      {/* 1. INTERNATIONAL SPACE STATION (ISS) IN LOW EARTH ORBIT      */}
      {/* Orbits across the upper atmosphere limb with blinking lights */}
      {/* ============================================================ */}
      <div 
        className="absolute iss-orbit-motion pointer-events-auto group cursor-pointer"
        style={{
          top: '24%',
          left: '18%',
          transform: 'scale(0.85)',
        }}
        title="International Space Station (ISS) • Expedition 73 • Alt: 418 km"
      >
        <div className="relative">
          {/* HUD Targeting Box & Telemetry Tag (When HUD is enabled or on hover) */}
          <div className={`absolute -top-9 -left-8 whitespace-nowrap transition-opacity duration-300 font-mono text-[9px] ${
            showHudTelemetry ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 border border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold">ISS (EXP-73)</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">418 KM • 7.66 KM/S</span>
            </div>
            {/* Target Reticle Corners */}
            <div className="absolute -inset-2 border border-dashed border-cyan-500/30 rounded pointer-events-none" />
          </div>

          {/* SVG ISS Model with High Detail */}
          <svg 
            width="110" 
            height="72" 
            viewBox="0 0 110 72" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          >
            <defs>
              {/* Golden Photovoltaic Solar Array Gradient */}
              <linearGradient id="issSolarGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
              </linearGradient>

              {/* Module Metallic Gradient */}
              <linearGradient id="issModuleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* Radiator White Sheen */}
              <linearGradient id="issRadiatorGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Central Truss Structure */}
            <rect x="18" y="34.5" width="74" height="3" rx="1.5" fill="#64748b" />
            <line x1="22" y1="36" x2="88" y2="36" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />

            {/* Left Port Solar Wings (4 Panels) */}
            <g>
              <rect x="4" y="6" width="16" height="25" rx="1" fill="url(#issSolarGrad)" stroke="#fef08a" strokeWidth="0.5" />
              <rect x="4" y="41" width="16" height="25" rx="1" fill="url(#issSolarGrad)" stroke="#fef08a" strokeWidth="0.5" />
              {/* Solar Array Grid Lines */}
              <line x1="4" y1="14" x2="20" y2="14" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="4" y1="22" x2="20" y2="22" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="4" y1="49" x2="20" y2="49" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="4" y1="57" x2="20" y2="57" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="12" y1="6" x2="12" y2="31" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="12" y1="41" x2="12" y2="66" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              {/* Port Navigation Light (Steady Red 620nm) */}
              <circle cx="4" cy="36" r="1.8" fill="#ef4444" className="shadow-[0_0_8px_#ef4444]" />
            </g>

            {/* Right Starboard Solar Wings (4 Panels) */}
            <g>
              <rect x="90" y="6" width="16" height="25" rx="1" fill="url(#issSolarGrad)" stroke="#fef08a" strokeWidth="0.5" />
              <rect x="90" y="41" width="16" height="25" rx="1" fill="url(#issSolarGrad)" stroke="#fef08a" strokeWidth="0.5" />
              {/* Solar Array Grid Lines */}
              <line x1="90" y1="14" x2="106" y2="14" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="90" y1="22" x2="106" y2="22" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="90" y1="49" x2="106" y2="49" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="90" y1="57" x2="106" y2="57" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="98" y1="6" x2="98" y2="31" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              <line x1="98" y1="41" x2="98" y2="66" stroke="#000000" strokeWidth="0.5" opacity="0.6" />
              {/* Starboard Navigation Light (Steady Green 525nm) */}
              <circle cx="106" cy="36" r="1.8" fill="#22c55e" className="shadow-[0_0_8px_#22c55e]" />
            </g>

            {/* Thermal Radiator Panels */}
            <rect x="36" y="16" width="8" height="15" rx="0.5" fill="url(#issRadiatorGrad)" stroke="#94a3b8" strokeWidth="0.4" />
            <rect x="66" y="16" width="8" height="15" rx="0.5" fill="url(#issRadiatorGrad)" stroke="#94a3b8" strokeWidth="0.4" />

            {/* Pressurized Modules Complex (Zarya, Unity, Destiny, Harmony, Kibo, Columbus) */}
            <rect x="51" y="22" width="8" height="28" rx="2" fill="url(#issModuleGrad)" stroke="#cbd5e1" strokeWidth="0.6" />
            {/* Cross module */}
            <rect x="45" y="32" width="20" height="7" rx="1.5" fill="url(#issModuleGrad)" stroke="#cbd5e1" strokeWidth="0.6" />
            {/* Docked Crew Vehicle (Dragon / Soyuz capsule) */}
            <circle cx="55" cy="52" r="3.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
            {/* Cupola Window Dome */}
            <circle cx="55" cy="35.5" r="2" fill="#38bdf8" />

            {/* High-Intensity Anti-Collision Flashing White Strobe (1 Hz) */}
            <circle cx="55" cy="22" r="2" fill="#ffffff" className="animate-ping" style={{ animationDuration: '1.2s' }} />
            <circle cx="55" cy="22" r="1.2" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. EXPLORATION / TDRS COMMSAT WITH GOLD MLI FOIL             */}
      {/* In higher orbit drifting gracefully with communication link  */}
      {/* ============================================================ */}
      <div 
        className="absolute satellite-orbit-motion pointer-events-auto group cursor-pointer"
        style={{
          top: '68%',
          right: '16%',
          transform: 'scale(0.8)',
        }}
        title="TDRS-13 Deep Space Comms Relay • GEO 35,786 km • Ku/Ka Band"
      >
        <div className="relative">
          {/* HUD Telemetry Tag */}
          <div className={`absolute -top-8 -left-12 whitespace-nowrap transition-opacity duration-300 font-mono text-[9px] ${
            showHudTelemetry ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 border border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold">TDRS-13 RELAY</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">GEO 35,786 KM</span>
            </div>
            <div className="absolute -inset-2 border border-dashed border-amber-500/30 rounded pointer-events-none" />
          </div>

          <svg width="86" height="54" viewBox="0 0 86 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="satSolar" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0369a1" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="satGoldFoil" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>

            {/* Left Solar Array */}
            <rect x="2" y="21" width="26" height="12" rx="1" fill="url(#satSolar)" stroke="#38bdf8" strokeWidth="0.5" />
            <line x1="8" y1="21" x2="8" y2="33" stroke="#000" strokeWidth="0.5" />
            <line x1="15" y1="21" x2="15" y2="33" stroke="#000" strokeWidth="0.5" />
            <line x1="22" y1="21" x2="22" y2="33" stroke="#000" strokeWidth="0.5" />

            {/* Right Solar Array */}
            <rect x="58" y="21" width="26" height="12" rx="1" fill="url(#satSolar)" stroke="#38bdf8" strokeWidth="0.5" />
            <line x1="64" y1="21" x2="64" y2="33" stroke="#000" strokeWidth="0.5" />
            <line x1="71" y1="21" x2="71" y2="33" stroke="#000" strokeWidth="0.5" />
            <line x1="78" y1="21" x2="78" y2="33" stroke="#000" strokeWidth="0.5" />

            {/* Satellite Bus Body (Gold Thermal Blanket MLI) */}
            <rect x="36" y="19" width="14" height="16" rx="2" fill="url(#satGoldFoil)" stroke="#fde047" strokeWidth="0.6" />

            {/* High-Gain Parabolic Dish Antenna */}
            <path d="M 33 14 C 43 7, 53 14, 53 14" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
            <line x1="43" y1="10" x2="43" y2="19" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="43" cy="9" r="1.5" fill="#38bdf8" />

            {/* Downlink Telemetry Carrier Strobe (Cyan) */}
            <circle cx="43" cy="27" r="1.5" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="43" cy="27" r="1" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. DANCING AURORA BOREALIS / POLAR ATMOSPHERIC IONIZATION     */}
      {/* Ethereal green & violet ionization curtains along the limb   */}
      {/* ============================================================ */}
      <div 
        className="absolute w-full h-[220px] pointer-events-none opacity-40 mix-blend-screen aurora-curtain-pulse"
        style={{
          top: '8%',
          left: '0',
          background: 'radial-gradient(ellipse 70% 35% at 50% 30%, rgba(16, 185, 129, 0.45) 0%, rgba(139, 92, 246, 0.25) 45%, rgba(6, 182, 212, 0.15) 70%, transparent 100%)',
          filter: 'blur(28px)',
        }}
      />
    </div>
  );
};
