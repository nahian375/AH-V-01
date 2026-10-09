/**
 * ASTRA Health - Offline Mission Knowledge Base (Local RAG)
 * Prototype guidelines and NASA spaceflight physiological countermeasures
 * Clearly labeled as prototype/research content.
 */

export interface KnowledgeDoc {
  id: string;
  category: 'SLEEP' | 'CARDIO' | 'EXERCISE' | 'RADIATION' | 'COGNITIVE' | 'HYDRATION' | 'PROCEDURES';
  title: string;
  keywords: string[];
  summary: string;
  content: string;
  protocols: string[];
}

export const MISSION_KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: 'kb-sleep-circadian',
    category: 'SLEEP',
    title: 'Sleep Compression & Circadian Phase Shifting in Deep Space',
    keywords: ['sleep', 'insomnia', 'fatigue', 'circadian', 'recovery', 'melatonin', 'lighting'],
    summary: 'Countermeasures for microgravity sleep fragmentation and circadian rhythm disruption during interplanetary transit.',
    content: 'Long-duration interplanetary crews frequently experience sleep disruption from microgravity cephalad fluid shifts, acoustic noise, and lack of terrestrial zeitgebers (day/night solar cycles). A decrease in sleep duration below 6 hours coupled with elevated fatigue score warrants circadian realignment protocols.',
    protocols: [
      'Engage solid-state blue-depleted dynamic habitat lighting (480nm reduction) 90 minutes prior to scheduled sleep.',
      'Check sleeping berth ventilation fans to eliminate localized carbon dioxide pockets (micro-pockets above 3 mmHg CO2 cause sleep arousals).',
      'If sleep latency exceeds 45 minutes, avoid active display terminals and perform 10 minutes of diaphragmatic breathing.',
      'Log daily subjective sleep quality in ASTRA check-in to adjust next sol exercise intensity.'
    ]
  },
  {
    id: 'kb-cardio-hrv',
    category: 'CARDIO',
    title: 'Autonomic Dysregulation, Resting Heart Rate & HRV Shifts',
    keywords: ['heart rate', 'resting hr', 'hrv', 'autonomic', 'cardiovascular', 'blood pressure', 'rmssd'],
    summary: 'Evaluating acute vs. cumulative sympathetic overdrive and vagal tone reduction in deep space transit.',
    content: 'An elevation in resting heart rate (+5 to +10%) accompanied by a marked reduction in Heart Rate Variability (HRV RMSSD drop >20%) indicates reduced parasympathetic tone, often driven by accumulated sleep debt, prolonged mission stress, or early subclinical autonomic fatigue rather than cardiac pathology.',
    protocols: [
      'Compare current metrics against the 14-day rolling baseline rather than general population tables.',
      'Evaluate orthostatic symptoms during post-sleep transitions.',
      'Review current fluid intake: mild hypovolemia from inadequate fluid/electrolyte intake can elevate compensatory resting heart rate.',
      'If multi-metric deviation is present with high fatigue, schedule an active rest interval with reduced resistance training volume.'
    ]
  },
  {
    id: 'kb-exercise-countermeasures',
    category: 'EXERCISE',
    title: 'Microgravity Musculoskeletal & Aerobic Conditioning Protocols',
    keywords: ['exercise', 'ared', 'cevis', 'resistance', 'bone loss', 'aerobic', 'musculoskeletal'],
    summary: 'Standardized daily exercise prescription to prevent bone mineral density loss and cardiovascular deconditioning.',
    content: 'Astronauts on Mars transit perform 2.0 to 2.5 hours of daily structured exercise divided between the Advanced Resistive Exercise Device (ARED) and cycle ergometer (CEVIS) / T2 treadmill. Skipping or reducing exercise sessions due to fatigue can accelerate muscle atrophy and vascular stiffening.',
    protocols: [
      'Maintain minimum 30 minutes aerobic conditioning at 75-85% VO2 max.',
      'Execute multi-joint axial loading on ARED (squats, deadlifts, heel raises) to preserve lumbar and femoral neck bone density.',
      'In the presence of an active ORANGE Attention status, substitute heavy axial lifting with low-impact steady-state cycle ergometry at 65% VO2 max.',
      'Verify harness tether tension and vibration isolation stabilization system (VIS).'
    ]
  },
  {
    id: 'kb-radiation-deep-space',
    category: 'RADIATION',
    title: 'Galactic Cosmic Rays (GCR) & Solar Particle Events (SPE)',
    keywords: ['radiation', 'dosimeter', 'gcr', 'spe', 'solar storm', 'sievert', 'storm shelter'],
    summary: 'Deep space radiation monitoring, ALARA thresholds, and solar particle event storm shelter procedures.',
    content: 'Interplanetary cruise exposes crew to persistent Galactic Cosmic Radiation (approx 1.2 to 1.8 mSv/day equivalent in deep space) and stochastic Solar Particle Events. Chronic cumulative exposure is tracked against the NASA 600 mSv career limit to maintain acceptable lifetime excess risk of radiation-induced cancer.',
    protocols: [
      'Daily passive and active silicon personal dosimeter interrogation.',
      'Threshold alert: If ambient dosimeter rate exceeds 1,500 uSv/hour, initiate Tier-1 Solar Storm Verification with automated solar flare spectrometers.',
      'Tier-2 Storm Shelter: In event of confirmed SPE, all crew members relocate to the central habitat water wall storm shelter module.',
      'Increase antioxidant hydration intake during elevated space weather periods.'
    ]
  },
  {
    id: 'kb-cognitive-fatigue',
    category: 'COGNITIVE',
    title: 'Cognitive Readiness, Psychomotor Vigilance & Neurobehavioral Health',
    keywords: ['cognitive', 'reaction time', 'memory', 'attention', 'vigilance', 'stress', 'mood'],
    summary: 'Monitoring astronaut cognitive performance decrements, reaction time slowing, and neurobehavioral readiness.',
    content: 'High-consequence space operations require sharp psychomotor vigilance. Prolonged confinement, high mission task loading, and sleep loss lead to cognitive lapses, prolonged reaction times (>15% above baseline), and working memory degradation.',
    protocols: [
      'Complete brief 3-minute Psychomotor Vigilance Task (PVT) before EVA or complex docking manoeuvres.',
      'If reaction time deviates by >20% from personal baseline, assign critical flight tasks to co-pilot or defer non-essential operations.',
      'Utilize audio-guided cognitive decompression sessions and scheduled crew social communication.',
      'Review daily self-reported mood and stress indices in ASTRA check-in.'
    ]
  },
  {
    id: 'kb-hydration-nutrition',
    category: 'HYDRATION',
    title: 'Microgravity Fluid Redistribution & Hydration Management',
    keywords: ['hydration', 'fluids', 'electrolytes', 'sodium', 'puffy face', 'urine', 'osmolality'],
    summary: 'Fluid shift adaptation, hypovolemia prevention, and electrolyte balance in microgravity.',
    content: 'Upon entering microgravity, cephalad fluid shift triggers physiological diuresis, reducing total circulating plasma volume by 10-15%. Inadequate re-hydration leads to chronic sub-clinical dehydration, exacerbating elevated resting heart rate and orthostatic intolerance.',
    protocols: [
      'Maintain daily oral fluid intake of at least 32 mL/kg body mass.',
      'Consume balanced electrolyte rehydration packets with morning meal.',
      'Monitor urine color and specific gravity indicators.',
      'Report any persistent headache, nausea, or orthostatic dizziness to Flight Surgeon / Medical Officer.'
    ]
  },
  {
    id: 'kb-emergency-triage',
    category: 'PROCEDURES',
    title: 'Crew Medical Officer Escalation & Health Triage Protocol (Prototype)',
    keywords: ['emergency', 'triage', 'protocol', 'flight surgeon', 'escalation', 'red alert', 'safety'],
    summary: 'Deterministic escalation guidelines when critical physiological changes or trauma occur.',
    content: 'ASTRA provides health intelligence and trend awareness. It does NOT diagnose or replace medical decision making. In critical scenarios (RED severity, acute chest pain, severe hypoxia, loss of consciousness, traumatic injury), deterministic emergency checklists override automated advice.',
    protocols: [
      'Verify patient airway, breathing, circulation (ABC).',
      'Notify Crew Medical Officer immediately via intercom.',
      'Retrieve Crew Medical Kit (CMK) and Autonomous Medical Diagnostic Module (AMDM).',
      'Transmit encrypted high-priority medical telemetry burst to Earth Mission Control ground team (Deep Space Network high-priority uplink).',
      'Consult onboard Medical Operations Handbook for procedure checklists.'
    ]
  }
];
