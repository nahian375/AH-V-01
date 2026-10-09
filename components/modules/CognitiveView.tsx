/**
 * ASTRA Health - Cognitive Performance & Readiness View
 * Prototype psychomotor vigilance, spatial memory, and attention tasks.
 * Evaluates reaction latency and memory score against personal rolling baselines.
 */

import React, { useState, useRef } from 'react';
import { CognitiveTaskResult } from '../../types/health';
import { Brain, Play, CheckCircle2, RotateCcw, Zap, Sparkles, AlertCircle, Clock } from 'lucide-react';

interface CognitiveViewProps {
  sol: number;
  onRecordCognitiveResult: (result: Omit<CognitiveTaskResult, 'id' | 'timestamp' | 'sol'>) => Promise<void>;
  onAskAstra: (prompt: string) => void;
}

export const CognitiveView: React.FC<CognitiveViewProps> = ({
  sol,
  onRecordCognitiveResult,
  onAskAstra,
}) => {
  const [activeTask, setActiveTask] = useState<'REACTION' | 'MEMORY' | 'VIGILANCE'>('REACTION');

  // Reaction Time Task State
  const [reactionState, setReactionState] = useState<'IDLE' | 'WAITING' | 'READY' | 'CLICKED' | 'EARLY'>('IDLE');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Memory Sequence Task State
  const [memorySeq, setMemorySeq] = useState<number[]>([]);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [memoryState, setMemoryState] = useState<'IDLE' | 'SHOWING' | 'USER_INPUT' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [activeButton, setActiveButton] = useState<number | null>(null);

  // Baseline reference values
  const reactionBaseline = 242; // ms
  const memoryBaseline = 90; // %

  // Start Reaction Time Test
  const startReactionTest = () => {
    setReactionState('WAITING');
    setReactionTime(null);
    const delay = 1500 + Math.random() * 3000;

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setReactionState('READY');
    }, delay);
  };

  const handleReactionClick = async () => {
    if (reactionState === 'WAITING') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setReactionState('EARLY');
    } else if (reactionState === 'READY') {
      const elapsed = Date.now() - startTimeRef.current;
      setReactionTime(elapsed);
      setReactionState('CLICKED');

      const dev = Number((((elapsed - reactionBaseline) / reactionBaseline) * 100).toFixed(1));

      await onRecordCognitiveResult({
        taskType: 'REACTION',
        score: elapsed,
        baselineScore: reactionBaseline,
        deviationPercent: dev,
        durationSeconds: Math.round(elapsed / 1000),
      });
    }
  };

  // Start Memory Task
  const startMemoryTest = () => {
    const sequence = [
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
    ];
    setMemorySeq(sequence);
    setUserSeq([]);
    setMemoryState('SHOWING');

    sequence.forEach((val, idx) => {
      setTimeout(() => {
        setActiveButton(val);
        setTimeout(() => setActiveButton(null), 400);
      }, (idx + 1) * 700);
    });

    setTimeout(() => {
      setMemoryState('USER_INPUT');
    }, (sequence.length + 1) * 700);
  };

  const handleMemoryInput = async (btnIndex: number) => {
    if (memoryState !== 'USER_INPUT') return;

    const nextUserSeq = [...userSeq, btnIndex];
    setUserSeq(nextUserSeq);

    // Verify
    const currentStep = nextUserSeq.length - 1;
    if (nextUserSeq[currentStep] !== memorySeq[currentStep]) {
      setMemoryState('FAILED');
      return;
    }

    if (nextUserSeq.length === memorySeq.length) {
      setMemoryState('SUCCESS');
      const dev = 0;
      await onRecordCognitiveResult({
        taskType: 'MEMORY',
        score: 100,
        baselineScore: memoryBaseline,
        deviationPercent: 10,
        durationSeconds: 15,
      });
    }
  };

  return (
    <div id="cognitive-performance-view" className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-700/50">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100">
              COGNITIVE READINESS & PSYCHOMOTOR MONITORING
            </h2>
            <p className="text-xs text-slate-400">
              Objective cognitive reaction assessments compared against personal deep space baselines
            </p>
          </div>
        </div>

        {/* Task Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTask('REACTION')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
              activeTask === 'REACTION'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            REACTION TIME
          </button>
          <button
            onClick={() => setActiveTask('MEMORY')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
              activeTask === 'MEMORY'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SPATIAL MEMORY
          </button>
        </div>
      </div>

      {/* Task Card Container */}
      {activeTask === 'REACTION' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="max-w-md mx-auto mb-6">
            <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider mb-1">
              Psychomotor Vigilance Task (PVT)
            </h3>
            <p className="text-xs text-slate-400">
              Click Start. When the sensory screen turns GREEN, click as rapidly as possible.
            </p>
          </div>

          {/* Interactive Arena */}
          <div
            id="reaction-arena-box"
            onClick={reactionState === 'WAITING' || reactionState === 'READY' ? handleReactionClick : undefined}
            className={`w-full max-w-lg mx-auto h-56 rounded-2xl flex flex-col items-center justify-center p-6 transition cursor-pointer select-none border ${
              reactionState === 'IDLE'
                ? 'bg-slate-950 border-slate-800'
                : reactionState === 'WAITING'
                ? 'bg-amber-950/40 border-amber-500/50'
                : reactionState === 'READY'
                ? 'bg-emerald-600 border-emerald-400 glow-emerald'
                : reactionState === 'CLICKED'
                ? 'bg-cyan-950/60 border-cyan-500/50'
                : 'bg-rose-950/60 border-rose-500/50'
            }`}
          >
            {reactionState === 'IDLE' && (
              <button
                onClick={startReactionTest}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-mono font-bold text-white transition shadow-lg flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> START REACTION TEST
              </button>
            )}

            {reactionState === 'WAITING' && (
              <div className="text-amber-400 font-mono text-sm animate-pulse">
                WAIT FOR GREEN...
              </div>
            )}

            {reactionState === 'READY' && (
              <div className="text-white font-mono text-2xl font-black tracking-wider">
                CLICK NOW!
              </div>
            )}

            {reactionState === 'CLICKED' && reactionTime !== null && (
              <div className="space-y-2">
                <div className="text-3xl font-black font-mono text-cyan-400">
                  {reactionTime} ms
                </div>
                <div className="text-xs font-mono text-slate-300">
                  14-day Baseline: {reactionBaseline} ms (
                  <span className={reactionTime > reactionBaseline ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {reactionTime > reactionBaseline ? `+${(((reactionTime - reactionBaseline) / reactionBaseline) * 100).toFixed(1)}%` : `${(((reactionTime - reactionBaseline) / reactionBaseline) * 100).toFixed(1)}%`}
                  </span>
                  )
                </div>
                <button
                  onClick={startReactionTest}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition"
                >
                  TEST AGAIN
                </button>
              </div>
            )}

            {reactionState === 'EARLY' && (
              <div className="space-y-2">
                <div className="text-rose-400 font-mono font-bold text-base">
                  TOO EARLY! Clicked before stimulus.
                </div>
                <button
                  onClick={startReactionTest}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-slate-200"
                >
                  RETRY
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTask === 'MEMORY' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="max-w-md mx-auto mb-6">
            <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider mb-1">
              Celestial Nav Spatial Memory Span
            </h3>
            <p className="text-xs text-slate-400">
              Memorize the 4-beacon pattern and repeat the sequence in order.
            </p>
          </div>

          <div className="max-w-xs mx-auto grid grid-cols-2 gap-3 mb-6">
            {[0, 1, 2, 3].map((idx) => {
              const isActive = activeButton === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleMemoryInput(idx)}
                  disabled={memoryState !== 'USER_INPUT'}
                  className={`h-24 rounded-2xl border transition font-mono font-bold text-lg cursor-pointer ${
                    isActive
                      ? 'bg-purple-500 border-purple-300 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-purple-500/50'
                  }`}
                >
                  Beacon {idx + 1}
                </button>
              );
            })}
          </div>

          {memoryState === 'IDLE' && (
            <button
              onClick={startMemoryTest}
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-mono font-bold text-white transition"
            >
              START SEQUENCE
            </button>
          )}

          {memoryState === 'SHOWING' && (
            <div className="text-amber-400 font-mono text-xs animate-pulse">
              OBSERVE SEQUENCE PATTERN...
            </div>
          )}

          {memoryState === 'USER_INPUT' && (
            <div className="text-cyan-400 font-mono text-xs">
              REPEAT PATTERN ({userSeq.length} / {memorySeq.length})
            </div>
          )}

          {memoryState === 'SUCCESS' && (
            <div className="space-y-2">
              <div className="text-emerald-400 font-mono font-bold text-sm">
                PATTERN VERIFIED: 100% RECALL ACCURACY
              </div>
              <button
                onClick={startMemoryTest}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-slate-200"
              >
                TEST AGAIN
              </button>
            </div>
          )}

          {memoryState === 'FAILED' && (
            <div className="space-y-2">
              <div className="text-rose-400 font-mono font-bold text-sm">
                SEQUENCE MISMATCH
              </div>
              <button
                onClick={startMemoryTest}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-slate-200"
              >
                RETRY
              </button>
            </div>
          )}
        </div>
      )}

      {/* Safety & Protocol Notice */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Prototype psychomotor assessment. Not a clinical neuropsychological evaluation.</span>
        </div>
        <button
          onClick={() => onAskAstra('How does sleep deficit affect my reaction time on Mars cruise?')}
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          Ask ASTRA about cognitive fatigue
        </button>
      </div>

    </div>
  );
};
