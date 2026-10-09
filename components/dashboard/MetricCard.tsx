/**
 * ASTRA Health - Metric Telemetry Card
 * Displays current value, rolling personal baseline, deviation %, trend arrow,
 * status pill, and an inline SVG sparkline graph.
 */

import React from 'react';
import { HealthSeverity } from '../../types/health';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  currentValue: number | string;
  unit: string;
  baseline: number | string;
  deviationPercent: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: HealthSeverity;
  sparklineData: number[];
  categoryIcon?: React.ReactNode;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  currentValue,
  unit,
  baseline,
  deviationPercent,
  trend,
  status,
  sparklineData,
  categoryIcon,
  onClick,
}) => {
  const statusStyles = {
    GREEN: 'border-slate-800 hover:border-emerald-500/50 bg-slate-900/70',
    BLUE: 'border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-500/50',
    YELLOW: 'border-amber-500/30 bg-amber-950/20 hover:border-amber-500/50',
    ORANGE: 'border-amber-500/50 bg-amber-950/30 hover:border-amber-500/70 glow-amber',
    RED: 'border-rose-500/60 bg-rose-950/40 hover:border-rose-500/80 glow-rose animate-pulse',
  }[status];

  const pillStyles = {
    GREEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    BLUE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    YELLOW: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    ORANGE: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    RED: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }[status];

  // Render clean SVG sparkline
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 30;

    const points = sparklineData
      .map((val, idx) => {
        const x = (idx / (sparklineData.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor =
      status === 'ORANGE' || status === 'YELLOW'
        ? '#f59e0b'
        : status === 'RED'
        ? '#f43f5e'
        : '#06b6d4';

    return (
      <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div
      id={`metric-card-${id}`}
      onClick={onClick}
      className={`rounded-xl border p-4 transition backdrop-blur-sm cursor-pointer ${statusStyles}`}
    >
      {/* Top: Title & Status Pill */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          {categoryIcon && <span className="text-cyan-400">{categoryIcon}</span>}
          <span>{title}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${pillStyles}`}>
          {status}
        </span>
      </div>

      {/* Middle: Big Value & Sparkline */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold font-mono text-slate-100">
            {currentValue}
          </span>
          <span className="text-xs text-slate-400 font-mono">{unit}</span>
        </div>
        <div>{renderSparkline()}</div>
      </div>

      {/* Bottom: Baseline & Deviation */}
      <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
        <span>Base: <strong className="text-slate-300">{baseline} {unit}</strong></span>
        <span className={`flex items-center font-bold ${
          deviationPercent === 0
            ? 'text-slate-400'
            : Math.abs(deviationPercent) > 10
            ? 'text-amber-400'
            : 'text-cyan-400'
        }`}>
          {trend === 'UP' ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : trend === 'DOWN' ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          <span>{deviationPercent > 0 ? `+${deviationPercent}` : deviationPercent}%</span>
        </span>
      </div>
    </div>
  );
};
