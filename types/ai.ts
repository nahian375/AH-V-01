/**
 * ASTRA Health - AI & Provider Architecture Types
 */

import { HealthMeasurement, MetricBaseline, MultiMetricChange, HealthAlert, DailyCheckIn } from './health';
import { ActivityRecord, DailyActivitySummary } from './activity';
import { MissionContext } from './mission';

export type AIMode = 'ONLINE' | 'OFFLINE' | 'AUTO';

export type AISource = 
  | 'ONLINE • GEMINI' 
  | 'OFFLINE • LOCAL ASTRA' 
  | 'AUTO • GEMINI' 
  | 'AUTO • LOCAL ASTRA';

export type LocalModelStatus = 'READY' | 'DOWNLOADING' | 'NOT_INSTALLED' | 'UNSUPPORTED' | 'FALLBACK_ENGINE';

export interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

export interface HealthAIContext {
  mission: MissionContext;
  currentHealth: HealthMeasurement;
  baselines: MetricBaseline[];
  recentChanges?: MultiMetricChange[];
  activeAlerts: HealthAlert[];
  recentCheckIn?: DailyCheckIn;
  recentActivities?: ActivityRecord[];
  dailyActivitySummary?: DailyActivitySummary;
  mode: AIMode;
  userQuestion: string;
  history?: ChatHistoryMessage[];
  astronautProfile?: {
    fullName: string;
    preferredName?: string;
    callSign?: string;
    role?: string;
    crewPosition?: string;
    astronautId?: string;
    agency?: string;
  };
}

export interface ActivityActionPayload {
  category: ActivityRecord['category'];
  title: string;
  details: string;
  durationMinutes?: number;
  intensity?: ActivityRecord['intensity'];
  metrics?: ActivityRecord['metrics'];
}

export interface AIResponse {
  answer: string;
  source: 'ONLINE_GEMINI' | 'OFFLINE_LOCAL_ASTRA';
  providerName: string;
  timestamp: string;
  structuredBreakdown?: {
    observation: string;
    context: string;
    possibleContributingFactors?: string[];
    suggestedNextStep: string;
    safetyNote?: string;
  };
  suggestedFollowUps?: string[];
  activityAction?: ActivityActionPayload;
  retrievedKnowledgeReferences?: string[];
  dataUsed?: string[];
  latencyMs?: number;
  isFallback?: boolean;
  uplinkNotice?: string;
}

export interface AIConversationMessage {
  id: string;
  sender: 'USER' | 'ASTRA';
  text: string;
  timestamp: string;
  source?: AISource;
  structuredBreakdown?: AIResponse['structuredBreakdown'];
  suggestedFollowUps?: string[];
  activityAction?: ActivityActionPayload;
  createdActivityId?: string;
  dataUsed?: string[];
}

export interface AIProvider {
  id: string;
  name: string;
  initialize(): Promise<boolean>;
  isAvailable(): Promise<boolean>;
  generateResponse(request: { question: string; context: HealthAIContext; history?: ChatHistoryMessage[] }): Promise<AIResponse>;
  generateHealthSummary(context: HealthAIContext): Promise<string>;
  explainTrend(metricKey: string, context: HealthAIContext): Promise<string>;
  summarizeChanges(changes: MultiMetricChange[], context: HealthAIContext): Promise<string>;
}

