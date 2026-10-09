import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { loadAndVerifyEnv } from './server/env.ts';

// 1. Ensure environment variables are loaded and validated prior to server initialization
loadAndVerifyEnv();

export default defineConfig(({ mode }) => {
  // Sync all loaded environment variables into process.env to prevent silent startup failures
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'astra-api-dev-middleware',
        async configureServer(server) {
          const { createApiApp } = await import('./server/apiRouter.ts');
          server.middlewares.use(createApiApp());
          console.log('[ASTRA Dev Server] Successfully attached API endpoints to Vite dev server (/api/*)');
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'ASTRA Health',
          short_name: 'ASTRA',
          description: 'Astronaut Health Intelligence System — Continuous health monitoring for long-duration space missions with dual online & offline AI.',
          theme_color: '#0b1120',
          background_color: '#030712',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/(?!ai).*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'astra-api-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      hmr: false,
      ws: false,
      watch: null,
    },
  };
});
