import React, { useState } from 'react';
import { 
  User, 
  Rocket, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  X,
  Sparkles
} from 'lucide-react';
import { AstronautProfile } from '../../types/profile';
import { 
  getAstronautProfile, 
  saveAstronautProfile, 
  markProfileOnboardingDone 
} from '../../services/profileService';
import { spaceAudio } from '../../utils/spaceAudio';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [profileData, setProfileData] = useState<AstronautProfile>(() => getAstronautProfile());

  if (!isOpen) return null;

  const handleNext = () => {
    spaceAudio.playClick();
    if (step < 4) {
      setStep((step + 1) as any);
    }
  };

  const handleBack = () => {
    spaceAudio.playClick();
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  const handleSkip = () => {
    spaceAudio.playClick();
    markProfileOnboardingDone();
    onClose();
  };

  const handleFinish = () => {
    spaceAudio.playQuindar();
    saveAstronautProfile({
      ...profileData,
      isConfigured: true,
    });
    markProfileOnboardingDone();
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-sans"
      role="dialog"
      aria-label="Mission Identity Setup"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] p-6 font-mono overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-600/60">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-100 tracking-wider uppercase">
                WELCOME TO ASTRA
              </h2>
              <p className="text-[10px] text-slate-400">
                Let's configure your mission identity.
              </p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-900 transition cursor-pointer"
            title="Skip setup for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Step Indicator */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center text-[10px]">
          {[
            { num: 1, label: 'Identity' },
            { num: 2, label: 'Mission' },
            { num: 3, label: 'Preferences' },
            { num: 4, label: 'Ready' },
          ].map(s => (
            <div key={s.num} className="flex flex-col items-center gap-1">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#06b6d4]'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={step === s.num ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP CONTENT */}
        <div className="min-h-[220px] mb-6 text-xs">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  Full Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.identity.fullName}
                  onChange={e => setProfileData({
                    ...profileData,
                    identity: { ...profileData.identity, fullName: e.target.value }
                  })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Preferred Name
                  </label>
                  <input
                    type="text"
                    value={profileData.identity.preferredName || ''}
                    onChange={e => setProfileData({
                      ...profileData,
                      identity: { ...profileData.identity, preferredName: e.target.value }
                    })}
                    placeholder="e.g. Alex"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Call Sign (Optional)
                  </label>
                  <input
                    type="text"
                    value={profileData.identity.callSign || ''}
                    onChange={e => setProfileData({
                      ...profileData,
                      identity: { ...profileData.identity, callSign: e.target.value }
                    })}
                    placeholder="e.g. Orion"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Astronaut ID <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.identity.astronautId}
                    onChange={e => setProfileData({
                      ...profileData,
                      identity: { ...profileData.identity, astronautId: e.target.value }
                    })}
                    placeholder="e.g. AST-001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={85}
                    value={profileData.identity.age || ''}
                    onChange={e => setProfileData({
                      ...profileData,
                      identity: { ...profileData.identity, age: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    placeholder="34"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Blood Group</label>
                  <select
                    value={profileData.identity.bloodGroup || 'O+'}
                    onChange={e => setProfileData({
                      ...profileData,
                      identity: { ...profileData.identity, bloodGroup: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={profileData.body?.heightCm || ''}
                    onChange={e => setProfileData({
                      ...profileData,
                      body: { ...(profileData.body || {}), heightCm: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    placeholder="178"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Mass (kg)</label>
                  <input
                    type="number"
                    value={profileData.body?.baselineWeightKg || ''}
                    onChange={e => setProfileData({
                      ...profileData,
                      body: { ...(profileData.body || {}), baselineWeightKg: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    placeholder="72"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MISSION */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  Mission Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.mission.missionName}
                  onChange={e => setProfileData({
                    ...profileData,
                    mission: { ...profileData.mission, missionName: e.target.value }
                  })}
                  placeholder="e.g. ARES-01"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Mission Role <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.identity.role}
                  onChange={e => setProfileData({
                    ...profileData,
                    identity: { ...profileData.identity, role: e.target.value }
                  })}
                  placeholder="e.g. Science Operations"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={profileData.mission.destination || ''}
                  onChange={e => setProfileData({
                    ...profileData,
                    mission: { ...profileData.mission, destination: e.target.value }
                  })}
                  placeholder="e.g. Mars"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Unit System</label>
                  <select
                    value={profileData.preferences.units}
                    onChange={e => setProfileData({
                      ...profileData,
                      preferences: { ...profileData.preferences, units: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
                  >
                    <option value="metric">Metric (kg, km)</option>
                    <option value="imperial">Imperial (lbs, mi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Time Format</label>
                  <select
                    value={profileData.preferences.timeFormat}
                    onChange={e => setProfileData({
                      ...profileData,
                      preferences: { ...profileData.preferences, timeFormat: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
                  >
                    <option value="24h">24-hour UTC</option>
                    <option value="12h">12-hour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">AI Assistant Routing</label>
                <select
                  value={profileData.preferences.aiMode || 'auto'}
                  onChange={e => setProfileData({
                    ...profileData,
                    preferences: { ...profileData.preferences, aiMode: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none"
                >
                  <option value="auto">Auto (Smart Uplink Switch)</option>
                  <option value="online">Online (Gemini Cloud API)</option>
                  <option value="offline">Offline (Local Browser Model)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: READY */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center text-center p-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center shadow-[0_0_20px_#10b981]">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-sm font-black text-slate-100 tracking-wider">
                MISSION PROFILE CONFIGURED
              </h3>
              <p className="text-slate-400 text-xs max-w-xs">
                Welcome aboard, <strong className="text-cyan-300">{profileData.identity.fullName || 'Astronaut'}</strong>. Your profile has been cached locally in your autonomous ASTRA space flight computer.
              </p>
            </div>
          )}

        </div>

        {/* Buttons Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            SKIP FOR NOW
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <span>NEXT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                LAUNCH ASTRA
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
