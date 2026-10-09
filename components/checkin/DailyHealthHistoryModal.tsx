import React from 'react';
import { X, Calendar, CheckCircle2, ChevronRight, Activity, HeartPulse, Brain, Clock } from 'lucide-react';
import { DailyCheckIn } from '../../types/health';

interface DailyHealthHistoryModalProps {
  isOpen: boolean;
  checkIns: DailyCheckIn[];
  onClose: () => void;
  onSelectCheckIn: (checkIn: DailyCheckIn) => void;
}

export const DailyHealthHistoryModal: React.FC<DailyHealthHistoryModalProps> = ({
  isOpen,
  checkIns,
  onClose,
  onSelectCheckIn,
}) => {
  if (!isOpen) return null;

  // Format date display (e.g. "Sep 22" or "Sol 184")
  const formatDateLabel = (checkIn: DailyCheckIn) => {
    if (checkIn.timestamp) {
      const d = new Date(checkIn.timestamp);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }
    return `Sol ${checkIn.sol}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        id="checkin-history-modal"
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wide">
                DAILY HEALTH HISTORY
              </h3>
              <p className="text-xs text-slate-400">
                Logged crew member evaluations ({checkIns.length} records)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close History Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of check-ins */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {checkIns.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono text-sm">
              No daily check-in records logged yet.
            </div>
          ) : (
            checkIns.map((ci) => {
              const pScore = ci.physicalIndex ?? (ci.physical?.recovery ? Math.round(ci.physical.recovery * 20) : 84);
              const mScore = ci.mentalIndex ?? (ci.mood ? ci.mood : 80);
              const timeStr = ci.timestamp ? new Date(ci.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <button
                  key={ci.id}
                  onClick={() => onSelectCheckIn(ci)}
                  className="w-full text-left p-4 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-600/60 transition group flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition">
                          {formatDateLabel(ci)}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                          SOL {ci.sol}
                        </span>
                        {timeStr && (
                          <span className="text-xs text-slate-500 font-mono">
                            {timeStr}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                        <span className="text-cyan-400 flex items-center gap-1">
                          <HeartPulse className="w-3.5 h-3.5" />
                          Physical {pScore}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-purple-400 flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" />
                          Mental {mScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      ✓ Complete
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Click any date to review recorded metrics</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
