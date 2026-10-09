import React from 'react';
import { ClipboardCheck, CheckCircle2, Clock, ArrowRight, RotateCcw, Calendar, History, Sparkles } from 'lucide-react';
import { DailyCheckIn } from '../../types/health';

interface TodayCheckInBannerProps {
  sol: number;
  todayCheckIn?: DailyCheckIn;
  onStartCheckIn: () => void;
  onReviewCheckIn: () => void;
  onUpdateCheckIn: () => void;
  onViewHistory?: () => void;
  variant?: 'landing' | 'dashboard';
}

export const TodayCheckInBanner: React.FC<TodayCheckInBannerProps> = ({
  sol,
  todayCheckIn,
  onStartCheckIn,
  onReviewCheckIn,
  onUpdateCheckIn,
  onViewHistory,
  variant = 'dashboard',
}) => {
  const isCompleted = !!todayCheckIn;

  // Format completed time e.g. "14:32"
  const formattedTime = todayCheckIn?.timestamp 
    ? new Date(todayCheckIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : 'Earlier today';

  const physicalScore = todayCheckIn?.physicalIndex ?? (todayCheckIn?.physical?.recovery ? Math.round(todayCheckIn.physical.recovery * 20) : null);
  const mentalScore = todayCheckIn?.mentalIndex ?? (todayCheckIn?.mood ? todayCheckIn.mood : null);

  if (variant === 'landing') {
    return (
      <div 
        id="landing-checkin-banner"
        className={`w-full max-w-xl mx-auto rounded-2xl border transition-all duration-300 p-4 sm:p-5 backdrop-blur-md shadow-lg ${
          isCompleted 
            ? 'bg-slate-900/80 border-emerald-500/40 shadow-emerald-950/20' 
            : 'bg-slate-900/80 border-cyan-500/40 shadow-cyan-950/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
              isCompleted 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' 
                : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'
            }`}>
              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded font-bold ${
                  isCompleted ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' : 'bg-cyan-950 text-cyan-400 border border-cyan-700/50'
                }`}>
                  SOL {sol}
                </span>
                <span className="text-[10px] font-mono text-slate-400">DAILY CHECK-IN</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-100 tracking-wide mt-1 flex items-center gap-1.5">
                {isCompleted ? (
                  <>
                    <span>✨</span>
                    <span>TODAY'S CHECK-IN COMPLETE</span>
                    <span>🎉</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>TODAY'S HEALTH CHECK-IN</span>
                    <span>🚀</span>
                  </>
                )}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {isCompleted ? `Completed at ${formattedTime}` : 'About 30–60 seconds'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isCompleted ? (
              <>
                <button
                  id="btn-landing-review-checkin"
                  onClick={onReviewCheckIn}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5 min-h-[44px]"
                >
                  REVIEW
                </button>
                <button
                  id="btn-landing-update-checkin"
                  onClick={onUpdateCheckIn}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-emerald-300 hover:text-emerald-100 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 transition flex items-center gap-1.5 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  UPDATE
                </button>
              </>
            ) : (
              <button
                id="btn-landing-start-checkin"
                onClick={onStartCheckIn}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-cyan-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-md shadow-cyan-950 transition flex items-center gap-2 min-h-[44px]"
              >
                <span>START CHECK-IN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard variant (full width)
  return (
    <div 
      id="dashboard-checkin-banner"
      className={`w-full rounded-2xl border transition-all duration-300 p-5 backdrop-blur-md shadow-xl ${
        isCompleted 
          ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-950/20' 
          : 'bg-slate-900/90 border-cyan-500/50 shadow-cyan-950/30'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Status & Description */}
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-xl border flex-shrink-0 ${
            isCompleted 
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-400' 
              : 'bg-cyan-950/90 border-cyan-500/60 text-cyan-400 animate-pulse'
          }`}>
            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <ClipboardCheck className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded font-bold ${
                isCompleted 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' 
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
              }`}>
                MISSION DAY • SOL {sol}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isCompleted ? 'RECORDED' : 'REQUIRED DAILY UPDATE'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-wide mt-1 flex items-center gap-2">
              {isCompleted ? (
                <>
                  <span>✨</span>
                  <span>TODAY'S CHECK-IN COMPLETE</span>
                  <span>🎉</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>TODAY'S HEALTH CHECK-IN</span>
                  <span>🚀</span>
                </>
              )}
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
              <Clock className="w-4 h-4 text-slate-500" />
              {isCompleted ? (
                <span>Completed at <strong className="text-slate-200">{formattedTime}</strong></span>
              ) : (
                <span>About <strong className="text-cyan-300">30–60 seconds</strong> to log body & wellbeing</span>
              )}
            </p>

            {isCompleted && physicalScore !== null && mentalScore !== null && (
              <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <span className="text-slate-400">
                  Physical: <strong className="text-cyan-400">{physicalScore}/100</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  Mental: <strong className="text-purple-400">{mentalScore}/100</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Synced with Health Engine
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap">
          {onViewHistory && (
            <button
              id="btn-view-checkin-history"
              onClick={onViewHistory}
              className="px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition flex items-center gap-1.5 min-h-[44px]"
            >
              <History className="w-4 h-4" />
              <span>HISTORY</span>
            </button>
          )}

          {isCompleted ? (
            <>
              <button
                id="btn-dashboard-review-checkin"
                onClick={onReviewCheckIn}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition flex items-center gap-1.5 min-h-[44px]"
              >
                <span>REVIEW</span>
              </button>
              <button
                id="btn-dashboard-update-checkin"
                onClick={onUpdateCheckIn}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 transition flex items-center gap-2 min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>UPDATE</span>
              </button>
            </>
          ) : (
            <button
              id="btn-dashboard-start-checkin"
              onClick={onStartCheckIn}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-lg shadow-cyan-950/50 hover:shadow-cyan-900 transition flex items-center gap-2 min-h-[44px]"
            >
              <span>START CHECK-IN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
