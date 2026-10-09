/**
 * ASTRA Health - Daily Check-In Modal
 * Allows astronauts to log subjective fatigue, stress, mood, sleep quality, and notes.
 * Integrates directly with the deterministic Health Engine.
 */

import React, { useState } from 'react';
import { X, ClipboardCheck, Sparkles, Check, Heart, Zap, Brain, Moon, Smile } from 'lucide-react';

interface DailyCheckInModalProps {
  isOpen: boolean;
  sol: number;
  onClose: () => void;
  onSubmit: (data: {
    energy: number;
    stress: number;
    fatigue: number;
    mood: number;
    sleepQuality: number;
    subjectiveNotes: string;
  }) => Promise<void>;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  sol,
  onClose,
  onSubmit,
}) => {
  const [energy, setEnergy] = useState(65);
  const [stress, setStress] = useState(40);
  const [fatigue, setFatigue] = useState(55);
  const [mood, setMood] = useState(70);
  const [sleepQuality, setSleepQuality] = useState(60);
  const [subjectiveNotes, setSubjectiveNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        energy,
        stress,
        fatigue,
        mood,
        sleepQuality,
        subjectiveNotes,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="daily-checkin-modal"
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50">
              <ClipboardCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-slate-100">
                DAILY ASTRONAUT CHECK-IN • SOL {sol}
              </h3>
              <p className="text-xs text-slate-400">
                Subjective physiological & psychological recovery log
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Sliders Grid */}
          <div className="space-y-4">
            
            {/* 1. Energy */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Perceived Energy
                </span>
                <span className="font-bold text-amber-400">{energy} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* 2. Fatigue */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Physical Fatigue Index
                </span>
                <span className={`font-bold ${fatigue > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {fatigue} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={fatigue}
                onChange={(e) => setFatigue(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* 3. Stress */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Brain className="w-3.5 h-3.5 text-purple-400" /> Cognitive / Mission Stress
                </span>
                <span className="font-bold text-purple-400">{stress} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* 4. Sleep Quality */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Moon className="w-3.5 h-3.5 text-cyan-400" /> Sleep Quality & Restfulness
                </span>
                <span className="font-bold text-cyan-400">{sleepQuality} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* 5. Mood */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Smile className="w-3.5 h-3.5 text-emerald-400" /> Overall Morale
                </span>
                <span className="font-bold text-emerald-400">{mood} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

          </div>

          {/* Subjective Notes */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              Subjective Observations (e.g. Berth acoustic noise, muscle soreness, headaches)
            </label>
            <textarea
              value={subjectiveNotes}
              onChange={(e) => setSubjectiveNotes(e.target.value)}
              placeholder="e.g. Berth ventilation fan noise interrupted sleep around 03:00. Slight calf tension after ARED squats."
              rows={3}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-500">
              Saves offline to IndexedDB & syncs when connected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-checkin-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>RECORDED!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isSubmitting ? 'ANALYZING...' : 'SUBMIT CHECK-IN'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
