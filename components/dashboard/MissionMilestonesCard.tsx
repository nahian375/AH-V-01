import React from 'react';
import { DashboardViewModel } from '../../health/dashboardViewModel';
import { Trophy, Compass, CheckCircle2, ArrowRight, Activity } from 'lucide-react';
import { spaceAudio } from '../../utils/spaceAudio';

interface MissionMilestonesCardProps {
  mission: DashboardViewModel['mission'];
  onNavigateMission: () => void;
}

export const MissionMilestonesCard: React.FC<MissionMilestonesCardProps> = ({
  mission,
  onNavigateMission,
}) => {
  const handleMissionClick = () => {
    spaceAudio.playClick();
    onNavigateMission();
  };

  return (
    <section
      id="card-mission-milestones"
      aria-label="Mission Milestones and Progress"
      className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl shadow-black/40 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Mission Day & Next Milestone */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base" role="img" aria-label="Trophy">🏆</span>
              <h2 className="text-xs sm:text-sm font-bold font-mono tracking-widest text-slate-100 uppercase">
                MISSION MILESTONES
              </h2>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">
              MISSION DAY {mission.day} / {mission.totalDays}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
            <span className="font-semibold text-slate-100">{mission.nextMilestoneText}</span>
            <span className="font-bold text-cyan-300">{mission.percentComplete}% mission complete</span>
          </div>

          {/* Progress Bar with Glowing Head */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              style={{ width: `${Math.min(100, Math.max(3, mission.percentComplete))}%` }}
            />
          </div>

          {/* Secondary stats */}
          <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Check-in streak: <strong className="text-slate-200">{mission.checkInStreak} Sols</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Exercise compliance: <strong className="text-slate-200">{mission.exerciseConsistencyPercent}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Phase: <strong className="text-slate-200">{mission.phase}</strong>
            </span>
          </div>
        </div>

        {/* Right Side: View Mission Details button */}
        <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
          <button
            onClick={handleMissionClick}
            className="w-full sm:w-auto space-capsule-btn space-capsule-btn-glass text-xs py-2.5 px-5 group"
          >
            <span>VIEW MISSION TIMELINE</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
