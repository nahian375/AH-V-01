/**
 * ASTRA Health - AI Assistant View
 * Conversational astronaut intelligence & interactive activity tracking interface.
 * Features Framer Motion entrance & typing animations, multi-turn memory, real-time activity logging, and dual-mode AI inference.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HealthAIContext, AIMode, AISource, AIResponse, ChatHistoryMessage, ActivityActionPayload } from '../../types/ai';
import { HealthMeasurement, MetricBaseline, HealthAlert, DailyCheckIn } from '../../types/health';
import { MissionContext } from '../../types/mission';
import { ActivityRecord, DailyActivitySummary } from '../../types/activity';
import { NavTab } from '../layout/Navigation';
import { askASTRA } from '../../ai/aiRouter';
import { buildHealthAIContext } from '../../ai/healthAIContext';
import { SUGGESTED_ASTRONAUT_PROMPTS } from '../../ai/prompts';
import { getAstronautProfile, getDisplayName, subscribeToProfile } from '../../services/profileService';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  BookOpen, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Trash2,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Dumbbell,
  Droplets,
  Utensils,
  CheckSquare,
  Flame,
  Plus,
  Activity as ActivityIcon,
  ChevronRight,
  RotateCcw,
  Sliders,
  Smile,
  Zap,
  Radio,
  Compass
} from 'lucide-react';

interface AIAssistantViewProps {
  missionContext: MissionContext;
  currentHealth: HealthMeasurement;
  baselines: MetricBaseline[];
  activeAlerts: HealthAlert[];
  recentCheckIn?: DailyCheckIn;
  activities?: ActivityRecord[];
  dailyActivitySummary?: DailyActivitySummary;
  aiMode: AIMode;
  activeAiSource: AISource;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onOpenCheckInModal?: () => void;
  onRecordActivity?: (payload: {
    category: ActivityRecord['category'];
    title: string;
    details: string;
    durationMinutes?: number;
    intensity?: ActivityRecord['intensity'];
    metrics?: ActivityRecord['metrics'];
    sol?: number;
    loggedBy?: ActivityRecord['loggedBy'];
  }) => Promise<ActivityRecord>;
  onDeleteActivity?: (id: string) => Promise<void>;
}

interface ChatMessage {
  id: string;
  sender: 'ASTRONAUT' | 'ASTRA';
  text: string;
  timestamp: string;
  response?: AIResponse;
  loggedActivity?: ActivityRecord | ActivityActionPayload;
  dataUsed?: string[];
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  missionContext,
  currentHealth,
  baselines,
  activeAlerts,
  recentCheckIn,
  activities = [],
  dailyActivitySummary,
  aiMode,
  activeAiSource,
  initialPrompt,
  onClearInitialPrompt,
  onNavigateTab,
  onOpenCheckInModal,
  onRecordActivity,
  onDeleteActivity,
}) => {
  const [profile, setProfile] = useState(() => getAstronautProfile());
  const astronautName = getDisplayName(profile);
  const callSignStr = profile.identity.callSign ? ` (Call sign: ${profile.identity.callSign})` : '';

  useEffect(() => {
    return subscribeToProfile(p => {
      setProfile(p);
    });
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ASTRA',
      text: `Hello ${astronautName}${callSignStr}. ASTRA Interactive Intelligence is active on Sol ${missionContext.sol}.\n\nI can converse naturally on any mission topic, analyze your bio-telemetry in real time, and continuously track your daily exercise, hydration, nutrition, and operational tasks.\n\nHow are you feeling today, or what would you like to log or review?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActivityTracker, setShowActivityTracker] = useState(true);
  const [quickLogSuccess, setQuickLogSuccess] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convert current chat messages to multi-turn history for Gemini / Local ASTRA
  const conversationHistory: ChatHistoryMessage[] = useMemo(() => {
    return messages
      .filter(m => m.id !== 'welcome-msg')
      .slice(-10) // Keep last 10 turns for optimal context window
      .map(m => ({
        role: m.sender === 'ASTRONAUT' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));
  }, [messages]);

  // Handle initial prompt passed from other tabs or buttons
  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Quick Activity Logging helper
  const handleQuickLog = async (category: ActivityRecord['category'], title: string, details: string, extra?: any) => {
    if (!onRecordActivity) return;
    try {
      const rec = await onRecordActivity({
        category,
        title,
        details,
        durationMinutes: extra?.durationMinutes,
        intensity: extra?.intensity,
        metrics: extra?.metrics,
        sol: missionContext.sol,
        loggedBy: 'ASTRONAUT',
      });

      setQuickLogSuccess(`Logged: ${title}`);
      setTimeout(() => setQuickLogSuccess(null), 3000);

      // Add feedback directly to chat conversation
      const astraFeedback: ChatMessage = {
        id: `msg-${Date.now()}-quicklog`,
        sender: 'ASTRA',
        text: `Logged **${title}** (${details}) to your Sol ${missionContext.sol} operational record. Your daily progress indicators have been refreshed!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        loggedActivity: rec,
      };
      setMessages(prev => [...prev, astraFeedback]);
    } catch (err: any) {
      console.error('Failed to quick log activity:', err);
    }
  };

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || isProcessing) return;

    setInputQuestion('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'ASTRONAUT',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const context = buildHealthAIContext({
        mission: missionContext,
        currentHealth,
        baselines,
        activeAlerts,
        recentCheckIn,
        mode: aiMode,
        userQuestion: q,
        history: conversationHistory,
        recentActivities: activities.slice(0, 10),
        dailyActivitySummary: dailyActivitySummary,
        astronautProfile: profile.identity,
      });

      const response = await askASTRA({
        question: q,
        healthContext: context,
        history: conversationHistory,
        mode: aiMode,
      });

      let loggedRecord: ActivityRecord | undefined = undefined;

      // If the AI parsed an activity action from user's text, record it in IndexedDB
      if (response.activityAction && onRecordActivity) {
        try {
          loggedRecord = await onRecordActivity({
            category: response.activityAction.category,
            title: response.activityAction.title,
            details: response.activityAction.details,
            durationMinutes: response.activityAction.durationMinutes,
            intensity: response.activityAction.intensity,
            metrics: response.activityAction.metrics,
            sol: missionContext.sol,
            loggedBy: 'ASTRA_AI',
          });
        } catch (actErr) {
          console.warn('Could not auto-save activityAction from AI:', actErr);
        }
      }

      const astraMsg: ChatMessage = {
        id: `msg-${Date.now()}-astra`,
        sender: 'ASTRA',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response,
        loggedActivity: loggedRecord || response.activityAction,
      };

      setMessages(prev => [...prev, astraMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'ASTRA',
        text: `Error processing query: ${err.message || 'Unknown issue'}. Falling back to autonomous spaceflight telemetric baseline comparator.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-msg-${Date.now()}`,
        sender: 'ASTRA',
        text: `Conversation memory reset. ASTRA Interactive Assistant is ready on Sol ${missionContext.sol}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const extractActionButtons = (fullText: string) => {
    const list: { label: string; tab: NavTab; action?: string }[] = [];
    if (fullText.includes('[VIEW SLEEP TREND]')) {
      list.push({ label: 'VIEW SLEEP TREND', tab: 'trends' });
    }
    if (fullText.includes("[OPEN TODAY'S CHECK-IN]")) {
      list.push({ label: "OPEN TODAY'S CHECK-IN", tab: 'check-in', action: 'check-in' });
    }
    if (fullText.includes('[VIEW PHYSICAL HEALTH]') || fullText.includes('[VIEW BIO SIGNAL]')) {
      list.push({ label: 'VIEW BIO SIGNAL', tab: 'physical' });
    }
    if (fullText.includes('[VIEW MENTAL HEALTH]') || fullText.includes('[VIEW NEURAL SIGNAL]')) {
      list.push({ label: 'VIEW NEURAL SIGNAL', tab: 'mental' });
    }
    if (fullText.includes('[VIEW HEALTH DASHBOARD]')) {
      list.push({ label: 'VIEW HEALTH DASHBOARD', tab: 'overview' });
    }
    if (fullText.includes('[WHAT CHANGED]')) {
      list.push({ label: 'WHAT CHANGED', tab: 'what-changed' });
    }
    if (fullText.includes('[VIEW ALERT]')) {
      list.push({ label: 'VIEW ALERTS', tab: 'alerts' });
    }
    if (fullText.includes('[VIEW 7-DAY TRENDS]')) {
      list.push({ label: 'VIEW 7-DAY TRENDS', tab: 'trends' });
    }
    return list;
  };

  const cleanActionTags = (str: string) => {
    return str
      .replace(/\[(VIEW [^\]]+|OPEN [^\]]+|WHAT CHANGED|LOG ACTIVITY)\]/g, '')
      .replace(/\[ACTIVITY_LOG:\s*\{[\s\S]*?\}\]/g, '')
      .trim();
  };

  return (
    <div 
      id="astra-ai-view"
      className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] min-h-[600px]"
    >
      {/* Main Conversational AI Chat Area */}
      <div className="flex-1 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-2 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-inner"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="w-5 h-5 text-cyan-400" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight">ASTRA Intelligence</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  Interactive Sol {missionContext.sol}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Real-time conversational companion & activity telemetry tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Source Mode Indicator */}
            <motion.div 
              id="ai-assistant-source-badge"
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                activeAiSource.includes('GEMINI')
                  ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                  : 'bg-amber-950/80 border-amber-700 text-amber-300'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className={`w-2 h-2 rounded-full ${
                activeAiSource.includes('GEMINI') ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <span>
                {activeAiSource.includes('GEMINI')
                  ? 'ONLINE • Gemini Cloud'
                  : activeAiSource.includes('LOCAL')
                  ? 'OFFLINE • Local ASTRA AI'
                  : 'AUTO • Hybrid'}
              </span>
            </motion.div>

            {/* Toggle Activity Sidebar */}
            <motion.button
              onClick={() => setShowActivityTracker(prev => !prev)}
              className={`p-2 rounded-lg border text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
                showActivityTracker 
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Activity Tracker Panel"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ActivityIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Activity Bar</span>
            </motion.button>

            {/* Clear Conversation */}
            <motion.button
              onClick={handleClearHistory}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              title="Clear Conversation History"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* ASTRA SPACE CONTEXT STRIP (Section 17) */}
        <div className="px-4 py-2 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-b border-cyan-500/20 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300 text-[11px]">
            <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              ASTRA SPACE CONTEXT
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span>● Mission Day {profile.mission.currentMissionDay || missionContext.sol || 47}</span>
            <span>● {profile.mission.phase || missionContext.missionPhase || 'Transit'} Phase</span>
            <span>● {profile.mission.gravityEnvironment || 'Microgravity'}</span>
            <span className={activeAiSource.includes('GEMINI') ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              ● Communication {activeAiSource.includes('GEMINI') ? 'Online' : 'Local Mode'}
            </span>
            <span className="text-cyan-300">● Personal Baseline Active</span>
            <span className="text-slate-400">● NASA Context Available</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
            Ask ASTRA about your health, mission conditions, or recent changes.
          </p>
        </div>

        {/* Quick Activity Quick-Action Bar */}
        <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max text-xs">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Log:
            </span>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickLog('HYDRATION', 'Electrolyte Hydration Pack', '500 ml electrolyte hydration packet', { metrics: { volumeMl: 500 } })}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-800/70 text-cyan-300 font-mono text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Droplets className="w-3 h-3 text-cyan-400" /> +500ml Water
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickLog('EXERCISE', 'CEVIS Cycle Ergometer', '45 min cardiovascular countermeasure at 180W', { durationMinutes: 45, intensity: 'MODERATE', metrics: { durationMinutes: 45, watts: 180, calories: 380 } })}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-800/70 text-emerald-300 font-mono text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <ActivityIcon className="w-3 h-3 text-emerald-400" /> +45m CEVIS (180W)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickLog('EXERCISE', 'ARED Resistive Loading', '60 min full-body bone/muscle density loading (1,350 kg)', { durationMinutes: 60, intensity: 'HIGH', metrics: { durationMinutes: 60, loadKg: 1350, calories: 510 } })}
              className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/90 border border-purple-800/70 text-purple-300 font-mono text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Dumbbell className="w-3 h-3 text-purple-400" /> +60m ARED (1,350kg)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickLog('NUTRITION', 'Mid-Sol Caloric Ration Pack', 'Standard 750 kcal spaceflight nutrient pack + 250ml fluid', { metrics: { calories: 750, volumeMl: 250 } })}
              className="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900/90 border border-amber-800/70 text-amber-300 font-mono text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Utensils className="w-3 h-3 text-amber-400" /> +750 kcal Ration
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickLog('MINDFULNESS', 'Respiration & Biofeedback', '15 min sympathetic downregulation breathwork', { durationMinutes: 15, metrics: { durationMinutes: 15 } })}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-800/70 text-indigo-300 font-mono text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Smile className="w-3 h-3 text-indigo-400" /> +15m Breathwork
            </motion.button>
          </div>
          <AnimatePresence>
            {quickLogSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.85, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 shrink-0 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 shadow-sm"
              >
                <CheckCircle2 className="w-3 h-3" /> {quickLogSuccess}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Messages Body with Framer Motion */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'ASTRONAUT';
              const actionButtons = extractActionButtons(msg.text + ' ' + (msg.response?.structuredBreakdown?.suggestedNextStep || ''));

              return (
                <motion.div
                  key={msg.id}
                  layout="position"
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.35, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl w-full sm:w-auto rounded-2xl p-4 shadow-md transition-shadow ${
                      isUser
                        ? 'bg-cyan-600 text-white rounded-tr-none shadow-cyan-900/20'
                        : 'bg-slate-950/95 border border-slate-800 text-slate-100 rounded-tl-none shadow-slate-950/50'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-white/10 text-[11px] font-mono opacity-80">
                      <span className="font-bold tracking-wider flex items-center gap-1.5">
                        {isUser ? (
                          <>ASTRONAUT • COMMANDER CHEN</>
                        ) : (
                          <>
                            <Bot className="w-3.5 h-3.5 text-cyan-400" />
                            ASTRA HEALTH INTELLIGENCE
                          </>
                        )}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Activity Auto-Log Notification Card with Motion */}
                    {msg.loggedActivity && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.28, delay: 0.08 }}
                        className="mb-3 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs font-mono shadow-inner"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ACTIVITY LOGGED TO MISSION TELEMETRY
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
                            Sol {missionContext.sol}
                          </span>
                        </div>
                        <div className="text-slate-200 mt-1">
                          <strong>{msg.loggedActivity.title}</strong>: {msg.loggedActivity.details}
                        </div>
                        {msg.loggedActivity.metrics && (
                          <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-emerald-400">
                            {msg.loggedActivity.metrics.durationMinutes && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-900/40 border border-emerald-700/40">
                                Duration: {msg.loggedActivity.metrics.durationMinutes} min
                              </span>
                            )}
                            {msg.loggedActivity.metrics.watts && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-900/40 border border-emerald-700/40">
                                Power: {msg.loggedActivity.metrics.watts} W
                              </span>
                            )}
                            {msg.loggedActivity.metrics.loadKg && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-900/40 border border-emerald-700/40">
                                Load: {msg.loggedActivity.metrics.loadKg} kg
                              </span>
                            )}
                            {msg.loggedActivity.metrics.volumeMl && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-900/40 border border-emerald-700/40">
                                Fluid: {msg.loggedActivity.metrics.volumeMl} ml
                              </span>
                            )}
                            {msg.loggedActivity.metrics.calories && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-900/40 border border-emerald-700/40">
                                Calories: {msg.loggedActivity.metrics.calories} kcal
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Structured Clinical Breakdown Rendering if Available */}
                    {!isUser && msg.response?.structuredBreakdown ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 font-sans text-xs sm:text-sm"
                      >
                        {/* OBSERVATION */}
                        <div>
                          <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
                            OBSERVATION
                          </div>
                          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {cleanActionTags(msg.response.structuredBreakdown.observation)}
                          </p>
                        </div>

                        {/* CONTEXT */}
                        <div>
                          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            CONTEXT & BASELINE
                          </div>
                          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {cleanActionTags(msg.response.structuredBreakdown.context)}
                          </p>
                        </div>

                        {/* CONTRIBUTING FACTORS */}
                        {msg.response.structuredBreakdown.possibleContributingFactors && msg.response.structuredBreakdown.possibleContributingFactors.length > 0 && (
                          <div>
                            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
                              POSSIBLE CONTRIBUTING FACTORS
                            </div>
                            <ul className="space-y-1 text-slate-300">
                              {msg.response.structuredBreakdown.possibleContributingFactors.map((f, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-amber-400">•</span>
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* SUGGESTED NEXT STEP */}
                        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3">
                          <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            SUGGESTED NEXT STEP
                          </div>
                          <p className="text-emerald-200 leading-relaxed whitespace-pre-wrap">
                            {cleanActionTags(msg.response.structuredBreakdown.suggestedNextStep)}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans"
                      >
                        {cleanActionTags(msg.text)}
                      </motion.div>
                    )}

                    {/* Interactive Action Pathways */}
                    {actionButtons.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.12 }}
                        className="mt-3 pt-2 border-t border-slate-800/80"
                      >
                        <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1.5">
                          Mission Action Pathways:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {actionButtons.map((btn, bIdx) => (
                            <motion.button
                              key={bIdx}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => {
                                if (btn.action === 'check-in' && onOpenCheckInModal) {
                                  onOpenCheckInModal();
                                } else if (onNavigateTab) {
                                  onNavigateTab(btn.tab);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <span>{btn.label}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Dynamic Suggested Follow-ups directly from AI */}
                    {!isUser && msg.response?.suggestedFollowUps && msg.response.suggestedFollowUps.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.18 }}
                        className="mt-3 pt-2 border-t border-slate-800/80"
                      >
                        <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" /> Interactive Follow-ups:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.response.suggestedFollowUps.map((fu, fuIdx) => (
                            <motion.button
                              key={fuIdx}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => handleSend(fu)}
                              className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-800/60 transition cursor-pointer shadow-xs"
                            >
                              {fu}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* DATA USED Transparency (Section 30) */}
                    {!isUser && (msg.response?.dataUsed || msg.dataUsed) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-cyan-400" />
                          <span>DATA USED:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(msg.response?.dataUsed || msg.dataUsed || []).map((source: string, sIdx: number) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300">
                              ● {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata Footer for ASTRA responses */}
                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          <span>{msg.response?.retrievedKnowledgeReferences?.[0] || 'NASA Spaceflight Medicine Standards'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{msg.response?.providerName || 'ASTRA Autonomous Engine'}</span>
                          {msg.response?.latencyMs && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {msg.response.latencyMs}ms
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prototype Safety Notice */}
                    {!isUser && (
                      <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span>Decision support prototype. Non-diagnostic. Follow CMO guidance.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Typing & Processing Wave Animation */}
            {isProcessing && (
              <motion.div
                key="typing-indicator"
                layout="position"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, y: 6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex justify-start"
              >
                <div className="rounded-2xl rounded-tl-none p-4 bg-slate-950/95 border border-slate-800 text-slate-200 font-mono text-xs shadow-lg flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {/* Animated Typing Dots */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-full border border-cyan-500/30">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full bg-cyan-400 shadow-cyan-400/50 shadow-sm"
                          animate={{
                            y: [0, -5, 0],
                            opacity: [0.35, 1, 0.35],
                            scale: [0.85, 1.15, 0.85],
                          }}
                          transition={{
                            duration: 0.85,
                            repeat: Infinity,
                            delay: i * 0.16,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-cyan-300 font-bold tracking-tight">
                      ASTRA Synthesizing Intelligence
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Analyzing telemetry stream against 14-day baseline ({activeAiSource})...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Carousel */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Suggested:
            </span>
            {SUGGESTED_ASTRONAUT_PROMPTS.map((prompt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input Form Box */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="astra-ai-input-field"
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask ASTRA anything or log an activity (e.g. 'Log 500ml water', 'How is my exercise today?')..."
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition font-sans"
            />
            <motion.button
              id="astra-ai-send-btn"
              type="submit"
              disabled={!inputQuestion.trim() || isProcessing}
              whileHover={{ scale: inputQuestion.trim() && !isProcessing ? 1.05 : 1 }}
              whileTap={{ scale: inputQuestion.trim() && !isProcessing ? 0.95 : 1 }}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition cursor-pointer shadow-md shrink-0"
              title="Send to ASTRA"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </div>
      </div>

      {/* Activity Tracker & Mission Operations Side Panel */}
      <AnimatePresence>
        {showActivityTracker && (
          <motion.div 
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full lg:w-80 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm p-4 overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Sol {missionContext.sol} Activity</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                Active Sync
              </span>
            </div>

            {/* Daily Summary Targets */}
            {dailyActivitySummary && (
              <div className="space-y-3 mb-4">
                {dailyActivitySummary.targets.map((tgt, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-slate-300 flex items-center gap-1.5">
                        {tgt.category === 'EXERCISE' && <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />}
                        {tgt.category === 'HYDRATION' && <Droplets className="w-3.5 h-3.5 text-blue-400" />}
                        {tgt.category === 'NUTRITION' && <Utensils className="w-3.5 h-3.5 text-amber-400" />}
                        {tgt.category === 'TASK' && <CheckSquare className="w-3.5 h-3.5 text-purple-400" />}
                        {tgt.label}
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {tgt.currentValue} / {tgt.targetValue} {tgt.unit}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full ${
                          tgt.percentage >= 100 
                            ? 'bg-emerald-400' 
                            : tgt.percentage >= 50 
                            ? 'bg-cyan-400' 
                            : 'bg-amber-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, tgt.percentage)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recent Activity Log Stream */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                  Logged Activities ({activities.length})
                </span>
                <button
                  onClick={() => handleSend('What activities have I completed today on Sol ' + missionContext.sol + '?')}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                >
                  Summarize in AI →
                </button>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
                {activities.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono">
                    No activities logged yet for Sol {missionContext.sol}.
                    <div className="mt-1 text-cyan-400">
                      Use quick buttons above or tell ASTRA in chat!
                    </div>
                  </div>
                ) : (
                  activities.slice(0, 8).map((act, actIdx) => (
                    <motion.div 
                      key={act.id} 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: actIdx * 0.04 }}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-slate-200 flex items-center gap-1.5">
                          {act.category === 'EXERCISE' && <Dumbbell className="w-3 h-3 text-cyan-400" />}
                          {act.category === 'HYDRATION' && <Droplets className="w-3 h-3 text-blue-400" />}
                          {act.category === 'NUTRITION' && <Utensils className="w-3 h-3 text-amber-400" />}
                          {act.category === 'TASK' && <CheckSquare className="w-3 h-3 text-purple-400" />}
                          {act.category === 'MINDFULNESS' && <Smile className="w-3 h-3 text-indigo-400" />}
                          {act.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-2">
                        {act.details}
                      </p>
                      {onDeleteActivity && (
                        <div className="mt-1.5 flex justify-end">
                          <button
                            onClick={() => onDeleteActivity(act.id)}
                            className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition cursor-pointer"
                            title="Delete Activity"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
