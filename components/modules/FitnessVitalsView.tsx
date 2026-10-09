/**
 * ASTRA Health - Fitness & Vitals Detailed View
 * Displays cardiovascular, respiratory, musculoskeletal (ARED), and thermoregulatory telemetry.
 */

import React from 'react';
import { HealthMeasurement, MetricBaseline } from '../../types/health';
import { Dumbbell, Heart, Wind, Flame, Droplets, Activity, Gauge } from 'lucide-react';

interface FitnessVitalsViewProps {
  currentHealth: HealthMeasurement;
  baselines: MetricBaseline[];
  sol: number;
  onAskAstra: (prompt: string) => void;
}

export const FitnessVitalsView: React.FC<FitnessVitalsViewProps> = ({
  currentHealth,
  baselines,
  sol,
  onAskAstra,
}) => {
  return (
    <div id="fitness-vitals-view" className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50">
            <Dumbbell className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100">
              PHYSIOLOGICAL VITALS & ARED EXERCISE METRICS
            </h2>
            <p className="text-xs text-slate-400">
              Cardiovascular telemetry, respiratory rate, blood oxygen, and musculoskeletal loading
            </p>
          </div>
        </div>

        <button
          onClick={() => onAskAstra('Review my ARED exercise metrics and cardiovascular load')}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition shadow-xs"
        >
          ASK ASTRA ABOUT VITALS
        </button>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Cardiovascular Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200 border-b border-slate-800 pb-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>CARDIOVASCULAR TELEMETRY</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">Resting Heart Rate</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {currentHealth.restingHeartRate} <span className="text-xs text-slate-500">bpm</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Baseline: 71 bpm (+9%)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">Heart Rate Variability</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {currentHealth.hrv} <span className="text-xs text-slate-500">ms</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Baseline: 62 ms (-29%)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">Blood Pressure</div>
              <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                {currentHealth.bloodPressureSystolic}/{currentHealth.bloodPressureDiastolic} <span className="text-xs text-slate-500">mmHg</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1">Normotensive</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">Recovery Score</div>
              <div className="text-xl font-bold font-mono text-purple-400 mt-1">
                {currentHealth.recoveryScore} <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Baseline: 84 / 100</div>
            </div>
          </div>
        </div>

        {/* Respiratory & Oxygenation Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200 border-b border-slate-800 pb-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>RESPIRATORY & BLOOD OXYGENATION</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">SpO2 Blood Oxygen</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {currentHealth.spo2}%
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1">Safe range (&gt;97%)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">Respiratory Rate</div>
              <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                {currentHealth.respiratoryRate} <span className="text-xs text-slate-500">br/min</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Baseline: 14 br/min</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">Core Body Temperature</div>
              <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                {currentHealth.coreTemperature}°C
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1">Thermoregulation stable</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">Hydration Index</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {currentHealth.hydrationIndex}%
              </div>
              <div className="text-[10px] font-mono text-cyan-400 mt-1">Adequate intake</div>
            </div>
          </div>
        </div>

        {/* Musculoskeletal Countermeasure (ARED & CEVIS) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>ARED RESISTIVE EXERCISE & CEVIS CYCLE ERGOMETER</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Prescribed Daily Countermeasure: 120 min</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">Daily Exercise Duration</div>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                {currentHealth.exerciseDurationMinutes} <span className="text-xs text-slate-500">min</span>
              </div>
              <div className="text-xs font-mono text-amber-400 mt-1">Completed 90% of target</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">ARED Aggregate Resistance Load</div>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                {currentHealth.resistanceLoadKg} <span className="text-xs text-slate-500">kg</span>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1">Deadlift & Squat protocol</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">Aerobic Output (CEVIS)</div>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                {currentHealth.aerobicOutputWatts} <span className="text-xs text-slate-500">Watts</span>
              </div>
              <div className="text-xs font-mono text-emerald-400 mt-1">VO2 Target maintained</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
