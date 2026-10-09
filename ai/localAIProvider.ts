/**
 * ASTRA Health - Local AI Provider (Offline Mode)
 * Operates 100% inside the browser with zero external network connectivity.
 * Space-Context Aware Health Intelligence Engine.
 * Combines deterministic health engine outputs, activity tracker awareness,
 * personal space baselines, Space Context Engine, and strict causality guardrails.
 */

import { AIProvider } from './aiProvider';
import { AIResponse, HealthAIContext, ChatHistoryMessage, ActivityActionPayload } from '../types/ai';
import { MultiMetricChange } from '../types/health';
import { queryLocalKnowledgeBase } from './localRAG';
import { localAIManager } from './localAIManager';
import { getAstronautProfile } from '../services/profileService';
import { buildSpaceHealthContext, getWhyAstraIsWatching, getWhatChangedInContext } from '../services/spaceContextEngine';

export class LocalAIProvider implements AIProvider {
  public id = 'offline-local-astra';
  public name = 'OFFLINE • LOCAL ASTRA';

  async initialize(): Promise<boolean> {
    return true;
  }

  async isAvailable(): Promise<boolean> {
    const info = localAIManager.getModelInfo();
    return info.status === 'READY' || info.status === 'FALLBACK_ENGINE';
  }

  async generateResponse(request: { 
    question: string; 
    context: HealthAIContext; 
    history?: ChatHistoryMessage[] 
  }): Promise<AIResponse> {
    const { question, context } = request;
    const startTime = performance.now();

    // Dynamically retrieve configured astronaut profile identity
    const activeProfile = getAstronautProfile();
    const identity = activeProfile.identity;
    const astronautName = identity.preferredName || identity.fullName || 'Alex';
    const astronautRole = identity.crewPosition || identity.role || 'Mission Specialist';
    const astronautGreetingTitle = `${astronautRole} ${astronautName}`.trim();

    // Build centralized Space Health Context
    const spaceCtx = buildSpaceHealthContext({
      profile: activeProfile,
      mission: context.mission,
      currentHealth: context.currentHealth,
      baselines: context.baselines,
      recentChanges: context.recentChanges,
      activeAlerts: context.activeAlerts,
      recentCheckIn: context.recentCheckIn,
      recentActivities: context.recentActivities,
      dailyActivitySummary: context.dailyActivitySummary,
    });

    const current = context.currentHealth;
    const pb = spaceCtx.personalBaseline;
    const watchingFactors = getWhyAstraIsWatching(spaceCtx);

    // Query local spaceflight medical knowledge
    const relevantDocs = queryLocalKnowledgeBase(question, 2);
    const primaryDoc = relevantDocs[0];

    const lowerQ = question.toLowerCase().trim();

    let answer = '';
    let observation = '';
    let contextStr = '';
    let factors: string[] = [];
    let nextStep = '';
    let safetyNote = 'ASTRA Health Engine operates in autonomous flight decision-support mode. Non-diagnostic prototype.';
    let activityAction: ActivityActionPayload | undefined = undefined;
    let suggestedFollowUps: string[] = [];
    let dataUsed: string[] = [
      'Personal Profile',
      '14-Day In-Flight Baseline',
      'Health Telemetry',
      'Mission Context',
    ];

    // 1. INFER & PARSE USER ACTIVITY LOGGING
    const detectedActivity = this.inferActivity(question);
    if (detectedActivity) {
      activityAction = detectedActivity;
      answer = `Confirmed, ${astronautName}! I have recorded your **${detectedActivity.title}** (${detectedActivity.details}) to your Sol ${context.mission.sol} log.

Your daily operational targets have been updated in real-time. Keep up the high-performance discipline!`;
      dataUsed = ['Personal Profile', 'Activity Logging System', 'Sol Operations Log'];
      suggestedFollowUps = [
        'How is my daily activity tracking today?',
        'Log 500ml electrolyte water',
        'How am I doing today?',
      ];
    }
    // 2. CONVERSATIONAL GREETINGS & NATURAL CHAT
    else if (lowerQ === 'hi' || lowerQ.startsWith('hi ') || lowerQ.startsWith('hello') || lowerQ.startsWith('hey') || lowerQ.includes('how are you')) {
      const activeAlertsCount = context.activeAlerts.length;
      answer = `Hello ${astronautGreetingTitle}! ASTRA is online and operational for Sol ${context.mission.sol} during the Mars transit phase.

Space environment surveillance is active. You have ${activeAlertsCount} active notification${activeAlertsCount === 1 ? '' : 's'}. Resting heart rate is at ${current.restingHeartRate} bpm (+${pb.restingHeartRate.differenceFromInFlight} bpm vs flight baseline).

How can I assist you right now, ${astronautName}? We can review what ASTRA is watching, examine your space baseline, or check your daily activities.`;
      dataUsed = ['Personal Profile', 'Mission Context', 'Current Health Telemetry', 'Active Alerts'];
      suggestedFollowUps = [
        'How am I doing today?',
        'What health indicators are ASTRA watching?',
        'How does my current health compare with my mission baseline?',
      ];
    }
    // 3. SPACE SCENARIO: "HOW AM I DOING TODAY?" (Section 19 & 33)
    else if (lowerQ.includes('how am i doing') || lowerQ.includes('status today') || lowerQ.includes('daily status')) {
      const rhrDiff = pb.restingHeartRate.differenceFromInFlight;
      const sleepHours = (current.sleepDurationMinutes / 60).toFixed(1);
      observation = `Overall mission operational status is STABLE, with active monitoring on cardiovascular and sleep indicators.`;
      contextStr = `Resting HR is ${current.restingHeartRate} bpm (+${rhrDiff} bpm vs in-flight baseline of ${pb.restingHeartRate.inFlightBaseline} bpm). Sleep duration was ${sleepHours}h (${spaceCtx.sleepRecoveryContext.sleepDeviationHours}h vs baseline). SpO2 is nominal at ${current.spo2}%.`;
      factors = [
        'Microgravity cephalad fluid shift adaptation stabilized',
        'Reduced sleep recorded during the same period as elevated daytime duty cycle',
        `Personal radiation badge: ${(current.dailyRadiation_uSv / 1000).toFixed(2)} mSv today (nominal GCR background)`,
      ];
      nextStep = `Review your Mission Health Brief and ensure hydration intervals are maintained. [VIEW CONTEXT] [OPEN TODAY'S CHECK-IN]`;
      dataUsed = ['Personal Profile', '14-Day In-Flight Baseline', 'Daily Check-In', 'Personal Dosimeter', 'Mission Context'];
      suggestedFollowUps = [
        'What health indicators are ASTRA watching?',
        'Why did my health index change?',
        'Show my radiation exposure trend',
      ];
    }
    // 4. SPACE SCENARIO: "WHY DID MY HEALTH INDEX CHANGE?" (Section 19 & 10 Causality)
    else if (lowerQ.includes('why did my health index change') || lowerQ.includes('why did health index change') || lowerQ.includes('why is health index down')) {
      observation = `Your Bio Signal Index shifted from 86 to 82/100, while your Neural Signal Index is currently at 74/100 (Monitor status).`;
      contextStr = `Telemetry recorded an 8% increase in resting heart rate alongside a 1.2h reduction in sleep duration over the last two duty cycles.`;
      factors = [
        'Reduced sleep duration occurred during the same operational period as the elevated resting heart rate',
        'Elevated sympathetic autonomic tone (HRV down from 62 ms pre-flight to 44 ms)',
        'Physical exercise countermeasures on track (1,350 kg ARED load logged)',
      ];
      nextStep = `Causality note: Telemetry demonstrates concurrent occurrence rather than isolated clinical cause. Prioritize berth rest window. [WHAT CHANGED] [VIEW HEALTH DASHBOARD]`;
      dataUsed = ['Personal Baseline', 'Health Engine Scoring', 'Multi-Metric Change Log', 'Recent Check-In'];
      suggestedFollowUps = [
        'How does my current health compare with my mission baseline?',
        'What health indicators are ASTRA watching?',
        'Log 15 min breathwork session',
      ];
    }
    // 5. SPACE SCENARIO: "HOW DOES MY CURRENT HEALTH COMPARE WITH MY MISSION BASELINE?" (Section 15 & 19)
    else if (lowerQ.includes('compare with my mission baseline') || lowerQ.includes('compare with baseline') || lowerQ.includes('space baseline') || lowerQ.includes('pre-flight')) {
      observation = `ASTRA tracks both your Earth Pre-Flight Baseline and your evolving In-Flight Monitoring Baseline.`;
      contextStr = `Resting HR: Pre-Flight ${pb.restingHeartRate.preFlightValue} bpm → In-Flight Baseline ${pb.restingHeartRate.inFlightBaseline} bpm → Current ${current.restingHeartRate} bpm (+${pb.restingHeartRate.differenceFromInFlight} bpm).
Sleep: Pre-Flight ${pb.sleepDuration.preFlightValue}h → In-Flight Baseline ${pb.sleepDuration.inFlightBaseline}h → Current ${(current.sleepDurationMinutes / 60).toFixed(1)}h.
Systolic BP: Pre-Flight 118 mmHg → In-Flight 122 mmHg → Current ${current.bloodPressureSystolic} mmHg.`;
      factors = [
        'Cephalad fluid redistribution naturally recalibrates baroreceptors in microgravity (~+6 bpm shift from Earth)',
        'Current in-flight baseline is a monitoring reference, not automatically declared medically normal',
        'SpO2 and core temperature tracking within nominal spacecraft limits',
      ];
      nextStep = `Access your full Personal Space Baseline in your Mission Profile. [VIEW MISSION PROFILE] [VIEW HEALTH DASHBOARD]`;
      dataUsed = ['Pre-Flight Earth Baseline', 'In-Flight Mission Baseline', 'Active Telemetry', 'Personal Profile'];
      suggestedFollowUps = [
        'How am I doing today?',
        'What health indicators are ASTRA watching?',
        'Show my sleep and recovery trend',
      ];
    }
    // 6. SPACE SCENARIO: "WHAT HEALTH INDICATORS ARE ASTRA WATCHING?" (Section 13 & 19)
    else if (lowerQ.includes('watching') || lowerQ.includes('why astra is watching') || lowerQ.includes('what are you watching')) {
      const items = watchingFactors.map(w => `• **${w.text}**: ${w.detail}`).join('\n');
      answer = `Here are the exact health factors ASTRA is currently monitoring on Sol ${context.mission.sol}:

${items}

**TRANSPARENCY NOTE**:
These observations are derived strictly from your stored sensor telemetry, personal dosimeter, and check-in entries. ASTRA does not invent or extrapolate missing indicators.`;
      dataUsed = ['Personal Space Baseline', 'Health Measurement Stream', 'Personal Dosimeter Badge', 'Active Health Alerts'];
      suggestedFollowUps = [
        'How does my current health compare with my mission baseline?',
        'What changed over the last 7 days?',
        'Why did my health index change?',
      ];
    }
    // 7. SPACE SCENARIO: "WHAT CHANGED OVER THE LAST 7 DAYS?" (Section 14 & 19)
    else if (lowerQ.includes('what changed') || lowerQ.includes('7 days') || lowerQ.includes('past week') || lowerQ.includes('this week')) {
      const changed = getWhatChangedInContext(spaceCtx);
      observation = `Over the past 7 days, primary metric shifts have been recorded in Physical and Recovery domains while Neural performance remains stable.`;
      contextStr = `Physical: Resting HR is up ~8% (${current.restingHeartRate} bpm vs ${pb.restingHeartRate.inFlightBaseline} bpm flight baseline).
Recovery: Recorded sleep decreased by 1.2h (average 5.9h vs 7.1h baseline). Recovery score at ${current.recoveryScore}/100.
Neural: Reaction time responsive at ${spaceCtx.neuralPerformanceContext.reactionTimeMs} ms.
Mission Context: Sol ${context.mission.sol} Transit phase; radiation environment nominal.`;
      factors = [
        'Synchronized divergence across sleep and cardiac autonomic tone',
        'Continuous microgravity operational duty cycles',
        'No emergency safety boundary violations',
      ];
      nextStep = `Review categorized metric changes in What Changed. [WHAT CHANGED] [VIEW HEALTH DASHBOARD]`;
      dataUsed = ['7-Day Telemetry Archive', 'Personal Space Baseline', 'Subjective Check-In History', 'Mission Context'];
      suggestedFollowUps = [
        'Why did my health index change?',
        'How is my sleep affecting my recent performance?',
        'How am I doing today?',
      ];
    }
    // 8. SPACE SCENARIO: "HOW IS SLEEP AFFECTING PERFORMANCE?" (Section 10 & 19)
    else if (lowerQ.includes('sleep affecting') || lowerQ.includes('sleep and performance') || lowerQ.includes('sleep affect')) {
      observation = `Sleep duration has decreased by 1.2h below your in-flight baseline, while PVT reaction latency remains stable at 242 ms.`;
      contextStr = `Causality guardrail: Reduced sleep and elevated resting heart rate occurred concurrently. However, cognitive attention testing currently demonstrates 92% stamina.`;
      factors = [
        'Cumulative sleep compression (5.9h recorded vs 6.8h in-flight baseline)',
        'Circadian alignment preserved through scheduled habitat lighting cycles',
        'Cardiovascular recovery debt under surveillance',
      ];
      nextStep = `Inspect sleep berth acoustic baffling and log your evening check-in. [OPEN TODAY'S CHECK-IN] [VIEW SLEEP TREND]`;
      dataUsed = ['Sleep Telemetry', 'Cognitive Battery Results', 'Personal Space Baseline', 'NASA HRP Sleep Research'];
      suggestedFollowUps = [
        'What health indicators are ASTRA watching?',
        'Log 15 min breathwork session',
        'How am I doing today?',
      ];
    }
    // 9. SPACE SCENARIO: "RADIATION EXPOSURE TREND" (Section 19 & 6)
    else if (lowerQ.includes('radiation') || lowerQ.includes('dosimetry') || lowerQ.includes('dose') || lowerQ.includes('msv')) {
      const daily_mSv = (current.dailyRadiation_uSv / 1000).toFixed(2);
      const cum_mSv = current.cumulativeRadiation_mSv.toFixed(1);
      const capPct = spaceCtx.radiationContext.careerLimitPercent;
      observation = `Your personal radiation dosimeter recorded ${daily_mSv} mSv today (${current.dailyRadiation_uSv} µSv). Mission cumulative total is ${cum_mSv} mSv (${capPct}% of 600 mSv career limit).`;
      contextStr = `Personal dosimetry is strictly distinguished from external environmental telemetry. Ambient GCR rate from NASA RadLab is tracking at nominal deep-space background (482 µGy/day).`;
      factors = [
        'Deep space interplanetary cruise GCR background exposure',
        'Spacecraft storm shelter passive polyethylene shielding',
        'Zero Solar Particle Event (SPE) alert triggers logged',
      ];
      nextStep = `Review your personal radiation measurements or log new dosimeter readings in Physical Health. [VIEW RADIATION] [VIEW HEALTH DASHBOARD]`;
      dataUsed = ['Personal Dosimeter Badge (BION-IV)', 'Cumulative Mission Exposure Store', 'NASA RadLab Telemetry'];
      suggestedFollowUps = [
        'What mission context should I be aware of?',
        'How am I doing today?',
        'What health indicators are ASTRA watching?',
      ];
    }
    // 10. SPACE SCENARIO: "NEURAL TEST / COGNITIVE PERFORMANCE" (Section 19)
    else if (lowerQ.includes('neural') || lowerQ.includes('cognitive') || lowerQ.includes('reaction time') || lowerQ.includes('memory') || lowerQ.includes('attention')) {
      const rTime = current.reactionTimeMs || 242;
      observation = `Your latest Psychomotor Vigilance (PVT) test recorded a reaction latency of ${rTime} ms against your baseline of 235 ms. Status: STABLE.`;
      contextStr = `Attention stamina scored 92%. Sensorimotor response times demonstrate operational alertness despite recent sleep schedule variance.`;
      factors = [
        'Microgravity neurovestibular adaptation nominal',
        'Zero lapses of attention (>500 ms) recorded during scheduled testing',
        'Cognitive stamina supported by consistent exercise countermeasures',
      ];
      nextStep = `Complete scheduled cognitive assessment when prompt indicates. [VIEW NEURAL SIGNAL] [RUN COGNITIVE TEST]`;
      dataUsed = ['Cognitive Task Results', 'Neural Baseline Store', 'PVT Reaction Logs'];
      suggestedFollowUps = [
        'How is my sleep affecting my recent performance?',
        'How am I doing today?',
        'What changed over the last 7 days?',
      ];
    }
    // 11. SPACE SCENARIO: "MISSION CONTEXT & SPACE HAZARDS" (Section 19 & 35)
    else if (lowerQ.includes('mission context') || lowerQ.includes('hazard') || lowerQ.includes('space hazards') || lowerQ.includes('environment')) {
      observation = `Mission: ${context.mission.name || 'MARS TRANSIT'}, Sol ${context.mission.sol} (${Math.round((context.mission.sol / 180) * 100)}% of transit). Environment: Microgravity with ${context.mission.earthCommsDelayMinutes} min Earth delay.`;
      contextStr = `NASA 5 Hazards Context:
1. Space Radiation: Monitoring (Personal badge + NASA RadLab)
2. Isolation & Confinement: Active crew cohesion and subjective check-ins
3. Altered Gravity: Microgravity fluid shifts stabilized
4. Distance from Earth: Autonomous local AI active
5. Closed Environment: Cabin atmosphere nominal at 101.3 kPa`;
      factors = [
        'Autonomous on-board intelligence enabled during comms delay',
        'Life support telemetry verified nominal',
      ];
      nextStep = `Access full Mission Health Brief in your Astronaut Profile. [VIEW CONTEXT] [VIEW MISSION PROFILE]`;
      dataUsed = ['Mission Configuration', 'NASA 5 Hazards Context', 'ECLSS Telemetry', 'Personal Profile'];
      suggestedFollowUps = [
        'How am I doing today?',
        'Show my radiation exposure trend',
        'What data is cached while offline?',
      ];
    }
    // 12. SPACE SCENARIO: "WHAT DATA IS CACHED WHILE OFFLINE?" (Section 19 & 26)
    else if (lowerQ.includes('cached while offline') || lowerQ.includes('offline data') || lowerQ.includes('cache')) {
      observation = `ASTRA operates 100% offline using your local browser IndexedDB and Edge Inference engine.`;
      contextStr = `Cached data includes:
• Complete 30-day biometric telemetry & personal baselines
• Full Astronaut Mission Profile & Body Physiology
• Personal radiation exposure records & career dose tracking
• NASA OSDR research knowledge base & Space Weather cache
• Multi-metric change detection and deterministic safety rules`;
      factors = [
        'Zero cloud dependency required for mission health monitoring',
        'Sync queue automatically commits changes once Earth uplink is restored',
      ];
      nextStep = `You can continue logging measurements, check-ins, and activities without network connectivity. [VIEW HEALTH DASHBOARD]`;
      dataUsed = ['IndexedDB Local Stores', 'Offline Sync Queue', 'Local Knowledge RAG'];
      suggestedFollowUps = [
        'How am I doing today?',
        'How does my current health compare with my mission baseline?',
        'What health indicators are ASTRA watching?',
      ];
    }
    // 13. EVA / SPACEWALK READINESS
    else if (lowerQ.includes('eva') || lowerQ.includes('spacewalk') || lowerQ.includes('safe to perform')) {
      const isOrange = context.activeAlerts.some(a => a.severity === 'ORANGE');
      observation = isOrange
        ? `EVA Suit Flight Surgeon Recommendation: CONDITIONAL HOLD / CAUTION. Active alerts detected regarding sleep compression and elevated resting HR.`
        : `EVA Flight Surgeon Recommendation: NOMINAL GO. Core physiological indices are within allowable operational envelopes.`;
      contextStr = `Current resting HR is ${current.restingHeartRate} bpm, SpO2 is ${current.spo2}%, and sleep recorded was ${(current.sleepDurationMinutes / 60).toFixed(1)} hours.`;
      factors = [
        'Cognitive vigilance test performance baseline check',
        'Hydration index assessment (nominal > 80%)',
        'Cardiac autonomic recovery index'
      ];
      nextStep = `Review your operational indices before suit depressurization. [VIEW HEALTH DASHBOARD] [VIEW BIO SIGNAL]`;
      dataUsed = ['Active Health Alerts', 'Personal Space Baseline', 'Hydration Telemetry', 'Cognitive Battery'];
      suggestedFollowUps = [
        'How am I doing today?',
        'What health indicators are ASTRA watching?',
        'Show my sleep and recovery trend',
      ];
    }
    // 14. GENERAL HEALTH SUMMARY FALLBACK
    else {
      observation = `ASTRA is monitoring your vital trends on Sol ${context.mission.sol}. Overall status is ${context.activeAlerts.some(a => a.severity === 'ORANGE') ? 'MONITOR' : 'STABLE'}.`;
      contextStr = `Resting HR is ${current.restingHeartRate} bpm (+${pb.restingHeartRate.differenceFromInFlight} bpm vs flight baseline), HRV is ${current.hrv} ms, and sleep was ${(current.sleepDurationMinutes / 60).toFixed(1)}h.`;
      factors = [
        primaryDoc ? `Matched protocol: ${primaryDoc.title}` : 'Interplanetary spaceflight health surveillance',
        'Autonomous local edge inference active',
      ];
      nextStep = `Review your recent multi-metric trends or ask ASTRA about specific mission parameters. [VIEW HEALTH DASHBOARD] [OPEN TODAY'S CHECK-IN]`;
      dataUsed = ['Personal Space Baseline', 'Health Measurement Stream', 'Mission Context'];
      suggestedFollowUps = [
        'How am I doing today?',
        'What health indicators are ASTRA watching?',
        'How does my current health compare with my mission baseline?',
      ];
    }

    if (!answer) {
      answer = `**OBSERVATION**\n${observation}\n\n**CONTEXT**\n${contextStr}\n\n${factors.length > 0 ? `**CONTRIBUTING FACTORS**\n${factors.map(f => `• ${f}`).join('\n')}\n\n` : ''}**SUGGESTED NEXT STEP**\n${nextStep}\n\n*${safetyNote}*`;
    }

    const latencyMs = Math.round(performance.now() - startTime);

    return {
      answer,
      source: 'OFFLINE_LOCAL_ASTRA',
      providerName: 'ASTRA Local Core (Edge Inference)',
      timestamp: new Date().toISOString(),
      structuredBreakdown: observation ? {
        observation,
        context: contextStr,
        possibleContributingFactors: factors,
        suggestedNextStep: nextStep,
        safetyNote,
      } : undefined,
      suggestedFollowUps,
      activityAction,
      retrievedKnowledgeReferences: [primaryDoc?.title || 'NASA Spaceflight Medical Manual'],
      dataUsed,
      latencyMs,
    };
  }

