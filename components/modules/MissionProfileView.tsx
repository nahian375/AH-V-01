/**
 * ASTRA Health - Modern Astronaut Mission Health Profile
 * 
 * Secure personal health & mission-context identity engine.
 * Integrates:
 * - Who is being monitored (Alex Carter, Age, Height, Weight, Blood Group)
 * - What mission they are on (Mars Transit, Sol 47 / 180, Microgravity)
 * - Body & Physiology (Height, Earth Baseline Mass vs Current Mass, Earth-Reference BMI)
 * - Personal Space Baseline (Pre-flight baseline vs In-flight baseline vs Current)
 * - Mission Adaptation (Cardiovascular, Neural, Sleep, Recovery, Fitness, Mental, Radiation)
 * - Space Health Context integration & NASA Medical Privacy compliance
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Rocket, 
  Activity, 
  Settings as SettingsIcon, 
  Shield, 
  Upload, 
  Trash2, 
  Check, 
  ArrowRight, 
  Heart, 
  Moon, 
  BatteryCharging, 
  Zap, 
  Sparkles, 
  Edit3,
  Layers,
  Radio,
  Clock,
  Compass,
  FileText,
  AlertTriangle,
  Info,
  Scale
} from 'lucide-react';
import { AstronautProfile, SUPPORTED_BLOOD_GROUPS, SupportedBloodGroup } from '../../types/profile';
import { HealthEngineOutput } from '../../health/healthEngine';
import { DailyCheckIn, HealthMeasurement, MetricBaseline } from '../../types/health';
import { MissionContext } from '../../types/mission';
import { 
  getAstronautProfile, 
  saveAstronautProfile, 
  subscribeToProfile, 
  calculateProfileCompletion,
  calculateEarthReferenceBmi
} from '../../services/profileService';
import { 
  buildSpaceHealthContext, 
  getMissionAdaptation, 
  SpaceHealthContext 
} from '../../services/spaceContextEngine';
import { 
  AstronautAvatar, 
  MissionPatchBadge 
} from '../profile/AstronautBadge';
import { MissionHealthBriefModal } from '../dashboard/MissionHealthBriefModal';
import { spaceAudio } from '../../utils/spaceAudio';

interface MissionProfileViewProps {
  missionContext: MissionContext;
  healthEngineOutput: HealthEngineOutput;
  todayCheckIn?: DailyCheckIn;
  currentHealth?: HealthMeasurement;
  baselines?: MetricBaseline[];
  onNavigateTab: (tab: any) => void;
  onOpenCheckInModal?: () => void;
}

export const MissionProfileView: React.FC<MissionProfileViewProps> = ({
  missionContext,
  healthEngineOutput,
  todayCheckIn,
  currentHealth,
  baselines,
  onNavigateTab,
  onOpenCheckInModal,
}) => {
  const [profile, setProfile] = useState<AstronautProfile>(() => getAstronautProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AstronautProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);

  useEffect(() => {
    return subscribeToProfile(p => {
      setProfile(p);
      if (!isEditing) {
        setFormData(p);
      }
    });
  }, [isEditing]);

  const { percentage, missingFields } = calculateProfileCompletion(profile);

  // Current measurements & baselines
  const current = currentHealth || healthEngineOutput.currentMeasurement;
  const activeBaselines = baselines || healthEngineOutput.baselines;

  // Build centralized Space Health Context
  const spaceContext: SpaceHealthContext = buildSpaceHealthContext({
    profile,
    mission: missionContext,
    currentHealth: current,
    baselines: activeBaselines,
    recentChanges: healthEngineOutput.multiMetricChanges,
    activeAlerts: healthEngineOutput.activeAlerts,
    recentCheckIn: todayCheckIn,
  });

  const adaptationItems = getMissionAdaptation(spaceContext);

  // Derived Earth-Reference BMI
  const heightVal = isEditing ? formData.body?.heightCm : profile.body?.heightCm;
  const weightVal = isEditing ? (formData.body?.currentWeightKg || formData.body?.baselineWeightKg) : (profile.body?.currentWeightKg || profile.body?.baselineWeightKg);
  const earthBmi = calculateEarthReferenceBmi(heightVal, weightVal);

  // Handle local avatar file upload
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Avatar image must be under 2MB.');
      return;
    }

    setAvatarError(null);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setFormData(prev => ({
          ...prev,
          identity: {
            ...prev.identity,
            avatarUrl: dataUrl,
          },
        }));
        spaceAudio.playClick();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({
      ...prev,
      identity: {
        ...prev.identity,
        avatarUrl: undefined,
      },
    }));
    spaceAudio.playClick();
  };

  // Validation according to Section 4
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Age validation: reasonable range (18-85)
    if (formData.identity.age !== undefined && formData.identity.age !== null) {
      if (isNaN(formData.identity.age) || formData.identity.age < 18 || formData.identity.age > 85) {
        errors.age = 'Age must be between 18 and 85 years.';
      }
    }

    // Height validation: positive number
    if (formData.body?.heightCm !== undefined && formData.body?.heightCm !== null) {
      if (isNaN(formData.body.heightCm) || formData.body.heightCm <= 0 || formData.body.heightCm > 250) {
        errors.height = 'Height must be a positive number in cm (e.g. 178).';
      }
    }

    // Baseline Weight validation: positive number
    if (formData.body?.baselineWeightKg !== undefined && formData.body?.baselineWeightKg !== null) {
      if (isNaN(formData.body.baselineWeightKg) || formData.body.baselineWeightKg <= 0 || formData.body.baselineWeightKg > 300) {
        errors.weight = 'Weight must be a positive number in kg (e.g. 72).';
      }
    }

    // Blood Group validation: must be supported
    if (formData.identity.bloodGroup && formData.identity.bloodGroup.trim() !== '') {
      if (!SUPPORTED_BLOOD_GROUPS.includes(formData.identity.bloodGroup as any)) {
        errors.bloodGroup = `Select a valid blood group (${SUPPORTED_BLOOD_GROUPS.join(', ')}).`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      spaceAudio.playWarning();
      return;
    }

    spaceAudio.playExecute();
    const updated: AstronautProfile = {
      ...formData,
      identity: {
        ...formData.identity,
        lastUpdated: `Sol ${missionContext.sol}`,
      },
      body: {
        ...formData.body,
        weightVerification: `Updated: Sol ${missionContext.sol}`,
      },
    };

    saveAstronautProfile(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    spaceAudio.playClick();
    setFormData(profile);
    setValidationErrors({});
    setIsEditing(false);
    setAvatarError(null);
  };

  // Helper for displaying "NOT PROVIDED"
  const renderValueOrNotProvided = (val: string | number | undefined | null, suffix = '') => {
    if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) {
      return <span className="text-slate-500 font-normal italic">NOT PROVIDED</span>;
    }
    return <span className="font-bold text-slate-100">{val}{suffix}</span>;
  };

  const missionDuration = profile.mission.durationDays || 180;
  const missionDay = profile.mission.currentMissionDay || missionContext.sol || 47;
  const daysRemaining = Math.max(0, missionDuration - missionDay);

  const pb = profile.personalBaseline || spaceContext.personalBaseline;

  return (
    <div id="mission-profile-container" className="space-y-6 max-w-5xl mx-auto pb-12 font-mono select-none">
      
      {/* ============================================================ */}
      {/* 1. HEADER (Section 2)                                         */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Subtle top ambient gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Avatar & Core Profile Info */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <AstronautAvatar 
                avatarUrl={isEditing ? formData.identity.avatarUrl : profile.identity.avatarUrl} 
                fullName={isEditing ? formData.identity.fullName : profile.identity.fullName}
                size="xl" 
              />
              <span 
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399]" 
                title="Health Monitoring Active"
              />
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>ASTRONAUT PROFILE</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide">
                {profile.identity.fullName || 'Alex Carter'}
              </h1>
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                <span className="font-bold text-cyan-300">{profile.identity.crewPosition || profile.identity.role || 'Mission Specialist'}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-bold">{profile.mission.missionName || 'MARS TRANSIT — DEMO'}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Capsule: ASTRA ID, Mission Day, Status */}
          <div className="grid grid-cols-3 gap-2 w-full md:w-auto p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="text-center px-2">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">ASTRA ID</span>
              <strong className="text-cyan-400 text-sm font-bold block mt-0.5">
                {profile.identity.astronautId || 'AST-001'}
              </strong>
            </div>
            <div className="text-center px-2 border-x border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">MISSION DAY</span>
              <strong className="text-amber-400 text-sm font-bold block mt-0.5">
                {missionDay} / {missionDuration}
              </strong>
            </div>
            <div className="text-center px-2">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">STATUS</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <strong className="text-emerald-400 text-[10px] uppercase font-bold tracking-tight">
                  HEALTH MONITORING ACTIVE
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsContextModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>VIEW FULL SPACE CONTEXT</span>
            </button>
            <button
              onClick={() => onNavigateTab('overview')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>HEALTH DASHBOARD</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-xs font-bold text-emerald-400 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>SAVED LOCALLY</span>
              </span>
            )}

            {!isEditing ? (
              <button
                onClick={() => {
                  spaceAudio.playClick();
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT PROFILE</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  SAVE PROFILE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ============================================================ */}
        {/* 2. PERSONAL DATA (Section 3 & 4)                             */}
        {/* ============================================================ */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
                PERSONAL DATA
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase">
                {profile.identity.lastUpdated ? `Updated: ${profile.identity.lastUpdated}` : 'Verified Pre-Flight'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-cyan-400">
                {isEditing ? 'EDITING' : 'VALIDATED'}
              </span>
            </div>
          </div>

          {/* Validation Error Banner */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Please correct the following fields:</strong>
                <ul className="list-disc list-inside space-y-0.5 mt-1 text-[11px]">
                  {Object.values(validationErrors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            
            {/* Full Name */}
            <div>
              <label className="block text-slate-400 mb-1">
                Full Name <span className="text-cyan-400">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={formData.identity.fullName}
                  onChange={e => setFormData({
                    ...formData,
                    identity: { ...formData.identity, fullName: e.target.value }
                  })}
                  placeholder="e.g. Alex Carter"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 outline-none"
                />
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  {renderValueOrNotProvided(profile.identity.fullName)}
                </div>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-slate-400 mb-1">
                Age
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="number"
                    min="18"
                    max="85"
                    value={formData.identity.age ?? ''}
                    onChange={e => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      setFormData({
                        ...formData,
                        identity: { ...formData.identity, age: val }
                      });
                    }}
                    placeholder="e.g. 34"
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950 border ${validationErrors.age ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'} text-slate-100 outline-none`}
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Valid range: 18 – 85 years</span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  {renderValueOrNotProvided(profile.identity.age, ' years')}
                </div>
              )}
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-slate-400 mb-1">
                Blood Group (Emergency Profile)
              </label>
              {isEditing ? (
                <div>
                  <select
                    value={formData.identity.bloodGroup || ''}
                    onChange={e => setFormData({
                      ...formData,
                      identity: { ...formData.identity, bloodGroup: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 outline-none"
                  >
                    <option value="">Select blood group...</option>
                    {SUPPORTED_BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">Medical emergency profile context</span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>{renderValueOrNotProvided(profile.identity.bloodGroup)}</div>
                  {profile.identity.bloodGroup && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                      {profile.identity.bloodGroupVerification || 'Verified pre-flight'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Preferred Name */}
            <div>
              <label className="block text-slate-400 mb-1">
                Preferred Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.identity.preferredName || ''}
                  onChange={e => setFormData({
                    ...formData,
                    identity: { ...formData.identity, preferredName: e.target.value }
                  })}
                  placeholder="e.g. Alex"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 outline-none"
                />
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  {renderValueOrNotProvided(profile.identity.preferredName)}
                </div>
              )}
            </div>

            {/* Crew Role */}
            <div>
              <label className="block text-slate-400 mb-1">
                Crew Role
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.identity.crewPosition || ''}
                  onChange={e => setFormData({
                    ...formData,
                    identity: { ...formData.identity, crewPosition: e.target.value }
                  })}
                  placeholder="e.g. Mission Specialist"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 outline-none"
                />
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  {renderValueOrNotProvided(profile.identity.crewPosition || profile.identity.role)}
                </div>
              )}
            </div>

            {/* Astronaut ID */}
            <div>
              <label className="block text-slate-400 mb-1">
                Astronaut ID
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.identity.astronautId || ''}
                  onChange={e => setFormData({
                    ...formData,
                    identity: { ...formData.identity, astronautId: e.target.value }
                  })}
                  placeholder="e.g. AST-001"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 outline-none"
                />
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 font-bold text-cyan-300">
                  {renderValueOrNotProvided(profile.identity.astronautId)}
                </div>
              )}
            </div>

          </div>

          {/* Avatar Upload Control during editing */}
          {isEditing && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Profile Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarFileChange} 
                  className="hidden" 
                />
              </label>

              {formData.identity.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Avatar</span>
                </button>
              )}
              {avatarError && (
                <span className="text-xs text-rose-400">{avatarError}</span>
              )}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 3. BODY & PHYSIOLOGY (Section 5 & 23)                         */}
        {/* ============================================================ */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
                BODY & PHYSIOLOGY
              </h2>
            </div>
            <span className="text-[10px] text-slate-400">
              Microgravity mass adaptation tracking
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            
            {/* Height */}
            <div>
              <label className="block text-slate-400 mb-1">
                Height (cm)
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="number"
                    min="100"
                    max="240"
                    value={formData.body?.heightCm ?? ''}
                    onChange={e => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      setFormData({
                        ...formData,
                        body: { ...formData.body, heightCm: val }
                      });
                    }}
                    placeholder="178"
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950 border ${validationErrors.height ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'} text-slate-100 outline-none`}
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Baseline pre-flight</span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>{renderValueOrNotProvided(profile.body?.heightCm, ' cm')}</div>
                  <span className="text-[9px] text-slate-500">Pre-flight baseline</span>
                </div>
              )}
            </div>

            {/* Earth Baseline Mass */}
            <div>
              <label className="block text-slate-400 mb-1">
                Earth Baseline Mass (kg)
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="number"
                    step="0.1"
                    min="40"
                    max="200"
                    value={formData.body?.baselineWeightKg ?? ''}
                    onChange={e => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      setFormData({
                        ...formData,
                        body: { ...formData.body, baselineWeightKg: val }
                      });
                    }}
                    placeholder="72"
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950 border ${validationErrors.weight ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'} text-slate-100 outline-none`}
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Pre-flight Earth reference</span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>{renderValueOrNotProvided(profile.body?.baselineWeightKg, ' kg')}</div>
                  <span className="text-[9px] text-slate-500">Pre-flight</span>
                </div>
              )}
            </div>

            {/* Current Recorded Mass */}
            <div>
              <label className="block text-slate-400 mb-1">
                Current Recorded Mass (kg)
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="number"
                    step="0.1"
                    min="40"
                    max="200"
                    value={formData.body?.currentWeightKg ?? ''}
                    onChange={e => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      setFormData({
                        ...formData,
                        body: { ...formData.body, currentWeightKg: val }
                      });
                    }}
                    placeholder="71.4"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">In-flight measurement</span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>{renderValueOrNotProvided(profile.body?.currentWeightKg || profile.body?.baselineWeightKg, ' kg')}</div>
                  <span className="text-[9px] text-amber-400 font-bold">{profile.body?.weightVerification || 'Updated: Sol 42'}</span>
                </div>
              )}
            </div>

            {/* Derived Earth-Reference BMI */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-900/40">
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold block">
                EARTH-REFERENCE BMI
              </span>
              <div className="text-base font-bold text-slate-100 mt-0.5">
                {earthBmi ? earthBmi.displayString : <span className="text-slate-500 text-xs italic">NOT PROVIDED</span>}
              </div>
              {earthBmi && (
                <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                  Category: {earthBmi.category}
                </span>
              )}
            </div>

          </div>

          {/* Scientific Explainer for BMI in microgravity (Section 5) */}
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-200 font-sans leading-relaxed">
              <strong className="font-mono text-indigo-300 uppercase tracking-wider block mb-0.5">
                Baseline BMI Reference:
              </strong>
              "Reference metric calculated from entered height and mass. Interpretation may differ during spaceflight." In microgravity, cephalad fluid shift, muscle volume redistribution, and spinal lengthening alter mass and tissue ratios.
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. MISSION CONTEXT (Section 6)                               */}
        {/* ============================================================ */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
                MISSION CONTEXT
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-bold text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>MARS TRANSIT</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Mission</span>
              <strong className="text-slate-100 text-xs block mt-1">
                {profile.mission.missionName || missionContext.name}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Mission Day / Sol</span>
              <strong className="text-amber-400 text-xs block mt-1">
                {missionDay} / {missionDuration} (Sol {missionContext.sol})
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Phase</span>
              <strong className="text-slate-100 text-xs block mt-1">
                {profile.mission.phase || missionContext.missionPhase || 'Transit'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Destination</span>
              <strong className="text-cyan-300 text-xs block mt-1">
                {profile.mission.destination || 'Mars'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Gravity Environment</span>
              <strong className="text-indigo-300 text-xs block mt-1">
                {profile.mission.gravityEnvironment || 'Microgravity'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Communication</span>
              <strong className="text-emerald-400 text-xs block mt-1">
                {profile.mission.communicationStatus || missionContext.communicationStatus || 'ONLINE'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Mission Duration</span>
              <strong className="text-slate-100 text-xs block mt-1">
                {missionDuration} Days
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Days Remaining</span>
              <strong className="text-slate-200 text-xs block mt-1">
                {daysRemaining} Days
              </strong>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. PERSONAL SPACE BASELINE (Section 15)                       */}
        {/* ============================================================ */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
                PERSONAL SPACE BASELINE
              </h2>
            </div>
            <span className="text-[10px] text-slate-400">
              Pre-flight baseline vs Current in-flight equilibrium
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 font-sans text-xs leading-relaxed">
            <strong className="font-mono text-cyan-300 uppercase tracking-wider block mb-0.5">
              Spaceflight Baseline Discipline:
            </strong>
            The baseline evolves during the mission. Separating Earth pre-flight measurements from in-flight adaptation prevents ASTRA from treating pre-flight Earth levels as permanently unchanged. Current in-flight baseline is a monitoring baseline, not automatically declared medically normal.
          </div>

          {/* Baseline Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            
            {/* Resting Heart Rate */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-slate-200">Resting HR</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/60 border border-amber-800 text-amber-300">
                  {pb.restingHeartRate.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block">Pre-flight</span>
                  <strong className="text-slate-300">{pb.restingHeartRate.preFlightValue} bpm</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">In-flight base</span>
                  <strong className="text-cyan-300">{pb.restingHeartRate.inFlightBaseline} bpm</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Current</span>
                  <strong className="text-amber-400">{pb.restingHeartRate.currentValue} bpm</strong>
                </div>
              </div>
              <div className="text-[10px] text-amber-300/90 pt-1 border-t border-slate-800/80">
                Diff from flight baseline: <strong className="font-bold">+{pb.restingHeartRate.differenceFromInFlight} bpm</strong>
              </div>
            </div>

            {/* HRV */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-slate-200">HRV (RMSSD)</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                  {pb.hrv.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block">Pre-flight</span>
                  <strong className="text-slate-300">{pb.hrv.preFlightValue} ms</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">In-flight base</span>
                  <strong className="text-cyan-300">{pb.hrv.inFlightBaseline} ms</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Current</span>
                  <strong className="text-slate-200">{pb.hrv.currentValue} ms</strong>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                Diff from flight baseline: <strong className="text-slate-200">{pb.hrv.differenceFromInFlight} ms</strong>
              </div>
            </div>

            {/* Sleep Duration */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-slate-200">Sleep Duration</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/60 border border-amber-800 text-amber-300">
                  {pb.sleepDuration.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block">Pre-flight</span>
                  <strong className="text-slate-300">{pb.sleepDuration.preFlightValue} h</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">In-flight base</span>
                  <strong className="text-cyan-300">{pb.sleepDuration.inFlightBaseline} h</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Current</span>
                  <strong className="text-amber-400">{pb.sleepDuration.currentValue} h</strong>
                </div>
              </div>
              <div className="text-[10px] text-amber-300/90 pt-1 border-t border-slate-800/80">
                Diff from flight baseline: <strong className="font-bold">{pb.sleepDuration.differenceFromInFlight} h</strong>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-slate-200">Systolic BP</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                  {pb.bloodPressureSystolic.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block">Pre-flight</span>
                  <strong className="text-slate-300">{pb.bloodPressureSystolic.preFlightValue} mmHg</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">In-flight base</span>
                  <strong className="text-cyan-300">{pb.bloodPressureSystolic.inFlightBaseline} mmHg</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Current</span>
                  <strong className="text-slate-200">{pb.bloodPressureSystolic.currentValue} mmHg</strong>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                Diff from flight baseline: <strong className="text-slate-200">+{pb.bloodPressureSystolic.differenceFromInFlight} mmHg</strong>
              </div>
            </div>

            {/* SpO2 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-slate-200">SpO₂</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                  {pb.spo2.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block">Pre-flight</span>
                  <strong className="text-slate-300">{pb.spo2.preFlightValue}%</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">In-flight base</span>
                  <strong className="text-cyan-300">{pb.spo2.inFlightBaseline}%</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Current</span>
                  <strong className="text-emerald-400">{pb.spo2.currentValue}%</strong>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                Diff from flight baseline: <strong className="text-slate-200">+{pb.spo2.differenceFromInFlight}%</strong>
              </div>
            </div>

            {/* Core Temperature */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-slate-200">Core Temp</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                  {pb.coreTemperature.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block">Pre-flight</span>
                  <strong className="text-slate-300">{pb.coreTemperature.preFlightValue}°C</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">In-flight base</span>
                  <strong className="text-cyan-300">{pb.coreTemperature.inFlightBaseline}°C</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Current</span>
                  <strong className="text-slate-200">{pb.coreTemperature.currentValue}°C</strong>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                Diff from flight baseline: <strong className="text-slate-200">+{pb.coreTemperature.differenceFromInFlight}°C</strong>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. MISSION ADAPTATION (Section 16)                           */}
        {/* ============================================================ */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
                MISSION ADAPTATION
              </h2>
            </div>
            <span className="text-[10px] text-slate-400">
              Long-term adaptation across 7 domains
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {adaptationItems.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 font-bold block">{item.domain}</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">{item.summary}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    item.status === 'Stable'
                      ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800'
                      : item.status === 'Monitoring'
                      ? 'text-amber-300 bg-amber-950/60 border-amber-800'
                      : 'text-cyan-300 bg-cyan-950/60 border-cyan-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 7. DATA PRIVACY & MEDICAL INFORMATION PROTECTION (Section 25) */}
        {/* ============================================================ */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
              ASTRONAUT MEDICAL PRIVACY
            </h2>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Treating profile and medical telemetry as sensitive personal information. In accordance with NASA human-spaceflight biomedical privacy standards, detailed health indicators and subjective check-ins are restricted to astronaut personal review and authorized flight surgeons. No unvetted data is exposed to unauthorized crew members or non-mission channels.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">ASTRONAUT</span>
              <strong className="text-emerald-400 block mt-1">Full Detailed Health Data</strong>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Unrestricted personal access</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">CREW MEDICAL ROLE</span>
              <strong className="text-cyan-300 block mt-1">Authorized Flight Surgeon Access</strong>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Operational health overview</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">MISSION CONTROL</span>
              <strong className="text-slate-300 block mt-1">Mission-Authorized Telemetry</strong>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Anonymized safety metrics</span>
            </div>
          </div>
        </section>

      </form>

      {/* Full Modal for Space Context Deep Dive */}
      <MissionHealthBriefModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        context={spaceContext}
        onAskAstra={(prompt) => {
          setIsContextModalOpen(false);
          onNavigateTab('astra-ai');
        }}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
