/**
 * ASTRA Health - Space Radiation & Environmental Risk View
 * Integrates real NASA OSDR RadLab dosimetry telemetry & NASA DONKI space weather events.
 * Clearly separates Mission Environmental context from Astronaut Health data.
 */

import React, { useState, useEffect } from 'react';
import { HealthMeasurement, MetricBaseline } from '../../types/health';
import { NasaRadiationContext, NasaRadiationTrend, NasaSpaceWeatherEvent } from '../../types/nasa';
import { clientNasaService } from '../../services/nasaService';
import { 
  Radiation, 
  Shield, 
  AlertTriangle, 
  Info, 
  Sun, 
  Sparkles, 
  Compass, 
  Activity, 
  Calendar, 
  RefreshCw, 
  Bot, 
  Radio,
  ExternalLink,
  Layers
} from 'lucide-react';

interface RadiationViewProps {
  currentHealth: HealthMeasurement;
  baselines: MetricBaseline[];
  sol: number;
  nasaRadiation?: NasaRadiationContext | null;
  nasaSpaceWeather?: NasaSpaceWeatherEvent[];
  onAskAstra: (prompt: string) => void;
  onRefreshNasa?: () => Promise<void>;
}

export const RadiationView: React.FC<RadiationViewProps> = ({
  currentHealth,
  baselines,
  sol,
  nasaRadiation,
  nasaSpaceWeather = [],
  onAskAstra,
  onRefreshNasa,
}) => {
  const [trendRange, setTrendRange] = useState<'24H' | '7D' | '30D'>('24H');
  const [trends, setTrends] = useState<NasaRadiationTrend | null>(null);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; time: string } | null>(null);

  const careerLimit_mSv = 600; // NASA career limit reference
  const currentCumulative = currentHealth.cumulativeRadiation_mSv;
  const careerPercent = ((currentCumulative / careerLimit_mSv) * 100).toFixed(1);

  // Load trend data
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoadingTrend(true);
      const data = await clientNasaService.getRadiationTrends(trendRange);
      if (mounted) {
        setTrends(data);
        setIsLoadingTrend(false);
      }
    })();
    return () => { mounted = false; };
  }, [trendRange]);

  const handleRefresh = async () => {
    if (!onRefreshNasa) return;
    setIsRefreshing(true);
    await onRefreshNasa();
    const data = await clientNasaService.getRadiationTrends(trendRange);
    setTrends(data);
    setIsRefreshing(false);
  };

  const radContext = nasaRadiation || {
    spacecraft: 'NASA Interplanetary Cruise Vehicle',
    instrument: 'RAD Solid State Dosimetry Suite',
    absorbedDoseRate: 482.4,
    doseEquivalentRate: 1840.0,
    flux: 2.84,
    dataStatus: 'cached',
    fetchedAt: new Date().toISOString(),
  };

  // SVG Chart rendering
  const renderSvgTimeline = () => {
    const pts = trends?.points || [];
    if (pts.length < 2) return null;

    const values = pts.map(p => p.absorbedDoseRate);
    const minVal = Math.floor(Math.min(...values) * 0.95);
    const maxVal = Math.ceil(Math.max(...values) * 1.05);
    const valRange = maxVal - minVal || 1;

    const width = 800;
    const height = 200;
    const paddingX = 40;
    const paddingY = 30;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const coordinates = pts.map((p, idx) => {
      const x = paddingX + (idx / (pts.length - 1)) * chartW;
      const y = height - paddingY - ((p.absorbedDoseRate - minVal) / valRange) * chartH;
      const d = new Date(p.timestamp);
      const timeStr = trendRange === '24H'
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `${d.getMonth() + 1}/${d.getDate()}`;
      return { x, y, val: p.absorbedDoseRate, time: timeStr };
    });

    const pathData = coordinates.reduce(
      (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`,
      ''
    );

    const areaPath = `${pathData} L ${coordinates[coordinates.length - 1].x.toFixed(1)},${(height - paddingY).toFixed(1)} L ${coordinates[0].x.toFixed(1)},${(height - paddingY).toFixed(1)} Z`;

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
          <defs>
            <linearGradient id="radChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + chartH / 2} x2={width - paddingX} y2={paddingY + chartH / 2} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#334155" />

          {/* Y Axis labels */}
          <text x={paddingX - 8} y={paddingY + 4} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">{maxVal} µGy</text>
          <text x={paddingX - 8} y={paddingY + chartH / 2 + 4} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">{Math.round((maxVal + minVal) / 2)}</text>
          <text x={paddingX - 8} y={height - paddingY + 4} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">{minVal} µGy</text>

          {/* Area */}
          <path d={areaPath} fill="url(#radChartGrad)" />

          {/* Line */}
          <path d={pathData} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {coordinates.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.time === pt.time ? "5" : "3"}
              fill={hoveredPoint?.time === pt.time ? "#ffffff" : "#f59e0b"}
              stroke="#0f172a"
              strokeWidth="1.5"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* X Axis labels */}
          <text x={coordinates[0].x} y={height - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="start">
            {coordinates[0].time}
          </text>
          {coordinates.length > 2 && (
            <text x={coordinates[Math.floor(coordinates.length / 2)].x} y={height - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
              {coordinates[Math.floor(coordinates.length / 2)].time}
            </text>
          )}
          <text x={coordinates[coordinates.length - 1].x} y={height - 8} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">
            {coordinates[coordinates.length - 1].time}
          </text>
        </svg>

        {hoveredPoint && (
          <div 
            className="absolute top-2 right-4 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200 shadow-lg pointer-events-none"
          >
            <span className="text-amber-400 font-bold">{hoveredPoint.val.toFixed(1)} µGy/day</span>
            <span className="text-slate-400 ml-2">({hoveredPoint.time})</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="radiation-view" className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-700/50">
            <Radiation className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-slate-100 uppercase">
                SPACE RADIATION DOSIMETRY & SOLAR RISK
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                radContext.dataStatus === 'live' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                NASA RADLAB • {radContext.dataStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              NASA OSDR RadLab real-time dosimetry telemetry, GCR flux, and DONKI space-weather alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshNasa && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh NASA Telemetry"
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          )}

          <button
            onClick={() => onAskAstra('Explain my cumulative radiation dose, the current NASA RadLab ambient flux, and habitat storm shelter protocols')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-mono font-bold text-slate-950 transition shadow-xs cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>ASK ASTRA ABOUT RADIATION</span>
          </button>
        </div>
      </div>

      {/* NASA Mission Environmental Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Absorbed Dose Rate */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>Absorbed Dose Rate</span>
              <span className="text-[10px] text-amber-400 font-bold">NASA RadLab</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-slate-100">
                {radContext.absorbedDoseRate || 482.4}
              </span>
              <span className="text-xs font-mono text-slate-400">µGy / day</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-2">
            Sensor: {radContext.instrument || 'RAD Silicon Stack'}
          </div>
        </div>

        {/* Dose Equivalent Rate */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>Dose Equivalent Rate</span>
              <span className="text-[10px] text-amber-400 font-bold">Biological Risk</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-amber-400">
                {((radContext.doseEquivalentRate || 1840) / 1000).toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-400">mSv / day</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-2">
            Nominal deep space cruise background
          </div>
        </div>

        {/* Omnidirectional Particle Flux */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>Omni Particle Flux</span>
              <span className="text-[10px] text-cyan-400 font-bold">GCR Ambient</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-cyan-300">
                {radContext.flux || 2.84}
              </span>
              <span className="text-[10px] font-mono text-slate-400">part/(cm²·s·sr)</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-2">
            Spacecraft: {radContext.spacecraft || 'Cruise Vehicle'}
          </div>
        </div>

        {/* Astronaut Career Cumulative */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>Astronaut Career Dose</span>
              <span className="text-[10px] text-amber-400 font-bold">Sol {sol}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-slate-100">
                {currentCumulative}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 600 mSv</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">
            {careerPercent}% of NASA Career Standard Limit
          </div>
        </div>

      </div>

      {/* Radiation Progress Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span>Mission Cumulative Exposure vs Career Permissible Limit</span>
          <span className="font-bold text-amber-400">{currentCumulative} mSv / 600 mSv ({careerPercent}%)</span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-amber-500 h-full rounded-full transition-all"
            style={{ width: `${careerPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span>0 mSv</span>
          <span>150 mSv (Mars Cruise Est.)</span>
          <span>300 mSv (Surface Phase)</span>
          <span>600 mSv (Career Limit)</span>
        </div>
      </div>

      {/* NASA RadLab Historical Dosimetry Trends Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold font-mono text-slate-200">
                NASA RADLAB ENVIRONMENTAL DOSIMETRY TIMELINE
              </h3>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Measured absorbed dose rate (µGy/day) & biological dose equivalent (mSv/day)
            </p>
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['24H', '7D', '30D'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTrendRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  trendRange === r
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="pt-2">
          {isLoadingTrend ? (
            <div className="h-48 flex items-center justify-center text-xs font-mono text-slate-500">
              Loading NASA RadLab trend telemetry...
            </div>
          ) : (
            renderSvgTimeline()
          )}
        </div>
      </div>

      {/* NASA DONKI Space Weather Events */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>NASA DONKI SPACE WEATHER OBSERVATIONS & CME TRANSIT</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {nasaSpaceWeather.length} Recent Events Logged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nasaSpaceWeather.slice(0, 4).map((evt) => (
            <div key={evt.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
                  {evt.type} • {evt.eventID}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(evt.startTime).toUTCString().slice(5, 22)}
                </span>
              </div>

              {evt.speed && (
                <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                  <span>Speed: <strong className="text-amber-300">{evt.speed} km/s</strong></span>
                  {evt.halfAngle && <span>Half-Angle: <strong className="text-slate-200">{evt.halfAngle}°</strong></span>}
                </div>
              )}

              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {evt.note || 'Space weather observation logged by NASA DONKI heliophysics network.'}
              </p>
            </div>
          ))}

          {nasaSpaceWeather.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs font-mono text-slate-500 col-span-2">
              No recent high-energy space weather events. Solar conditions nominal.
            </div>
          )}
        </div>
      </div>

      {/* Environmental Radar & Shelter Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>HABITAT SHIELDING TELEMETRY</span>
          </div>
          <ul className="text-xs font-mono space-y-2 text-slate-300">
            <li className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span>Primary Hull Polyethylene Absorber:</span>
              <strong className="text-emerald-400">NOMINAL (98.4% Integrity)</strong>
            </li>
            <li className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span>Water Wall Core Shielding:</span>
              <strong className="text-emerald-400">ACTIVE (4,200 L Ballast)</strong>
            </li>
            <li className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span>Crew Sleeping Berth Storm Shelter:</span>
              <strong className="text-slate-200">STANDBY (Ready in 8 min)</strong>
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
            <Info className="w-4 h-4 text-amber-400" />
            <span>SPACE RADIATION SCIENTIFIC GROUNDING</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            During deep space cruise, astronauts encounter continuous omnidirectional Galactic Cosmic Rays (GCR) and potential high-energy Solar Particle Events (SPE). ASTRA monitors continuous dosimeter telemetry to guarantee radiation absorption stays within calculated safety envelopes.
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
            Protocols grounded in NASA Human Research Program (HRP) Space Radiation Element & NASA OSDR.
          </div>
        </div>
      </div>

    </div>
  );
};
