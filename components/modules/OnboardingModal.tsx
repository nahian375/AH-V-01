/**
 * ASTRA Health - Onboarding Guided Tour Modal
 * 5-step aerospace orientation for reviewers and astronauts.
 */

import React, { useState } from 'react';
import { X, Sparkles, Cpu, Database, Activity, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSimulation: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartSimulation,
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'WELCOME TO ASTRA HEALTH',
      subtitle: 'Astronaut Health Intelligence System (NASA Space Apps Challenge Prototype)',
      icon: <Activity className="w-6 h-6 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            ASTRA is designed for deep-space interplanetary missions where light-speed delay (up to 22 minutes each way to Mars) and communications blackouts make real-time Earth medical consultation impossible.
          </p>
          <p>
            ASTRA monitors astronaut physiological telemetry continuously, compares metrics against personal rolling baselines, and operates with full autonomous intelligence both <strong>online</strong> and <strong>100% offline</strong>.
          </p>
        </div>
      ),
    },
    {
      title: 'PERSONAL BASELINES VS POPULATION NORMS',
      subtitle: 'Every astronaut is their own primary medical baseline',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            In microgravity, generic clinical population charts produce false alarms. ASTRA's deterministic Health Engine computes <strong>7-day, 14-day, and 30-day personalized rolling baselines</strong>.
          </p>
          <p>
            Instead of declaring diseases, ASTRA transparently detects and quantifies <em>deviations</em>: e.g. resting heart rate +9%, sleep volume -18%, and heart rate variability -29%.
          </p>
        </div>
      ),
    },
    {
      title: 'SIGNATURE FEATURE: "WHAT CHANGED?"',
      subtitle: 'Instant multi-metric divergence synthesis',
      icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            The <strong>WHAT CHANGED?</strong> panel compares your recent 7-day measurements against your baseline equilibrium in one scannable view.
          </p>
          <p>
            ASTRA pairs every detected shift with an <strong>Observation</strong>, <strong>Context</strong>, <strong>Contributing Factors</strong>, and a safe, non-diagnostic <strong>Suggested Next Step</strong>.
          </p>
        </div>
      ),
    },
    {
      title: 'DUAL-AI ENGINE & ZERO-LOSS OFFLINE PWA',
      subtitle: 'Earth Gemini Uplink + Edge Browser AI Core',
      icon: <Cpu className="w-6 h-6 text-amber-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            When connected to Earth, ASTRA routes queries to <strong>Gemini Cloud</strong>. During communications blackout, ASTRA instantly switches to <strong>Local ASTRA Core</strong> without losing state or skipping a beat.
          </p>
          <p>
            All data writes immediately to local IndexedDB. An offline <strong>Sync Queue</strong> automatically pushes records to Mission Control the moment Earth connection is restored.
          </p>
        </div>
      ),
    },
    {
      title: 'REVIEWER DEMO SCENARIOS',
      subtitle: 'Experience dynamic health events and comms blackout testing',
      icon: <Database className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            Use the interactive <strong>NASA SPACE APPS DEMO SCENARIOS</strong> dock at the top of your dashboard to test:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-200 font-mono text-[11px]">
            <li><strong>START HEALTH EVENT:</strong> Injects realistic multi-metric drift from Stable to Attention.</li>
            <li><strong>SIMULATE COMMS LOSS:</strong> Demonstrates seamless 100% offline continuity.</li>
            <li><strong>RESTORE COMMS:</strong> Tests synchronization of pending records.</li>
          </ul>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="onboarding-guide-modal"
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              {currentStep.icon}
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                ASTRA ORIENTATION • STEP {step + 1} OF {steps.length}
              </div>
              <h3 className="text-sm font-bold font-mono text-slate-100">
                {currentStep.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-xs font-mono text-cyan-300 font-semibold">
            {currentStep.subtitle}
          </div>
          {currentStep.content}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'w-5 bg-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Prev
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition shadow-sm"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onStartSimulation();
                }}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-mono font-bold text-slate-950 transition shadow-sm"
              >
                LAUNCH DEMO SCENARIO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
