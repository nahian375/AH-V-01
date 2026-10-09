/**
 * ASTRA Health - Navigation Sidebar & Mobile Bar
 * Strictly implements user-specified navigation hierarchy:
 * 
 * Primary sections:
 * - OVERVIEW
 * - HEALTH (Cardio, Respiratory, Recovery, Fitness, Cognitive, Radiation subtabs inside)
 * - TRENDS
 * - ASTRA AI
 * - CHECK-IN
 * - ALERTS
 * - MISSION
 * 
 * Secondary navigation:
 * - TIMELINE
 * - CREW
 * - SETTINGS
 */

import React from 'react';
import { 
  Sparkles,
  LayoutDashboard, 
  HeartPulse, 
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
  ShieldAlert
} from 'lucide-react';

export type NavTab = 
  | 'landing'
  | 'physical'
  | 'mental'
  | 'overview' 
  | 'health' 
  | 'trends' 
  | 'astra-ai' 
  | 'check-in' 
  | 'alerts' 
  | 'mission' 
  | 'timeline' 
  | 'crew' 
  | 'settings'
  | 'what-changed'
  | 'profile';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unacknowledgedAlertsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unacknowledgedAlertsCount,
}) => {
  // Primary sections strictly as specified
  const primaryNavItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'landing',
      label: 'SPATIAL HUB',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'physical',
      label: 'PHYSICAL',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
    },
    {
      id: 'mental',
      label: 'MENTAL',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'overview',
      label: 'DASHBOARD',
      icon: <LayoutDashboard className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'astra-ai',
      label: 'ASTRA AI',
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'trends',
      label: 'TRENDS',
      icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'check-in',
      label: 'CHECK-IN',
      icon: <ClipboardCheck className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'alerts',
      label: 'ALERTS',
      icon: <BellRing className="w-4 h-4 text-rose-400" />,
    },
    {
      id: 'mission',
      label: 'MISSION',
      icon: <Rocket className="w-4 h-4 text-purple-400" />,
    },
  ];

  // Secondary navigation strictly as specified with bright, distinct icon colors
  const secondaryNavItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    specialStyle?: string;
  }[] = [
    {
      id: 'timeline',
      label: 'TIMELINE',
      icon: <History className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'crew',
      label: 'CREW',
      icon: <Users className="w-4 h-4 text-teal-400" />,
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      icon: <SettingsIcon className="w-4 h-4 text-amber-400" />,
      specialStyle: 'bg-amber-950/40 border-amber-500/60 text-amber-300 hover:bg-amber-900/60 hover:text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.25)]',
    },
  ];

  return (
    <nav 
      id="main-navigation-bar" 
      aria-label="Mission Navigation"
      className="bg-slate-950/95 border-b border-slate-800 px-3 sm:px-4 py-2 sticky top-14 z-30 shadow-lg backdrop-blur-md"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        
        {/* Primary Sections */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'overview' && activeTab === 'what-changed');
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black transition cursor-pointer relative tracking-wider ${
                  isActive
                    ? 'bg-slate-900 text-cyan-300 border border-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80 bg-slate-950/60'
                }`}
              >
                {item.icon}
                <span className="tracking-wider">{item.label}</span>
                {item.id === 'alerts' && unacknowledgedAlertsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    {unacknowledgedAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-800 shrink-0 hidden md:block" />

        {/* Secondary Sections */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 border-l md:border-l-0 border-slate-800 pl-2 md:pl-0">
          {secondaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition cursor-pointer tracking-wider ${
                  item.specialStyle
                    ? item.specialStyle
                    : isActive
                    ? 'bg-slate-900 text-slate-100 border border-slate-600 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80 bg-slate-950/60'
                }`}
              >
                {item.icon}
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
};