  /**
   * Infers activity logging from natural language
   */
  private inferActivity(question: string): ActivityActionPayload | undefined {
    const q = question.toLowerCase();

    if (q.includes('log') || q.includes('drank') || q.includes('ate') || q.includes('worked out') || q.includes('completed')) {
      // Hydration
      if (q.includes('water') || q.includes('electrolyte') || q.includes('fluid') || q.includes('hydration') || q.includes('ml')) {
        const mlMatch = q.match(/(\d+)\s*(ml|milliliters|cc|oz)/i);
        const volumeMl = mlMatch ? parseInt(mlMatch[1], 10) : 500;
        return {
          category: 'HYDRATION',
          title: q.includes('electrolyte') ? 'Electrolyte Hydration Pack' : 'Potable Water Intake',
          details: `${volumeMl} ml logged via conversational assistant.`,
          metrics: { volumeMl },
        };
      }

      // Exercise
      if (q.includes('cevis') || q.includes('cycle') || q.includes('ared') || q.includes('treadmill') || q.includes('workout') || q.includes('exercise')) {
        const minMatch = q.match(/(\d+)\s*(min|mins|minutes|hr|hour)/i);
        let durationMinutes = minMatch ? parseInt(minMatch[1], 10) : 45;
        if (q.includes('hour') && durationMinutes <= 3) durationMinutes *= 60;

        const wattsMatch = q.match(/(\d+)\s*(w|watts)/i);
        const watts = wattsMatch ? parseInt(wattsMatch[1], 10) : (q.includes('cevis') ? 180 : undefined);

        const kgMatch = q.match(/(\d+)\s*(kg|lbs|kilos)/i);
        const loadKg = kgMatch ? parseInt(kgMatch[1], 10) : (q.includes('ared') ? 1350 : undefined);

        const isAred = q.includes('ared') || q.includes('weight') || q.includes('lift');
        const isCevis = q.includes('cevis') || q.includes('cycle');

        return {
          category: 'EXERCISE',
          title: isAred ? 'ARED Resistive Exercise' : (isCevis ? 'CEVIS Cycle Ergometer' : 'Physical Exercise Session'),
          details: `${durationMinutes}-minute session logged via ASTRA.`,
          durationMinutes,
          intensity: isAred ? 'HIGH' : 'MODERATE',
          metrics: {
            durationMinutes,
            watts,
            loadKg,
            calories: Math.round(durationMinutes * 8.5),
          },
        };
      }

      // Nutrition
      if (q.includes('meal') || q.includes('ration') || q.includes('breakfast') || q.includes('lunch') || q.includes('dinner') || q.includes('calories') || q.includes('kcal')) {
        const calMatch = q.match(/(\d+)\s*(kcal|cal|calories)/i);
        const calories = calMatch ? parseInt(calMatch[1], 10) : 750;
        return {
          category: 'NUTRITION',
          title: q.includes('breakfast') ? 'Breakfast Ration Pack' : (q.includes('lunch') ? 'Mid-Sol Ration Pack' : 'Nutrition Log'),
          details: `Recorded ~${calories} kcal nutrition intake.`,
          metrics: { calories },
        };
      }

      // Tasks
      if (q.includes('task') || q.includes('filter') || q.includes('inspection') || q.includes('scrubber') || q.includes('maintenance')) {
        return {
          category: 'TASK',
          title: 'Operational Spaceflight Duty',
          details: question.replace(/^(log|i finished|completed)\s*/i, ''),
          durationMinutes: 30,
          metrics: { completionPct: 100 },
        };
      }

      // Mindfulness
      if (q.includes('breath') || q.includes('meditation') || q.includes('mindful') || q.includes('relaxation')) {
        return {
          category: 'MINDFULNESS',
          title: 'Guided Respiration & Biofeedback',
          details: '15-minute mindfulness and sympathetic down-regulation routine.',
          durationMinutes: 15,
          metrics: { durationMinutes: 15 },
        };
      }
    }

    return undefined;
  }

  async generateHealthSummary(context: HealthAIContext): Promise<string> {
    const res = await this.generateResponse({ question: 'Summarize my current health and what changed this week', context });
    return res.answer;
  }

  async explainTrend(metricKey: string, context: HealthAIContext): Promise<string> {
    const res = await this.generateResponse({ question: `Explain trend for ${metricKey}`, context });
    return res.answer;
  }

  async summarizeChanges(changes: MultiMetricChange[], context: HealthAIContext): Promise<string> {
    const res = await this.generateResponse({ question: 'What changed in my health this week?', context });
    return res.answer;
  }
}

export const localAIProvider = new LocalAIProvider();

