/**
 * ASTRA Health - Cloud Gemini AI Provider (Online Mode)
 * Proxies requests securely through backend /api/ai/chat.
 * Never exposes the Gemini API key to the client/browser bundle.
 */

import { AIProvider } from './aiProvider';
import { AIResponse, HealthAIContext } from '../types/ai';
import { MultiMetricChange } from '../types/health';

export class GeminiProvider implements AIProvider {
  public id = 'online-gemini';
  public name = 'ONLINE • GEMINI';

  async initialize(): Promise<boolean> {
    return true;
  }

  async isAvailable(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    try {
      const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(request: { question: string; context: HealthAIContext; history?: { role: 'user' | 'model'; text: string }[] }): Promise<AIResponse> {
    const startTime = performance.now();
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: request.question,
          context: request.context,
          history: request.history || request.context.history || [],
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        let errDetail = `${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.details || errJson.error) {
            errDetail = `${errDetail} - ${errJson.details || errJson.error}`;
          }
        } catch {
          // ignore parse error
        }
        throw new Error(`Server returned ${errDetail}`);
      }

      const data = await response.json();
      const latencyMs = Math.round(performance.now() - startTime);

      const providerLabel = data.modelUsed
        ? `Gemini Cloud (${data.modelUsed})`
        : 'Gemini Cloud (Earth-Uplink)';

      return {
        answer: data.answer || 'ASTRA Gemini intelligence received.',
        source: 'ONLINE_GEMINI',
        providerName: providerLabel,
        timestamp: new Date().toISOString(),
        structuredBreakdown: data.structuredBreakdown,
        suggestedFollowUps: data.suggestedFollowUps,
        activityAction: data.activityAction,
        isFallback: data.isFallback,
        uplinkNotice: data.uplinkNotice,
        retrievedKnowledgeReferences: data.retrievedKnowledgeReferences || ['NASA Flight Surgeon Space Medicine Library (Online)'],
        latencyMs,
      };
    } catch (err: any) {
      console.warn('GeminiProvider network error or timeout:', err.message);
      throw err;
    }
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
    const res = await this.generateResponse({ question: 'What changed in my recent health data?', context });
    return res.answer;
  }
}

export const geminiProvider = new GeminiProvider();
