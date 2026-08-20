import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Financial Customer 360 & Opportunity Engine',
          short_name: 'Customer 360',
          description: 'Unified Customer 360 Identity Resolution & Next-Best-Opportunity Intelligence Platform',
          theme_color: '#1e40af',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%231e40af"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white" font-weight="bold">360</text></svg>',
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%231e40af"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white" font-weight="bold">360</text></svg>',
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
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 300,
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
