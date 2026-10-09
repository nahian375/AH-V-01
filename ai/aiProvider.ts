/**
 * ASTRA Health - AI Provider Interface
 */

import { AIResponse, HealthAIContext } from '../types/ai';
import { MultiMetricChange } from '../types/health';

export interface AIProvider {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  initialize(): Promise<boolean>;
  generateResponse(request: { question: string; context: HealthAIContext }): Promise<AIResponse>;
  generateHealthSummary(context: HealthAIContext): Promise<string>;
  explainTrend(metricKey: string, context: HealthAIContext): Promise<string>;
  summarizeChanges(changes: MultiMetricChange[], context: HealthAIContext): Promise<string>;
}
