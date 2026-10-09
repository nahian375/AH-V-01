/**
 * ASTRA Health - AI Router
 * Routes requests to Gemini (Online) or LocalAIProvider (Offline) or dynamically in Auto mode.
 * Guaranteed zero data loss and seamless offline fallback.
 */

import { AIResponse, HealthAIContext, AIMode, AISource, ChatHistoryMessage } from '../types/ai';
import { geminiProvider } from './geminiProvider';
import { localAIProvider } from './localAIProvider';
import { connectivityManager } from '../services/connectivityManager';

export interface AskAstraParams {
  question: string;
  healthContext: HealthAIContext;
  history?: ChatHistoryMessage[];
  mode?: AIMode;
}

export async function askASTRA(params: AskAstraParams): Promise<AIResponse> {
  const { question, healthContext, history } = params;
  const requestedMode = params.mode || healthContext.mode || 'AUTO';

  // 1. Force OFFLINE Mode
  if (requestedMode === 'OFFLINE' || connectivityManager.isCommsLossSimulated()) {
    return await localAIProvider.generateResponse({ question, context: healthContext, history });
  }

  // 2. Force ONLINE Mode
  if (requestedMode === 'ONLINE') {
    try {
      return await geminiProvider.generateResponse({ question, context: healthContext, history });
    } catch (err: any) {
      console.warn('Online mode requested but network/Gemini failed, falling back to Local ASTRA:', err.message);
      const fallbackResponse = await localAIProvider.generateResponse({ question, context: healthContext, history });
      fallbackResponse.answer = `*[Notice: Earth Uplink unavailable. Switched to Local ASTRA Core]*\n\n${fallbackResponse.answer}`;
      return fallbackResponse;
    }
  }

  // 3. AUTO Mode: Try Online first if connection and backend available, otherwise Local
  const isOnline = connectivityManager.isOnline() && !connectivityManager.isCommsLossSimulated();

  if (isOnline) {
    try {
      return await geminiProvider.generateResponse({ question, context: healthContext, history });
    } catch (err) {
      console.info('Auto mode: Cloud AI unavailable, using Local ASTRA Core');
      return await localAIProvider.generateResponse({ question, context: healthContext, history });
    }
  } else {
    return await localAIProvider.generateResponse({ question, context: healthContext, history });
  }
}

export function getActiveAISource(mode: AIMode, isOnline: boolean, commsLossSimulated: boolean): AISource {
  if (commsLossSimulated || mode === 'OFFLINE') {
    return 'OFFLINE • LOCAL ASTRA';
  }
  if (mode === 'ONLINE') {
    return isOnline ? 'ONLINE • GEMINI' : 'OFFLINE • LOCAL ASTRA';
  }
  // AUTO
  return isOnline ? 'AUTO • GEMINI' : 'AUTO • LOCAL ASTRA';
}
