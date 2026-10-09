/**
 * ASTRA Health - Mission Server
 * Ensures environment variables are validated prior to initialization.
 * Prevents silent startup failures by logging detailed diagnostics and catching binding errors.
 */

import express from 'express';
import path from 'path';
import { loadAndVerifyEnv } from './server/env.ts';
import { createApiApp } from './server/apiRouter.ts';

// 1. Validate & load environment variables prior to any server initialization
const envConfig = loadAndVerifyEnv();

// Catch unexpected crashes early to prevent silent process termination
process.on('uncaughtException', (err) => {
  console.error('[ASTRA Health] FATAL: Uncaught Exception during runtime:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ASTRA Health] FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startServer() {
  const app = express();
  const PORT = envConfig.port;

  // Security hardening: Prevent Express fingerprinting and apply baseline security headers
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Mount API endpoints
  app.use(createApiApp());

  // In development: Vite middleware; In production: Static files from dist
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASTRA Health] Mission Server successfully active on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[ASTRA Health] FATAL: Port ${PORT} is already in use by another process.`);
    } else {
      console.error('[ASTRA Health] FATAL: Server failed to start:', err);
    }
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('[ASTRA Health] FATAL: Server initialization failure:', err);
  process.exit(1);
});
