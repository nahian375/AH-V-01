import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export interface EnvStatus {
  loaded: boolean;
  port: number;
  nodeEnv: string;
  hasGeminiKey: boolean;
  source: string;
}

/**
 * Ensures environment variables are correctly loaded and validated before server initialization.
 * Prevents silent startup failures by logging explicit status and failure causes.
 */
export function loadAndVerifyEnv(): EnvStatus {
  const envPath = path.resolve(process.cwd(), '.env');
  let loaded = false;
  let source = 'process.env';

  try {
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        console.warn(`[ASTRA Server] Warning parsing .env file: ${result.error.message}`);
      } else {
        loaded = true;
        source = '.env file';
      }
    } else {
      // Fallback: Attempt standard dotenv load in case working directory has another env
      dotenv.config();
    }
  } catch (err: any) {
    console.error(`[ASTRA Server] Critical error during dotenv configuration: ${err?.message || err}`);
  }

  // Hardcoded to 3000 as required by the reverse proxy infrastructure
  const port = 3000;
  const nodeEnv = process.env.NODE_ENV || 'development';
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

  // Surface status to stdout
  console.log('[ASTRA Health] ========================================');
  console.log('[ASTRA Health] System Environment Initialized:');
  console.log(`[ASTRA Health]   - Mode:           ${nodeEnv}`);
  console.log(`[ASTRA Health]   - Target Port:    ${port}`);
  console.log(`[ASTRA Health]   - Env Source:     ${source}`);
  console.log(`[ASTRA Health]   - Gemini API Key: ${hasGeminiKey ? 'CONFIGURED (Online Uplink Ready)' : 'NOT SET (Local Heuristic Fallback Active)'}`);
  console.log('[ASTRA Health] ========================================');

  return {
    loaded,
    port,
    nodeEnv,
    hasGeminiKey,
    source,
  };
}
