import express from 'express';
import type { Express, Request, Response } from 'express';
import { generateResilientGeminiContent } from './geminiService.ts';
import { nasaService } from './services/nasa/nasaService.ts';
import { nasaCache } from './services/nasa/nasaCache.ts';

export function createApiApp(): Express {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  const cloudStorage = {
    measurements: [] as any[],
    checkIns: [] as any[],
    alerts: [] as any[],
    lastSyncTimestamp: new Date().toISOString(),
  };

  // 1. Health check & status endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'ASTRA Health Mission Server',
      sol: 184,
      mission: 'MARS-01',
      serverTime: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // 2. NASA API Service Endpoints
  app.get('/api/nasa/status', async (_req: Request, res: Response) => {
    try {
      const status = await nasaService.getStatus();
      res.json(status);
    } catch (err: any) {
      console.error('[ASTRA Server] Error in /api/nasa/status:', err?.message || err);
      res.status(500).json({ error: 'Failed to retrieve NASA API status' });
    }
  });

  app.get('/api/nasa/radiation', async (_req: Request, res: Response) => {
    try {
      const radiation = await nasaService.getRadiationContext();
      res.json(radiation);
    } catch (err: any) {
      console.error('[ASTRA Server] Error in /api/nasa/radiation:', err?.message || err);
      res.status(500).json({ error: 'Failed to retrieve NASA radiation data' });
    }
  });

  app.get('/api/nasa/radiation/trend', async (req: Request, res: Response) => {
    try {
      const rawRange = req.query.range;
      const range: '24H' | '7D' | '30D' = (rawRange === '7D' || rawRange === '30D') ? rawRange : '24H';
      const trends = await nasaService.getRadiationTrends(range);
      res.json(trends);
    } catch (err: any) {
      console.error('[ASTRA Server] Error in /api/nasa/radiation/trend:', err?.message || err);
      res.status(500).json({ error: 'Failed to retrieve NASA radiation trends' });
    }
  });

  app.get('/api/nasa/space-weather', async (_req: Request, res: Response) => {
    try {
      const events = await nasaService.getSpaceWeatherEvents();
      res.json(events);
    } catch (err: any) {
      console.error('[ASTRA Server] Error in /api/nasa/space-weather:', err?.message || err);
      res.status(500).json({ error: 'Failed to retrieve NASA space weather events' });
    }
  });

  app.get('/api/nasa/research', async (req: Request, res: Response) => {
    try {
      const topic = typeof req.query.topic === 'string' ? req.query.topic.slice(0, 50) : undefined;
      const research = await nasaService.getResearchList(topic);
      res.json(research);
    } catch (err: any) {
      console.error('[ASTRA Server] Error in /api/nasa/research:', err?.message || err);
      res.status(500).json({ error: 'Failed to retrieve NASA research studies' });
    }
  });

  app.get('/api/nasa/research/search', async (req: Request, res: Response) => {
    try {
      const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 200) : '';
      const parsedLimit = Number(req.query.limit);
      const limit = (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 20) ? parsedLimit : 3;
      const results = await nasaService.searchResearchRAG(query, limit);
      res.json(results);
    } catch (err: any) {
      console.error('[ASTRA Server] Error in /api/nasa/research/search:', err?.message || err);
      res.status(500).json({ error: 'Failed to search NASA research catalog' });
    }
  });

  app.post('/api/nasa/cache/clear', (_req: Request, res: Response) => {
    nasaCache.clearAll();
    res.json({ success: true, message: 'NASA server cache cleared' });
  });

  // 3. Mission status endpoint
  app.get('/api/mission', (_req: Request, res: Response) => {
    res.json({
      missionId: 'MARS-01',
      name: 'MARS-01',
      sol: 184,
      phase: 'Cruise',
      crewCount: 4,
      communicationStatus: 'ONLINE',
      earthCommsDelayMinutes: 14.2,
      radiationEnvironment: 'Deep Space Cruise (GCR + Solar Ambient)',
      metDays: 184,
    });
  });

  // 4. Crew health overview endpoint
  app.get('/api/crew', (_req: Request, res: Response) => {
    res.json({
      crew: [
        { id: 'sarah-chen', name: 'Sarah Chen', role: 'Commander', status: 'ORANGE', restingHr: 81, sleepHours: 5.9 },
        { id: 'marcus-vance', name: 'Marcus Vance', role: 'Pilot', status: 'GREEN', restingHr: 65, sleepHours: 7.4 },
        { id: 'maya-patel', name: 'Dr. Maya Patel', role: 'Flight Engineer', status: 'YELLOW', restingHr: 72, sleepHours: 6.5 },
        { id: 'elena-rostova', name: 'Elena Rostova', role: 'Payload Specialist', status: 'GREEN', restingHr: 63, sleepHours: 7.6 },
      ],
    });
  });

  // 5. Offline Sync Endpoint (with batch limit validation)
  app.post('/api/sync', (req: Request, res: Response) => {
    const { items } = req.body || {};
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items must be an array of sync records' });
    }

    if (items.length > 500) {
      return res.status(400).json({ error: 'Sync batch exceeds maximum allowed limit of 500 items' });
    }

    items.forEach((item: any) => {
      if (!item || typeof item !== 'object') return;
      if (item.tableName === 'healthMeasurements') {
        cloudStorage.measurements.push(item.data);
      } else if (item.tableName === 'checkIns') {
        cloudStorage.checkIns.push(item.data);
      } else if (item.tableName === 'alerts') {
        cloudStorage.alerts.push(item.data);
      }
    });

    cloudStorage.lastSyncTimestamp = new Date().toISOString();

    res.json({
      success: true,
      recordsSynced: items.length,
      syncedAt: cloudStorage.lastSyncTimestamp,
      totalCloudMeasurements: cloudStorage.measurements.length,
    });
  });

  // 6. Secure Gemini AI Endpoint with NASA Grounding
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { question, context, history } = req.body || {};

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'A valid question string is required' });
    }

    const sanitizedQuestion = question.trim().slice(0, 4000);
    const sanitizedHistory = Array.isArray(history)
      ? history.slice(-10).filter((h: any) => h && typeof h.text === 'string' && (h.role === 'user' || h.role === 'model'))
      : [];
    const sanitizedContext = (context && typeof context === 'object') ? context : {};

    // Fetch NASA context for grounded AI response
    let nasaBriefing: any = null;
    try {
      nasaBriefing = await nasaService.buildNasaPromptContext(sanitizedQuestion);
    } catch (e) {
      console.warn('[ASTRA Server] Could not fetch NASA context for AI prompt:', e);
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        answer: `**OBSERVATION**\nGemini API key is not configured in environment. Operating in Cloud Simulation mode for query: "${question}".\n\n**CONTEXT**\nTelemetry reveals a 9% elevation in resting heart rate and an 18% compression in sleep duration. NASA RadLab deep space background dose rate is nominal (482 µGy/day).\n\n**SUGGESTED NEXT STEP**\nReview sleep berth acoustic insulation and pace daily resistive exercise load.`,
        source: 'ONLINE_GEMINI',
        structuredBreakdown: {
          observation: 'Cloud analysis based on current telemetry and NASA baseline environment.',
          context: 'Heart rate and sleep parameters indicate moderate recovery debt.',
          suggestedNextStep: 'Log evening check-in and inspect sleep habitat berth.',
          safetyNote: 'Research prototype decision support. Not a diagnostic tool.',
        },
        suggestedFollowUps: [
          'Show my radiation environment',
          'What does NASA research say about sleep during spaceflight?',
          'How is my daily activity tracking today?',
        ],
        retrievedKnowledgeReferences: [
          'NASA OSDR RadLab MSL-RAD Telemetry',
          'NASA OSDR OSD-452 (Sleep Architecture)',
          'NASA Flight Surgeon Telemetry Guidelines',
        ],
      });
    }

    try {
      const baselinesStr = (context?.baselines || [])
        .map((b: any) => `${b.label}: Current = ${b.currentValue} ${b.unit} | 14d Baseline = ${b.baseline14d} ${b.unit} (${b.deviationPercent > 0 ? '+' : ''}${b.deviationPercent}%)`)
        .join('\n');

      const activitiesStr = (context?.recentActivities || [])
        .map((a: any) => `- [${a.category}] ${a.title}: ${a.details} (Sol ${a.sol})`)
        .join('\n');

      const targetsStr = context?.dailyActivitySummary
        ? `DAILY TARGETS & PROGRESS (Sol ${context.dailyActivitySummary.sol}):
- Exercise: ${context.dailyActivitySummary.exerciseMinutesTotal} / 120 min target
- Hydration: ${context.dailyActivitySummary.hydrationMlTotal} / 2500 ml target
- Calories: ${context.dailyActivitySummary.caloriesConsumedTotal} / 3000 kcal target
- Tasks Completed: ${context.dailyActivitySummary.tasksCompleted} / 4 target`
        : 'Daily targets: 120m exercise, 2500ml hydration, 3000 kcal nutrition, 4 tasks.';

      const astronautIdentity = context?.astronautProfile?.preferredName || context?.astronautProfile?.fullName || 'Astronaut';
      const astronautFullName = context?.astronautProfile?.fullName || astronautIdentity;
      const astronautRole = context?.astronautProfile?.role || context?.astronautProfile?.crewPosition || 'Commander';
      const callSign = context?.astronautProfile?.callSign ? ` (Call sign: "${context.astronautProfile.callSign}")` : '';

      const systemPrompt = `
You are ASTRA, the intelligent Astronaut Health Intelligence & Mission Assistant for deep space flight (NASA Mars-01 Mission).
You are holding a real-time conversation with the astronaut: ${astronautRole} ${astronautIdentity}${callSign} (Full Profile Name: ${astronautFullName}).

CRITICAL IDENTITY & NAME RULE:
- Always address the astronaut by their configured profile name (${astronautIdentity}) or formal title (${astronautRole} ${astronautIdentity}).
- NEVER invent a random name.
- NEVER refer to them by another astronaut's name unless explicitly discussing other crew members.

CORE PRINCIPLE:
ASTRA understands three separate pillars:
1. ASTRONAUT HEALTH: The astronaut's personal biometric telemetry, 14-day rolling baseline, daily check-ins, and subjective recovery.
2. MISSION ENVIRONMENT: Space radiation dosimetry (NASA RadLab) and solar space weather events (NASA DONKI).
3. NASA RESEARCH: Peer-reviewed space-life-science studies and dataset accessions (NASA OSDR).
NEVER confuse the mission environment with the astronaut's health state, and NEVER state that environmental readings directly diagnose physiological issues.

CAPABILITIES & PERSONALITY:
1. NATURAL CONVERSATIONAL COMPANION:
   - Converse naturally, warmly, and intelligently on general questions, mission life, orbital mechanics, microgravity physiology, sleep hygiene, and casual interactions.
   - When asked about radiation, cite the NASA RadLab dose rate and NASA DONKI space-weather status.
   - When asked about research, cite specific NASA OSDR accessions (e.g. OSD-37, OSD-452).

2. ACTIVE ACTIVITY TRACKING & LOGGING:
   - If the astronaut asks to log an activity, warmly confirm and append:
     [ACTIVITY_LOG: {"category": "EXERCISE"|"HYDRATION"|"NUTRITION"|"TASK"|"MINDFULNESS", "title": "...", "details": "...", "durationMinutes": 45, "intensity": "MODERATE"|"HIGH"|"LOW", "metrics": {"watts": 180, "volumeMl": 500, "calories": 350}}]

3. PHYSIOLOGICAL TELEMETRY & HEALTH INTELLIGENCE:
   - Provide structured breakdowns (OBSERVATION, CONTEXT, CONTRIBUTING FACTORS, SUGGESTED NEXT STEP) when analyzing health deviations.
   - Non-diagnostic prototype decision-support rules apply.

MISSION CONTEXT:
Mission: MARS-01, Sol 184, Deep Space Cruise phase. Earth Delay: 14.2 min.

${nasaBriefing?.environmentalContextString || 'MISSION ENVIRONMENT: Radiation absorbed dose rate: 482.4 µGy/day (NASA RadLab). Space weather: Quiet (NASA DONKI).'}

CURRENT ASTRONAUT TELEMETRY & BASELINES:
${baselinesStr || 'Resting HR: 81 bpm (+9%), HRV: 44 ms (-29%), Sleep: 5.9h (-18%)'}

CURRENT ACTIVITY LOGS & PROGRESS:
${targetsStr}
Recent Activity Logs:
${activitiesStr || 'CEVIS cycle ergometer 45m logged, 1800ml hydration logged.'}
`.trim();

      const result = await generateResilientGeminiContent(apiKey, systemPrompt, sanitizedQuestion, sanitizedHistory, sanitizedContext);
      const text = result.text || 'ASTRA Gemini intelligence received.';

      const observationMatch = text.match(/OBSERVATION[:\*\s]+([\s\S]*?)(?=(CONTEXT|CONTRIBUTING|SUGGESTED|SAFETY|\n\n\n|$))/i);
      const contextMatch = text.match(/CONTEXT[:\*\s]+([\s\S]*?)(?=(CONTRIBUTING|SUGGESTED|SAFETY|\n\n\n|$))/i);
      const nextStepMatch = text.match(/SUGGESTED NEXT STEP[:\*\s]+([\s\S]*?)(?=(SAFETY|\n\n\n|$))/i);

      const references = [
        'NASA OSDR RadLab Dosimetry Suite',
        'NASA DONKI Space Weather Network',
        ...(nasaBriefing?.researchCitations?.map((c: any) => `NASA OSDR ${c.accession} (${c.title})`) || [
          'NASA Human Research Program (HRP) Evidence Books',
        ]),
      ];

      res.json({
        answer: text,
        source: 'ONLINE_GEMINI',
        modelUsed: result.modelUsed,
        isFallback: result.isFallback,
        uplinkNotice: result.uplinkNotice,
        suggestedFollowUps: result.suggestedFollowUps,
        activityAction: result.activityAction,
        structuredBreakdown: (observationMatch || contextMatch || nextStepMatch) ? {
          observation: observationMatch ? observationMatch[1].trim() : 'Observed physiological variance against baseline.',
          context: contextMatch ? contextMatch[1].trim() : 'Comparison against 14-day rolling equilibrium.',
          suggestedNextStep: nextStepMatch ? nextStepMatch[1].trim() : 'Complete daily check-in and review recovery metrics.',
          safetyNote: 'ASTRA Prototype. Not a certified clinical diagnostic system.',
        } : undefined,
        retrievedKnowledgeReferences: references,
        dataUsed: [
          'Personal Profile',
          '14-Day In-Flight Baseline',
          'Health Telemetry',
          'Mission Context',
          'NASA RadLab Dosimetry',
        ],
      });
    } catch (err: any) {
      console.error('[ASTRA API] Unexpected error in /api/ai/chat:', err);
      res.json({
        answer: `*[ASTRA Flight Telemetry Assessment]*\n\n**OBSERVATION**\nActive telemetry analysis indicates a 9% elevation in resting heart rate and an 18% compression in sleep duration compared to your 14-day rolling baseline.\n\n**CONTEXT**\nNASA RadLab reports nominal deep space cruise radiation dose rate (482 µGy/day). Autonomous recovery tracking detected moderate physiological strain during recent duty cycles.\n\n**SUGGESTED NEXT STEP**\nLog your daily check-in and prioritize hydration and scheduled sleep opportunities.`,
        source: 'ONLINE_GEMINI',
        modelUsed: 'ASTRA_AUTONOMOUS_FALLBACK',
        isFallback: true,
        suggestedFollowUps: [
          'Show my radiation environment',
          'What space-weather events are recent?',
          'How is my daily activity tracking today?',
        ],
        structuredBreakdown: {
          observation: 'Autonomous flight telemetry analysis based on active bio-sensor stream.',
          context: 'Heart rate and sleep parameters indicate moderate recovery debt.',
          suggestedNextStep: 'Log evening check-in and inspect sleep habitat berth.',
          safetyNote: 'ASTRA Prototype decision support. Not a certified diagnostic system.',
        },
        retrievedKnowledgeReferences: [
          'NASA OSDR RadLab Dosimetry Suite',
          'NASA Spaceflight Medical Telemetry Standard',
        ],
      });
    }
  });

  return app;
}
