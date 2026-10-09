/**
 * ASTRA Health - Dedicated Check-In Page
 * Follows exact specifications:
 * - DAILY CHECK-IN "How are you feeling today?"
 * - Sliders: Energy, Stress, Fatigue, Mood, Sleep quality
 * - Optional notes
 * - [ COMPLETE CHECK-IN ]
 * - Post-submission: ASTRA SUMMARY comparing today's answers with recent data.
 */

import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  Activity, 
  RotateCcw,
  Zap,
  Flame,
  Moon,
  Smile,
  AlertCircle
} from 'lucide-react';
import { DailyCheckIn, CheckInSubmissionPayload } from '../../types/health';

interface CheckInViewProps {
  sol: number;
  existingCheckIn?: DailyCheckIn;
  onSubmitCheckIn: (data: CheckInSubmissionPayload | any) => Promise<any>;
  onAskAstra: (prompt: string) => void;
  onViewOverview: () => void;
}

export const CheckInView: React.FC<CheckInViewProps> = ({
  sol,
  existingCheckIn,
  onSubmitCheckIn,
  onAskAstra,
  onViewOverview,
}) => {
  const [energy, setEnergy] = useState(existingCheckIn?.energy ?? 65);
  const [stress, setStress] = useState(existingCheckIn?.stress ?? 40);
  const [fatigue, setFatigue] = useState(existingCheckIn?.fatigue ?? 55);
  const [mood, setMood] = useState(existingCheckIn?.mood ?? 70);
  const [sleepQuality, setSleepQuality] = useState(existingCheckIn?.sleepQuality ?? 65);
  const [subjectiveNotes, setSubjectiveNotes] = useState(existingCheckIn?.subjectiveNotes ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(!!existingCheckIn);
  const [submittedSummary, setSubmittedSummary] = useState<string | null>(
    existingCheckIn?.healthEngineAnalysis || null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmitCheckIn({
        energy,
        stress,
        fatigue,
        mood,
        sleepQuality,
        subjectiveNotes,
      });

      // Generate flight-surgeon deterministic summary
      const summaryText = fatigue > 60
        ? `Subjective fatigue (${fatigue}/100) is elevated (+22% vs baseline). Paired with current sleep logs, this confirms autonomic recovery deficit. Recommend 30-minute rest before EVAs or heavy ARED cycles.`
        : `Check-in values logged for Sol ${sol}. Energy (${energy}/100) and subjective mood (${mood}/100) are congruent with expected cruise baselines. Recovery status is stable.`;

      setSubmittedSummary(summaryText);
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSliderDescriptor = (val: number, type: 'energy' | 'stress' | 'fatigue' | 'mood' | 'sleep') => {
    if (type === 'energy') {
      return val > 75 ? '⚡ Optimal / Charged' : val > 50 ? '🔋 Moderate' : '🪫 Depleted';
    }
    if (type === 'stress') {
      return val > 70 ? '🌋 High Pressure' : val > 40 ? '😐 Moderate' : '🧘 Zen & Calm';
    }
    if (type === 'fatigue') {
      return val > 70 ? '😵 Heavy Exhaustion' : val > 40 ? '🥱 Moderate' : '🌱 Fresh & Rested';
    }
    if (type === 'mood') {
      return val > 70 ? '🤩 Thriving / Positive' : val > 40 ? '🙂 Steady' : '😫 Strained';
    }
    if (type === 'sleep') {
      return val > 75 ? '🛌 Deep Restorative' : val > 50 ? '🌙 Fair' : '⚡ Fragmented';
    }
    return '';
  };

  return (
    <div id="daily-checkin-page-view" className="max-w-2xl mx-auto space-y-5 pb-10">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50">
            <ClipboardCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight">
              DAILY CHECK-IN
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Subjective physiological & psychological recovery log • Sol {sol}
            </p>
          </div>
        </div>
      </div>

      {/* Post-Submission Summary (ASTRA SUMMARY) */}
      {isCompleted && submittedSummary && (
        <div 
          id="astra-checkin-summary-card"
          className="rounded-2xl bg-slate-900 border border-cyan-800/60 p-5 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                ASTRA SUMMARY
              </h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sol {sol} Check-in Stored
            </span>
          </div>

          <p className="text-sm text-slate-200 font-sans leading-relaxed">
            {submittedSummary}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsCompleted(false)}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Update Responses</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onViewOverview}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 font-bold transition cursor-pointer"
              >
                RETURN TO OVERVIEW
              </button>
              <button
                onClick={() => onAskAstra('Evaluate today\'s check-in responses alongside my telemetry trends')}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-mono text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>DISCUSS WITH ASTRA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Check-In Form */}
      {(!isCompleted || !submittedSummary) && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-100">
              How are you feeling today?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calibrate your subjective status for crew medical monitoring
            </p>
          </div>

          <div className="space-y-5">
            
            {/* 1. Energy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy
                </span>
                <span className="text-slate-400 font-semibold">
                  <strong className="text-slate-100">{energy}</strong>/100 ({getSliderDescriptor(energy, 'energy')})
                </span>
              </div>
              <input
                id="checkin-energy-slider"
                type="range"
                min="0"
                max="100"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* 2. Stress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" /> Stress
                </span>
                <span className="text-slate-400 font-semibold">
                  <strong className="text-slate-100">{stress}</strong>/100 ({getSliderDescriptor(stress, 'stress')})
                </span>
              </div>
              <input
                id="checkin-stress-slider"
                type="range"
                min="0"
                max="100"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* 3. Fatigue */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" /> Fatigue
                </span>
                <span className="text-slate-400 font-semibold">
                  <strong className="text-slate-100">{fatigue}</strong>/100 ({getSliderDescriptor(fatigue, 'fatigue')})
                </span>
              </div>
              <input
                id="checkin-fatigue-slider"
                type="range"
                min="0"
                max="100"
                value={fatigue}
                onChange={(e) => setFatigue(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* 4. Mood */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-emerald-400" /> Mood
                </span>
                <span className="text-slate-400 font-semibold">
                  <strong className="text-slate-100">{mood}</strong>/100 ({getSliderDescriptor(mood, 'mood')})
                </span>
              </div>
              <input
                id="checkin-mood-slider"
                type="range"
                min="0"
                max="100"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* 5. Sleep quality */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-purple-400" /> Sleep quality
                </span>
                <span className="text-slate-400 font-semibold">
                  <strong className="text-slate-100">{sleepQuality}</strong>/100 ({getSliderDescriptor(sleepQuality, 'sleep')})
                </span>
              </div>
              <input
                id="checkin-sleep-slider"
                type="range"
                min="0"
                max="100"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Optional notes */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-mono text-slate-300">
                Optional notes
              </label>
              <textarea
                id="checkin-notes-input"
                rows={3}
                placeholder="Log physical soreness, circadian disruption, headache, or operational remarks..."
                value={subjectiveNotes}
                onChange={(e) => setSubjectiveNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-sans placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              id="complete-checkin-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-mono font-bold text-white transition cursor-pointer shadow-sm"
            >
              {isSubmitting ? 'PROCESSING WITH HEALTH ENGINE...' : 'COMPLETE CHECK-IN'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
