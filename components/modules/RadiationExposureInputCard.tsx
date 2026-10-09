/**
 * ASTRA Health - Radiation Exposure Input Card
 * Modern ASTRA-style card for recording personal radiation dosimetry.
 * Connects directly to the central health data pipeline and IndexedDB.
 */

import React, { useState } from 'react';
import { 
  Radiation, 
  Shield, 
  Plus, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Radio, 
  Info, 
  AlertTriangle,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { 
  RadiationMeasurement, 
  RadiationUnit, 
  RadiationMeasurementType, 
  RadiationSource 
} from '../../types/health';
import { normalizeToMilliSieverts } from '../../services/radiationSafetyRules';
import { spaceAudio } from '../../utils/spaceAudio';

interface RadiationExposureInputCardProps {
  sol: number;
  currentDaily_uSv?: number;
  currentCumulative_mSv?: number;
  onSaveRadiationMeasurement: (measurement: Omit<RadiationMeasurement, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'synced'>) => Promise<void>;
  recentMeasurements?: RadiationMeasurement[];
  onDeleteMeasurement?: (id: string) => Promise<void>;
  isOffline?: boolean;
}

export const RadiationExposureInputCard: React.FC<RadiationExposureInputCardProps> = ({
  sol,
  currentDaily_uSv = 450,
  currentCumulative_mSv = 88.7,
  onSaveRadiationMeasurement,
  recentMeasurements = [],
  onDeleteMeasurement,
  isOffline = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [todayValue, setTodayValue] = useState<string>((currentDaily_uSv / 1000).toFixed(2));
  const [todayUnit, setTodayUnit] = useState<RadiationUnit>('mSv');
  
  const [cumulativeValue, setCumulativeValue] = useState<string>(currentCumulative_mSv.toFixed(1));
  const [cumulativeUnit, setCumulativeUnit] = useState<RadiationUnit>('mSv');

  const [source, setSource] = useState<RadiationSource>('personal_dosimeter');
  const [measurementTime, setMeasurementTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  // Advanced Fields
  const [measurementType, setMeasurementType] = useState<RadiationMeasurementType>('doseEquivalent');
  const [doseRate, setDoseRate] = useState<string>('19.2');
  const [doseRateUnit, setDoseRateUnit] = useState<RadiationUnit>('uSv/h');
  const [instrumentId, setInstrumentId] = useState<string>('RAD-CREW-01 (BION-IV)');
  const [locationContext, setLocationContext] = useState<string>('Crew Quarters Berth 01');
  const [missionPhase, setMissionPhase] = useState<string>('Cruise');
  const [notes, setNotes] = useState<string>('');

  const triggerFeedback = (msg: string) => {
    spaceAudio.playExecute();
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numVal = parseFloat(todayValue);
    if (isNaN(numVal)) {
      setErrorMsg('Enter a valid radiation measurement.');
      return;
    }

    if (numVal < 0) {
      setErrorMsg('Radiation exposure cannot be negative.');
      return;
    }

    if (!todayUnit) {
      setErrorMsg('Select the measurement unit.');
      return;
    }

    const normEquiv = normalizeToMilliSieverts(numVal, todayUnit, measurementType);

    setIsSaving(true);
    try {
      await onSaveRadiationMeasurement({
        sol,
        timestamp: new Date(measurementTime).toISOString(),
        measurementType,
        value: numVal,
        unit: todayUnit,
        equivalent_mSv: normEquiv ?? undefined,
        doseRate_uSv_h: doseRate ? parseFloat(doseRate) : undefined,
        source,
        instrumentId: instrumentId.trim() || undefined,
        missionPhase: missionPhase.trim() || undefined,
        locationContext: locationContext.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      triggerFeedback('Personal radiation measurement recorded into health telemetry.');
      setIsOpen(false);
      setShowAdvanced(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to record radiation measurement.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden font-mono">
      {/* Subtle top amber-cyan ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/40 via-cyan-500/40 to-amber-500/20" />

      {/* SUCCESS MESSAGE */}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/90 border border-rose-500/80 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Radiation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wider">
                RADIATION EXPOSURE
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/50">
                MONITORING
              </span>
              {isOffline && (
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  ● OFFLINE READY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Personal radiation monitoring & autonomous dosimeter logging • Sol {sol}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setErrorMsg(null);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border border-amber-700/60 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
        >
          {isOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isOpen ? 'CANCEL' : 'RECORD MEASUREMENT'}</span>
        </button>
      </div>

      {/* SUMMARY DISPLAY TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Tile 1: Today's Exposure */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Today's Exposure</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
            {(currentDaily_uSv / 1000).toFixed(2)}{' '}
            <span className="text-xs text-slate-500 font-normal">mSv</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <span>Nominal: 0.35–0.65 mSv</span>
          </div>
        </div>

        {/* Tile 2: Mission Cumulative Total */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Mission Total</div>
          <div className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
            {currentCumulative_mSv.toFixed(1)}{' '}
            <span className="text-xs text-slate-500 font-normal">mSv</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Career limit: 600.0 mSv ({((currentCumulative_mSv / 600) * 100).toFixed(1)}%)
          </div>
        </div>

        {/* Tile 3: Latest Measurement & Source */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Latest Source</div>
          <div className="text-sm font-bold text-cyan-400 mt-1 truncate">
            {recentMeasurements[0]?.source ? recentMeasurements[0].source.replace('_', ' ').toUpperCase() : 'PERSONAL DOSIMETER'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {recentMeasurements[0]?.timestamp 
              ? new Date(recentMeasurements[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '14:32 UTC'}
          </div>
        </div>

        {/* Tile 4: Environmental Context Distinction */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Mission Context</div>
          <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" />
            <span>CACHED (NASA)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            GCR Deep Space Ambient
          </div>
        </div>
      </div>

      {/* INPUT FORM (MODERN ASTRA STYLE) */}
      {isOpen && (
        <form onSubmit={handleSave} className="p-5 rounded-xl bg-slate-950 border border-amber-900/60 mb-5 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Radiation className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Log Personal Radiation Dosimetry
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Sol {sol}</span>
          </div>

          {/* Core Simple Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Today's Exposure */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Exposure Today
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={todayValue}
                  onChange={(e) => setTodayValue(e.target.value)}
                  placeholder="0.45"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                />
                <select
                  value={todayUnit}
                  onChange={(e) => setTodayUnit(e.target.value as RadiationUnit)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="mSv">mSv</option>
                  <option value="uSv">µSv</option>
                  <option value="Sv">Sv</option>
                  <option value="mGy">mGy</option>
                  <option value="uGy">µGy</option>
                  <option value="Gy">Gy</option>
                </select>
              </div>
            </div>

            {/* 2. Cumulative Mission Exposure */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Cumulative Mission Exposure
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={cumulativeValue}
                  onChange={(e) => setCumulativeValue(e.target.value)}
                  placeholder="88.7"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                />
                <select
                  value={cumulativeUnit}
                  onChange={(e) => setCumulativeUnit(e.target.value as RadiationUnit)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="mSv">mSv</option>
                  <option value="Sv">Sv</option>
                  <option value="mGy">mGy</option>
                </select>
              </div>
            </div>

            {/* 3. Measurement Source */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Measurement Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as RadiationSource)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="personal_dosimeter">Personal Dosimeter (Badge / Silicon)</option>
                <option value="manual">Manual Astronaut Entry</option>
                <option value="sensor">Connected Habitat Sensor Suite</option>
                <option value="nasa">NASA / Mission Telemetry Link</option>
                <option value="imported">Imported Dosimetry Archive</option>
              </select>
            </div>

            {/* 4. Measurement Time */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Measurement Time
              </label>
              <input
                type="datetime-local"
                value={measurementTime}
                onChange={(e) => setMeasurementTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* ADVANCED DETAILS ACCORDION */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold cursor-pointer transition"
            >
              <span>{showAdvanced ? 'Hide Advanced Details' : 'Advanced Details'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 animate-fade-in text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Measurement Type</label>
                  <select
                    value={measurementType}
                    onChange={(e) => setMeasurementType(e.target.value as RadiationMeasurementType)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200"
                  >
                    <option value="doseEquivalent">Dose Equivalent (Sv / rem)</option>
                    <option value="absorbedDose">Absorbed Dose (Gy / rad)</option>
                    <option value="doseRate">Dose Rate (µSv/h / mGy/h)</option>
                    <option value="cumulativeExposure">Cumulative Mission Exposure</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Instantaneous Dose Rate</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={doseRate}
                      onChange={(e) => setDoseRate(e.target.value)}
                      placeholder="19.2"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200"
                    />
                    <select
                      value={doseRateUnit}
                      onChange={(e) => setDoseRateUnit(e.target.value as RadiationUnit)}
                      className="px-2 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-300 font-bold"
                    >
                      <option value="uSv/h">µSv/h</option>
                      <option value="mSv/h">mSv/h</option>
                      <option value="mGy/h">mGy/h</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Instrument / Dosimeter ID</label>
                  <input
                    type="text"
                    value={instrumentId}
                    onChange={(e) => setInstrumentId(e.target.value)}
                    placeholder="RAD-CREW-01"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Location Context</label>
                  <input
                    type="text"
                    value={locationContext}
                    onChange={(e) => setLocationContext(e.target.value)}
                    placeholder="Crew Quarters Berth 01"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Mission Phase</label>
                  <input
                    type="text"
                    value={missionPhase}
                    onChange={(e) => setMissionPhase(e.target.value)}
                    placeholder="Cruise"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Operational Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Post-EVA check"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-amber-950/50 flex items-center gap-1.5"
            >
              <Radiation className="w-3.5 h-3.5" />
              <span>{isSaving ? 'VALIDATING & SAVING...' : 'SAVE MEASUREMENT'}</span>
            </button>
          </div>
        </form>
      )}

      {/* RECENT PERSONAL RADIATION LOG TABLE */}
      {recentMeasurements.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              Recent Personal Dosimetry Log ({recentMeasurements.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Source of truth: Local Dexie DB
            </span>
          </div>

          <div className="space-y-2">
            {recentMeasurements.slice(0, 3).map((item) => {
              const d = new Date(item.timestamp);
              const timeStr = `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <span>{item.value} {item.unit}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.measurementType}
                        </span>
                        {item.instrumentId && (
                          <span className="text-[10px] text-slate-500 hidden sm:inline">
                            [{item.instrumentId}]
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {item.notes || 'Routine dosimeter reading'} • {item.locationContext || 'Habitat'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-[10px] text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold uppercase">
                      {item.source.replace('_', ' ')}
                    </span>
                    <span>{timeStr}</span>
                    {onDeleteMeasurement && (
                      <button
                        onClick={() => onDeleteMeasurement(item.id)}
                        className="text-slate-600 hover:text-rose-400 transition ml-1"
                        title="Delete entry"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {recentMeasurements.length === 0 && !isOpen && (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center">
          <Radiation className="w-6 h-6 text-amber-500/60 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            No personal measurements recorded yet
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5">
            Add a measurement manually or connect a supported mission dosimeter.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="mt-3 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border border-amber-800/60 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD MEASUREMENT</span>
          </button>
        </div>
      )}
    </div>
  );
};
