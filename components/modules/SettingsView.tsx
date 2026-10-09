/**
 * ASTRA Health - System Settings & Diagnostics View
 * Manages AI modes, local browser model cache, NASA API endpoints & telemetry cache,
 * offline sync queue, and hardware acceleration.
 */

import React, { useState, useEffect } from 'react';
import { AIMode } from '../../types/ai';
import { NasaConnectionStatus } from '../../types/nasa';
import { localAIManager, ModelInfo } from '../../ai/localAIManager';
import { 
  Settings, 
  Cpu, 
  HardDrive, 
  Wifi, 
  RefreshCw, 
  CheckCircle2, 
  Shield, 
  Download, 
  Trash2, 
  Database,
  Globe,
  Radio,
  ExternalLink
} from 'lucide-react';

interface SettingsViewProps {
  aiMode: AIMode;
  onSetAiMode: (mode: AIMode) => void;
  syncPendingCount: number;
  onTriggerSync: () => void;
  nasaStatus?: NasaConnectionStatus | null;
  onClearNasaCache?: () => Promise<void>;
  onRefreshNasa?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  aiMode,
  onSetAiMode,
  syncPendingCount,
  onTriggerSync,
  nasaStatus,
  onClearNasaCache,
  onRefreshNasa,
}) => {
  const [modelInfo, setModelInfo] = useState<ModelInfo>(localAIManager.getModelInfo());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearingNasa, setIsClearingNasa] = useState(false);
  const [isRefreshingNasa, setIsRefreshingNasa] = useState(false);

  useEffect(() => {
    return localAIManager.subscribe(setModelInfo);
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await onTriggerSync();
    setIsSyncing(false);
  };

  const handleClearNasa = async () => {
    if (!onClearNasaCache) return;
    setIsClearingNasa(true);
    await onClearNasaCache();
    setIsClearingNasa(false);
  };

  const handleRefreshNasa = async () => {
    if (!onRefreshNasa) return;
    setIsRefreshingNasa(true);
    await onRefreshNasa();
    setIsRefreshingNasa(false);
  };

  return (
    <div id="settings-diagnostics-view" className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center gap-2.5 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
          <Settings className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-base font-bold font-mono text-slate-100 uppercase">
            SYSTEM SETTINGS & LOCAL RUNTIME DIAGNOSTICS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AI router configurations, NASA API telemetry cache, on-device neural cache, and synchronization queue
          </p>
        </div>
      </div>

      {/* 1. NASA Space Science APIs & Caching Section */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>NASA APIS & SPACE TELEMETRY CACHE</span>
          </div>
          <div className="flex items-center gap-2">
            {onRefreshNasa && (
              <button
                onClick={handleRefreshNasa}
                disabled={isRefreshingNasa}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingNasa ? 'animate-spin text-cyan-400' : ''}`} />
                <span>REFRESH NASA DATA</span>
              </button>
            )}
            {onClearNasaCache && (
              <button
                onClick={handleClearNasa}
                disabled={isClearingNasa}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-xs font-mono font-bold text-rose-300 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CLEAR NASA CACHE</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          NASA OSDR RadLab dosimetry, DONKI space weather events, and life-science research accessions are cached locally in IndexedDB with an autonomous 2-hour TTL cache to enable full flight operations during deep space communication blackouts.
        </p>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">NASA RadLab API</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {nasaStatus?.radLab?.toUpperCase() || 'CONNECTED'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono truncate">
              visualization.osdr.nasa.gov/radlab
            </div>
            <div className="text-[10px] text-slate-500">
              Dosimetry stack telemetry
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">NASA DONKI API</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {nasaStatus?.donki?.toUpperCase() || 'CONNECTED'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono truncate">
              api.nasa.gov/DONKI
            </div>
            <div className="text-[10px] text-slate-500">
              CME / SPE space weather feed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">NASA OSDR Repository</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {nasaStatus?.osdr?.toUpperCase() || 'CONNECTED'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono truncate">
              visualization.osdr.nasa.gov/biodata
            </div>
            <div className="text-[10px] text-slate-500">
              Space-life-sciences research
            </div>
          </div>

        </div>
      </div>

      {/* 2. AI Execution Mode Selector */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>ASTRA INTELLIGENCE ROUTING MODE</span>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          Select which inference engine executes your queries. The deterministic Health Engine runs locally across all modes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          <div
            onClick={() => onSetAiMode('ONLINE')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              aiMode === 'ONLINE'
                ? 'bg-cyan-950/60 border-cyan-500 shadow-xs'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-cyan-300">ONLINE (GEMINI)</span>
              {aiMode === 'ONLINE' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Proxies queries to Earth-cloud Gemini models when uplink is active.
            </p>
          </div>

          <div
            onClick={() => onSetAiMode('OFFLINE')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              aiMode === 'OFFLINE'
                ? 'bg-amber-950/60 border-amber-500 shadow-xs'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-amber-300">OFFLINE (LOCAL ASTRA)</span>
              {aiMode === 'OFFLINE' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Zero network calls. Runs 100% locally in browser using Local RAG & Edge Engine.
            </p>
          </div>

          <div
            onClick={() => onSetAiMode('AUTO')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              aiMode === 'AUTO'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-xs'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-emerald-300">AUTO (ADAPTIVE)</span>
              {aiMode === 'AUTO' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Uses Gemini when online; seamlessly fails over to Local ASTRA during blackout.
            </p>
          </div>

        </div>
      </div>

      {/* 3. Local AI Model Engine Manager */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span>BROWSER-EDGE LOCAL AI MODEL RUNTIME</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            STATUS: {modelInfo.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">Model Architecture</div>
            <div className="font-bold text-slate-200 mt-1">{modelInfo.name}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">Quantization / Size</div>
            <div className="font-bold text-slate-200 mt-1">{modelInfo.parameters}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">Hardware Acceleration</div>
            <div className="font-bold text-cyan-400 mt-1">
              {modelInfo.webGpuAvailable ? 'WebGPU Supported' : 'Wasm/CPU Engine'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">VRAM Footprint</div>
            <div className="font-bold text-slate-200 mt-1">~{modelInfo.estimatedVRAM_MB} MB Browser Cache</div>
          </div>
        </div>

        {/* Model Actions */}
        <div className="flex items-center gap-3 pt-2">
          {modelInfo.status === 'NOT_INSTALLED' ? (
            <button
              onClick={() => localAIManager.downloadModel()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-mono font-bold text-slate-950 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD LOCAL WEIGHTS</span>
            </button>
          ) : modelInfo.status === 'DOWNLOADING' ? (
            <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Downloading quantized weights into browser CacheStorage...</span>
                <span>{modelInfo.downloadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${modelInfo.downloadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Weights verified & cached for 100% offline operation
              </span>
              <button
                onClick={() => localAIManager.releaseModel()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition cursor-pointer"
                title="Purge model cache"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Sync Queue Telemetry */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-200">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>OFFLINE SYNCHRONIZATION QUEUE</span>
          </div>
          <button
            onClick={handleSyncNow}
            disabled={syncPendingCount === 0 || isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>SYNC NOW</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <div className="flex justify-between items-center">
            <span>Pending records in IndexedDB:</span>
            <strong className={syncPendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
              {syncPendingCount} records waiting to synchronize
            </strong>
          </div>
        </div>
      </div>

    </div>
  );
};
