import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'generateSW',
        manifest: {
          name: 'Customer 360 — Identity & Opportunity Platform',
          short_name: 'Customer 360',
          description: 'Financial Customer 360 Identity Resolution & Next-Best-Opportunity Engine — PS-04 Codeissance 2026',
          theme_color: '#2457A6',
          background_color: '#F4F2ED',
          display: 'standalone',
          icons: [
            {
              src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' rx='24' fill='%232457A6'/><text x='96' y='130' font-size='72' text-anchor='middle' fill='white' font-weight='bold' font-family='sans-serif'>360</text></svg>",
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='64' fill='%232457A6'/><text x='256' y='340' font-size='192' text-anchor='middle' fill='white' font-weight='bold' font-family='sans-serif'>360</text></svg>",
              sizes: '512x512',
              type: 'image/svg+xml',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 300 },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'document' || request.destination === 'script' || request.destination === 'style',
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets',
                expiration: { maxEntries: 60, maxAgeSeconds: 86400 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
