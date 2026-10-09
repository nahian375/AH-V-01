import React, { useState, useEffect } from 'react';
import { 
  X, 
  HeartPulse, 
  Brain, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Save, 
  RotateCcw,
  Activity,
  Moon,
  Zap,
  Flame,
  Smile,
  AlertCircle,
  HelpCircle,
  Clock,
  Radiation
} from 'lucide-react';
import { DailyCheckIn, CheckInSubmissionPayload } from '../../types/health';
import { spaceAudio } from '../../utils/spaceAudio';

interface QuickDailyCheckInModalProps {
  isOpen: boolean;
  sol: number;
  existingCheckIn?: DailyCheckIn;
  mode?: 'create' | 'review' | 'update';
  onClose: () => void;
  onSubmit: (data: CheckInSubmissionPayload) => Promise<{
    success: boolean;
    physicalIndex: number;
    mentalIndex: number;
    isUpdate: boolean;
  }>;
  onNavigateDashboard?: () => void;
  onNavigateTrends?: () => void;
}

export const QuickDailyCheckInModal: React.FC<QuickDailyCheckInModalProps> = ({
  isOpen,
  sol,
  existingCheckIn,
  mode = 'create',
  onClose,
  onSubmit,
  onNavigateDashboard,
  onNavigateTrends,
}) => {
  // Step: 1 = Physical, 2 = Mental, 3 = Review, 4 = Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(mode === 'review' ? 3 : 1);
  const [viewMode, setViewMode] = useState<'edit' | 'review'>(mode === 'review' ? 'review' : 'edit');

  // Step 1: Physical inputs
  const [heartRate, setHeartRate] = useState<string>(
    existingCheckIn?.physical?.heartRate ? String(existingCheckIn.physical.heartRate) : ''
  );
  const [spo2, setSpo2] = useState<string>(
    existingCheckIn?.physical?.spo2 ? String(existingCheckIn.physical.spo2) : ''
  );
  const [exerciseMinutes, setExerciseMinutes] = useState<string>(
    existingCheckIn?.physical?.exerciseMinutes !== undefined ? String(existingCheckIn.physical.exerciseMinutes) : ''
  );
  const [recovery, setRecovery] = useState<number | null>(
    existingCheckIn?.physical?.recovery ?? null
  );

  // Step 2: Mental & Wellbeing inputs
  const [sleepHours, setSleepHours] = useState<string>(
    existingCheckIn?.mental?.sleepHours !== undefined 
      ? String(existingCheckIn.mental.sleepHours) 
      : existingCheckIn?.mental?.sleepDurationMinutes 
        ? String(Math.floor(existingCheckIn.mental.sleepDurationMinutes / 60)) 
        : '7'
  );
  const [sleepMinutes, setSleepMinutes] = useState<string>(
    existingCheckIn?.mental?.sleepMinutes !== undefined 
      ? String(existingCheckIn.mental.sleepMinutes) 
      : existingCheckIn?.mental?.sleepDurationMinutes 
        ? String(existingCheckIn.mental.sleepDurationMinutes % 60) 
        : '15'
  );
  const [mood, setMood] = useState<number | null>(
    existingCheckIn?.mental?.mood ?? (existingCheckIn?.mood ? Math.round(existingCheckIn.mood / 20) : 4)
  );
  const [stress, setStress] = useState<number | null>(
    existingCheckIn?.mental?.stress ?? (existingCheckIn?.stress ? Math.round(existingCheckIn.stress / 20) : 2)
  );
  const [energy, setEnergy] = useState<number | null>(
    existingCheckIn?.mental?.energy ?? (existingCheckIn?.energy ? Math.round(existingCheckIn.energy / 20) : 4)
  );
  const [fatigue, setFatigue] = useState<number | null>(
    existingCheckIn?.mental?.fatigue ?? (existingCheckIn?.fatigue ? Math.round(existingCheckIn.fatigue / 20) : 2)
  );

  // Status & Validation
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultIndices, setResultIndices] = useState<{ physical: number; mental: number }>({
    physical: existingCheckIn?.physicalIndex ?? 84,
    mental: existingCheckIn?.mentalIndex ?? 82,
  });

  // Prepopulate when existingCheckIn or mode changes
  useEffect(() => {
    if (existingCheckIn) {
      if (existingCheckIn.physical?.heartRate) setHeartRate(String(existingCheckIn.physical.heartRate));
      if (existingCheckIn.physical?.spo2) setSpo2(String(existingCheckIn.physical.spo2));
      if (existingCheckIn.physical?.exerciseMinutes !== undefined) setExerciseMinutes(String(existingCheckIn.physical.exerciseMinutes));
      if (existingCheckIn.physical?.recovery !== undefined) setRecovery(existingCheckIn.physical.recovery);

      if (existingCheckIn.mental?.sleepHours !== undefined) {
        setSleepHours(String(existingCheckIn.mental.sleepHours));
      } else if (existingCheckIn.mental?.sleepDurationMinutes) {
        setSleepHours(String(Math.floor(existingCheckIn.mental.sleepDurationMinutes / 60)));
      }

      if (existingCheckIn.mental?.sleepMinutes !== undefined) {
        setSleepMinutes(String(existingCheckIn.mental.sleepMinutes));
      } else if (existingCheckIn.mental?.sleepDurationMinutes) {
        setSleepMinutes(String(existingCheckIn.mental.sleepDurationMinutes % 60));
      }

      if (existingCheckIn.mental?.mood !== undefined) setMood(existingCheckIn.mental.mood);
      if (existingCheckIn.mental?.stress !== undefined) setStress(existingCheckIn.mental.stress);
      if (existingCheckIn.mental?.energy !== undefined) setEnergy(existingCheckIn.mental.energy);
      if (existingCheckIn.mental?.fatigue !== undefined) setFatigue(existingCheckIn.mental.fatigue);
    }
    if (mode === 'review') {
      setViewMode('review');
      setCurrentStep(3);
    } else {
      setViewMode('edit');
      setCurrentStep(1);
    }
  }, [existingCheckIn, mode, isOpen]);

  if (!isOpen) return null;

  // Validation function
  const validateStep1 = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (heartRate.trim()) {
      const hr = Number(heartRate);
      if (isNaN(hr) || hr < 35 || hr > 220) {
        errors.heartRate = 'Heart rate must be between 35 and 220 bpm.';
      }
    }

    if (spo2.trim()) {
      const sp = Number(spo2);
      if (isNaN(sp) || sp < 70 || sp > 100) {
        errors.spo2 = 'SpO₂ percentage must be between 70% and 100%.';
      }
    }

    if (exerciseMinutes.trim()) {
      const ex = Number(exerciseMinutes);
      if (isNaN(ex) || ex < 0 || ex > 360) {
        errors.exerciseMinutes = 'Exercise minutes must be between 0 and 360.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (sleepHours.trim()) {
      const sh = Number(sleepHours);
      if (isNaN(sh) || sh < 0 || sh > 24) {
        errors.sleepHours = 'Sleep hours must be between 0 and 24.';
      }
    }

    if (sleepMinutes.trim()) {
      const sm = Number(sleepMinutes);
      if (isNaN(sm) || sm < 0 || sm > 59) {
        errors.sleepMinutes = 'Sleep minutes must be between 0 and 59.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      spaceAudio.playExecute();
      setCurrentStep(2);
    }
  };

  const handleNextStep2 = () => {
    if (validateStep2()) {
      spaceAudio.playExecute();
      setCurrentStep(3);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const totalSleepMinutes = ((Number(sleepHours) || 0) * 60) + (Number(sleepMinutes) || 0);

      const payload: CheckInSubmissionPayload = {
        physical: {
          heartRate: heartRate.trim() ? Number(heartRate) : undefined,
          spo2: spo2.trim() ? Number(spo2) : undefined,
          exerciseMinutes: exerciseMinutes.trim() ? Number(exerciseMinutes) : undefined,
          recovery: recovery ?? undefined,
        },
        mental: {
          sleepHours: sleepHours.trim() ? Number(sleepHours) : undefined,
          sleepMinutes: sleepMinutes.trim() ? Number(sleepMinutes) : undefined,
          sleepDurationMinutes: totalSleepMinutes > 0 ? totalSleepMinutes : undefined,
          mood: mood ?? 4,
          stress: stress ?? 2,
          energy: energy ?? 4,
          fatigue: fatigue ?? 2,
        },
        source: 'astronaut',
      };

      const result = await onSubmit(payload);
      setResultIndices({
        physical: result.physicalIndex,
        mental: result.mentalIndex,
      });
      spaceAudio.playExecute();
      setCurrentStep(4); // Move to Success Screen
    } catch (err) {
      console.error('Check-in submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        id="quick-checkin-modal"
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ============================================================ */}
        {/* HEADER & STEP PROGRESS INDICATOR                             */}
        {/* ============================================================ */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    SOL {sol}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">RAPID HEALTH UPDATE</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 tracking-wide mt-0.5">
                  {currentStep === 4 ? 'CHECK-IN COMPLETED' : 'TODAY\'S HEALTH CHECK-IN'}
                </h3>
              </div>
            </div>

            <button
              id="btn-close-checkin-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close Check-in Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator (Steps 1 to 3) */}
          {currentStep < 4 && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">
                  STEP {currentStep} OF 3
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400">
                  {currentStep === 1 && 'Bio Signal'}
                  {currentStep === 2 && 'Neural Signal & Wellbeing'}
                  {currentStep === 3 && (viewMode === 'review' ? 'Current Check-in Review' : 'Check-in Summary')}
                </span>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${currentStep >= 1 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-700'}`} />
                <span className="w-4 h-0.5 bg-slate-700" />
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${currentStep >= 2 ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-700'}`} />
                <span className="w-4 h-0.5 bg-slate-700" />
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${currentStep >= 3 ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-slate-700'}`} />
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* STEP 1: PHYSICAL HEALTH                                      */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100 tracking-wide flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-cyan-400" />
                <span>HOW IS YOUR BODY TODAY?</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your current physiological telemetry. Unmeasured fields may be skipped.
              </p>
            </div>

            <div className="space-y-4">
              {/* 1. Heart Rate */}
              <div>
                <label htmlFor="input-checkin-hr" className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Heart Rate <span className="text-slate-500 lowercase">(bpm)</span>
                </label>
                <div className="relative">
                  <input
                    id="input-checkin-hr"
                    type="number"
                    min="35"
                    max="220"
                    placeholder="e.g. 74"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-base font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none transition min-h-[44px]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    BPM
                  </span>
                </div>
                {validationErrors.heartRate && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.heartRate}
                  </p>
                )}
              </div>

              {/* 2. SpO2 */}
              <div>
                <label htmlFor="input-checkin-spo2" className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  SpO₂ <span className="text-slate-500 lowercase">(%)</span>
                </label>
                <div className="relative">
                  <input
                    id="input-checkin-spo2"
                    type="number"
                    min="70"
                    max="100"
                    step="0.1"
                    placeholder="e.g. 98.2"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-base font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none transition min-h-[44px]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    %
                  </span>
                </div>
                {validationErrors.spo2 && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.spo2}
                  </p>
                )}
              </div>

              {/* 3. Exercise */}
              <div>
                <label htmlFor="input-checkin-exercise" className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Exercise <span className="text-slate-500 lowercase">(minutes)</span>
                </label>
                <div className="relative">
                  <input
                    id="input-checkin-exercise"
                    type="number"
                    min="0"
                    max="360"
                    placeholder="e.g. 40"
                    value={exerciseMinutes}
                    onChange={(e) => setExerciseMinutes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-base font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none transition min-h-[44px]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    MIN
                  </span>
                </div>
                {validationErrors.exerciseMinutes && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.exerciseMinutes}
                  </p>
                )}
              </div>

              {/* 4. Recovery (1-5 Scale) */}
              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-900/40">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase text-cyan-200 flex items-center gap-1.5 font-bold">
                    <span className="text-base">💪</span>
                    <span>RECOVERY RATING</span>
                  </label>
                  <span className="text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60 shadow-inner">
                    {recovery === 1 && '🛑 1/5 (Very Poor / Strained)'}
                    {recovery === 2 && '⚠️ 2/5 (Sub-optimal)'}
                    {recovery === 3 && '🔋 3/5 (Moderate / Stable)'}
                    {recovery === 4 && '💪 4/5 (Good Recovery)'}
                    {recovery === 5 && '🏆 5/5 (Peak Condition!)'}
                    {recovery === null && 'Optional'}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, emoji: '🛑', label: 'Poor' },
                    { val: 2, emoji: '⚠️', label: 'Sub-opt' },
                    { val: 3, emoji: '🔋', label: 'Mid' },
                    { val: 4, emoji: '💪', label: 'Good' },
                    { val: 5, emoji: '🏆', label: 'Peak' },
                  ].map(({ val, emoji, label }) => (
                    <button
                      key={val}
                      type="button"
                      id={`btn-recovery-${val}`}
                      onClick={() => {
                        spaceAudio.playClick();
                        setRecovery(val);
                      }}
                      className={`py-2.5 px-1 rounded-xl font-mono border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer transform active:scale-95 ${
                        recovery === val
                          ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 text-slate-950 font-black border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.6)] scale-[1.03]'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/40'
                      }`}
                    >
                      <span className="text-lg leading-none transition-transform hover:scale-125">{emoji}</span>
                      <span className="text-xs font-black">{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Optional Radiation Check (Section 22) */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                    <Radiation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">Radiation Dosimetry</span>
                    <span className="text-[10px] text-slate-500">Personal dosimeter badge: Active</span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 flex items-center gap-1 font-bold">
                  <span>✓</span> Auto-Captured
                </span>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Skip unmeasured metrics anytime
              </span>

              <button
                id="btn-step1-next"
                type="button"
                onClick={handleNextStep1}
                className="px-6 py-3 rounded-xl font-mono text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-md shadow-cyan-950 transition flex items-center gap-2 min-h-[44px]"
              >
                <span>NEXT →</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: MENTAL & WELLBEING                                   */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100 tracking-wide flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <span>HOW ARE YOU FEELING TODAY?</span>
                <span className="text-base animate-pulse">✨</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Log your sleep duration and psychomotor wellbeing state.
              </p>
            </div>

            <div className="space-y-4">
              {/* 1. Sleep Duration (Hours + Minutes) */}
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">🛌</span>
                    <span className="font-bold">SLEEP DURATION</span>
                    <span className="text-slate-500 lowercase">(hours & minutes)</span>
                  </span>
                  <span className="text-[11px] font-mono text-purple-300 flex items-center gap-1">
                    <span>🌙</span>
                    <span>REST LOG</span>
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      id="input-sleep-hours"
                      type="number"
                      min="0"
                      max="24"
                      placeholder="7"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-xl px-4 py-3 text-base font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none transition min-h-[44px]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold flex items-center gap-1">
                      <span>⏳</span>
                      <span>HOURS</span>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-sleep-mins"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="15"
                      value={sleepMinutes}
                      onChange={(e) => setSleepMinutes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-xl px-4 py-3 text-base font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none transition min-h-[44px]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold flex items-center gap-1">
                      <span>⏱️</span>
                      <span>MINUTES</span>
                    </span>
                  </div>
                </div>
                {(validationErrors.sleepHours || validationErrors.sleepMinutes) && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.sleepHours || validationErrors.sleepMinutes}
                  </p>
                )}
              </div>

              {/* 2. Mood (1-5) */}
              <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-900/40">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase text-purple-200 flex items-center gap-1.5 font-bold">
                    <span className="text-base">😊</span>
                    <span>MOOD</span>
                  </label>
                  <span className="text-xs font-mono text-purple-300 font-semibold flex items-center gap-1.5 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/60 shadow-inner">
                    {mood === 1 && '😫 1/5 (Very Low)'}
                    {mood === 2 && '🙁 2/5 (Low / Down)'}
                    {mood === 3 && '😐 3/5 (Neutral / Steady)'}
                    {mood === 4 && '😊 4/5 (Positive / Happy)'}
                    {mood === 5 && '🤩 5/5 (Optimal / Thriving!)'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, emoji: '😫', label: 'Very Low' },
                    { val: 2, emoji: '🙁', label: 'Low' },
                    { val: 3, emoji: '😐', label: 'Neutral' },
                    { val: 4, emoji: '😊', label: 'Good' },
                    { val: 5, emoji: '🤩', label: 'Thriving' },
                  ].map(({ val, emoji, label }) => (
                    <button
                      key={val}
                      type="button"
                      id={`btn-mood-${val}`}
                      onClick={() => {
                        spaceAudio.playClick();
                        setMood(val);
                      }}
                      className={`py-2 px-1 rounded-xl font-mono border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer transform active:scale-95 ${
                        mood === val
                          ? 'bg-gradient-to-b from-purple-600 to-purple-800 text-white border-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.6)] scale-[1.03]'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/40'
                      }`}
                    >
                      <span className="text-lg leading-none transition-transform hover:scale-125">{emoji}</span>
                      <span className="text-xs font-black">{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Stress Level (1-5) */}
              <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-900/40">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase text-amber-200 flex items-center gap-1.5 font-bold">
                    <span className="text-base">🔥</span>
                    <span>STRESS LEVEL</span>
                  </label>
                  <span className="text-xs font-mono text-amber-300 font-semibold flex items-center gap-1.5 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/60 shadow-inner">
                    {stress === 1 && '🧘 1/5 (Very Calm)'}
                    {stress === 2 && '😌 2/5 (Low Stress)'}
                    {stress === 3 && '😐 3/5 (Moderate)'}
                    {stress === 4 && '😰 4/5 (High Pressure)'}
                    {stress === 5 && '🌋 5/5 (Severe / Overload)'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, emoji: '🧘', label: 'Zen' },
                    { val: 2, emoji: '😌', label: 'Calm' },
                    { val: 3, emoji: '😐', label: 'Mid' },
                    { val: 4, emoji: '😰', label: 'High' },
                    { val: 5, emoji: '🌋', label: 'Severe' },
                  ].map(({ val, emoji, label }) => (
                    <button
                      key={val}
                      type="button"
                      id={`btn-stress-${val}`}
                      onClick={() => {
                        spaceAudio.playClick();
                        setStress(val);
                      }}
                      className={`py-2 px-1 rounded-xl font-mono border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer transform active:scale-95 ${
                        stress === val
                          ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-white border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.6)] scale-[1.03]'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:border-amber-500/50 hover:bg-amber-950/40'
                      }`}
                    >
                      <span className="text-lg leading-none transition-transform hover:scale-125">{emoji}</span>
                      <span className="text-xs font-black">{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Energy Level (1-5) */}
              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-900/40">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase text-cyan-200 flex items-center gap-1.5 font-bold">
                    <span className="text-base">⚡</span>
                    <span>ENERGY LEVEL</span>
                  </label>
                  <span className="text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60 shadow-inner">
                    {energy === 1 && '🪫 1/5 (Exhausted)'}
                    {energy === 2 && '🔋 2/5 (Low Battery)'}
                    {energy === 3 && '⚡ 3/5 (Moderate)'}
                    {energy === 4 && '🏃 4/5 (High Vitality)'}
                    {energy === 5 && '🚀 5/5 (Peak Supercharged!)'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, emoji: '🪫', label: 'Empty' },
                    { val: 2, emoji: '🔋', label: 'Low' },
                    { val: 3, emoji: '⚡', label: 'Mid' },
                    { val: 4, emoji: '🏃', label: 'High' },
                    { val: 5, emoji: '🚀', label: 'Max' },
                  ].map(({ val, emoji, label }) => (
                    <button
                      key={val}
                      type="button"
                      id={`btn-energy-${val}`}
                      onClick={() => {
                        spaceAudio.playClick();
                        setEnergy(val);
                      }}
                      className={`py-2 px-1 rounded-xl font-mono border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer transform active:scale-95 ${
                        energy === val
                          ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 text-slate-950 font-black border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.6)] scale-[1.03]'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/40'
                      }`}
                    >
                      <span className="text-lg leading-none transition-transform hover:scale-125">{emoji}</span>
                      <span className="text-xs font-black">{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Fatigue (1-5 Optional) */}
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-900/40">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase text-indigo-200 flex items-center gap-1.5 font-bold">
                    <span className="text-base">🥱</span>
                    <span>FATIGUE (OPTIONAL)</span>
                  </label>
                  <span className="text-xs font-mono text-indigo-300 font-semibold flex items-center gap-1.5 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800/60 shadow-inner">
                    {fatigue === 1 && '🌱 1/5 (None / Fresh)'}
                    {fatigue === 2 && '🥱 2/5 (Mild Yawns)'}
                    {fatigue === 3 && '😴 3/5 (Moderate Fatigue)'}
                    {fatigue === 4 && '😵 4/5 (Heavy Exhaustion)'}
                    {fatigue === 5 && '🚨 5/5 (Severe Sleep Debt)'}
                    {fatigue === null && 'Optional'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, emoji: '🌱', label: 'Fresh' },
                    { val: 2, emoji: '🥱', label: 'Mild' },
                    { val: 3, emoji: '😴', label: 'Mid' },
                    { val: 4, emoji: '😵', label: 'Heavy' },
                    { val: 5, emoji: '🚨', label: 'Exhausted' },
                  ].map(({ val, emoji, label }) => (
                    <button
                      key={val}
                      type="button"
                      id={`btn-fatigue-${val}`}
                      onClick={() => {
                        spaceAudio.playClick();
                        setFatigue(val);
                      }}
                      className={`py-2 px-1 rounded-xl font-mono border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer transform active:scale-95 ${
                        fatigue === val
                          ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white border-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.6)] scale-[1.03]'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/40'
                      }`}
                    >
                      <span className="text-lg leading-none transition-transform hover:scale-125">{emoji}</span>
                      <span className="text-xs font-black">{val}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                id="btn-step2-back"
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  setCurrentStep(1);
                }}
                className="px-4 py-2.5 rounded-xl font-mono text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-2 min-h-[44px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← BACK</span>
              </button>

              <button
                id="btn-step2-next"
                type="button"
                onClick={() => {
                  spaceAudio.playClick();
                  handleNextStep2();
                }}
                className="px-6 py-3 rounded-xl font-mono text-xs font-bold text-slate-950 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-300 hover:to-indigo-300 shadow-md shadow-purple-950 transition flex items-center gap-2 min-h-[44px] cursor-pointer"
              >
                <span>NEXT →</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: REVIEW SUMMARY BEFORE SAVING                         */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100 tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>CHECK-IN SUMMARY</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {viewMode === 'review'
                  ? 'Viewing currently logged daily check-in for Sol ' + sol + '.'
                  : 'Verify your recorded health metrics before committing to the Health Engine.'}
              </p>
            </div>

            {/* Summary Table */}
            <div className="space-y-4">
              {/* Physical Section */}
              <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3 border-b border-cyan-800/30 pb-2">
                  <HeartPulse className="w-4 h-4" />
                  <span>PHYSICAL</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm font-mono">
                  <span className="text-slate-400">Heart Rate</span>
                  <span className="text-right text-slate-200 font-semibold">
                    {heartRate.trim() ? `${heartRate} bpm` : 'Skipped'}
                  </span>

                  <span className="text-slate-400">SpO₂</span>
                  <span className="text-right text-slate-200 font-semibold">
                    {spo2.trim() ? `${spo2}%` : 'Skipped'}
                  </span>

                  <span className="text-slate-400">Exercise</span>
                  <span className="text-right text-slate-200 font-semibold">
                    {exerciseMinutes.trim() ? `${exerciseMinutes} min` : 'Skipped'}
                  </span>

                  <span className="text-slate-400">Recovery</span>
                  <span className="text-right text-slate-200 font-semibold">
                    {recovery ? `${recovery}/5` : 'Skipped'}
                  </span>
                </div>
              </div>

              {/* Mental Section */}
              <div className="rounded-xl border border-purple-800/40 bg-purple-950/20 p-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-3 border-b border-purple-800/30 pb-2">
                  <Brain className="w-4 h-4" />
                  <span>MENTAL</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm font-mono">
                  <span className="text-slate-400">Sleep</span>
                  <span className="text-right text-slate-200 font-semibold">
                    {sleepHours || sleepMinutes ? `${sleepHours || 0}h ${sleepMinutes || 0}m` : 'Skipped'}
                  </span>

                  <span className="text-slate-400">Mood</span>
                  <span className="text-right text-slate-200 font-semibold">
                    {mood ? `${mood}/5` : 'Skipped'}
                  </span>

                  <span className="text-slate-400">Stress</span>
                  <span className="text-right text-slate-200 font-semibold">
                    {stress ? `${stress}/5` : 'Skipped'}
                  </span>

                  <span className="text-slate-400">Energy</span>
                  <span className="text-right text-slate-200 font-semibold">
                    {energy ? `${energy}/5` : 'Skipped'}
                  </span>

                  {fatigue && (
                    <>
                      <span className="text-slate-400">Fatigue</span>
                      <span className="text-right text-slate-200 font-semibold">
                        {fatigue}/5
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {viewMode === 'review' ? (
                <>
                  <button
                    id="btn-close-review"
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl font-mono text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition min-h-[44px]"
                  >
                    CLOSE
                  </button>

                  <button
                    id="btn-switch-to-update"
                    type="button"
                    onClick={() => {
                      setViewMode('edit');
                      setCurrentStep(1);
                    }}
                    className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 transition flex items-center gap-2 min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>UPDATE CHECK-IN</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="btn-step3-edit"
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 rounded-xl font-mono text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-2 min-h-[44px]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>← EDIT</span>
                  </button>

                  <button
                    id="btn-save-checkin"
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSave}
                    className="px-6 py-3 rounded-xl font-mono text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-950/50 transition flex items-center gap-2 min-h-[44px] disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'SAVING...' : 'SAVE CHECK-IN'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SUCCESS SCREEN                                       */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">
                ✓ DAILY CHECK-IN COMPLETE
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-mono">
                Your health data has been recorded. Health Engine indices updated.
              </p>
            </div>

            {/* Real Calculated Index Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="p-4 rounded-xl border border-cyan-800/60 bg-cyan-950/40 text-center">
                <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-widest block mb-1">
                  Bio Signal
                </span>
                <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                  {resultIndices.physical} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </span>
              </div>

              <div className="p-4 rounded-xl border border-purple-800/60 bg-purple-950/40 text-center">
                <span className="text-[11px] font-mono text-purple-300 uppercase tracking-widest block mb-1">
                  Neural Signal
                </span>
                <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                  {resultIndices.mental} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
              {onNavigateDashboard && (
                <button
                  id="btn-success-view-dashboard"
                  onClick={() => {
                    onClose();
                    onNavigateDashboard();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl font-mono text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-md shadow-cyan-950 transition min-h-[44px]"
                >
                  VIEW DASHBOARD
                </button>
              )}

              {onNavigateTrends && (
                <button
                  id="btn-success-view-trends"
                  onClick={() => {
                    onClose();
                    onNavigateTrends();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl font-mono text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition min-h-[44px]"
                >
                  VIEW TRENDS
                </button>
              )}

              <button
                id="btn-success-close"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 rounded-xl font-mono text-xs text-slate-400 hover:text-slate-200 transition min-h-[44px]"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
