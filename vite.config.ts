import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'Treningsappen',
          short_name: 'Trening',
          description: 'Din personlige treningsdagbok',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    // Ingen `define` av GEMINI_API_KEY her. loadEnv med tomt prefiks plukker opp
    // alle miljøvariabler, også de uten VITE_-prefiks, og en define ville bakt
    // API-nøkkelen rett inn i den offentlige klientbundelen. Nøkkelen brukes kun
    // server-side i api/-rutene og skal aldri nå nettleseren.
    build: {
      rollupOptions: {
        output: {
          // Split by resolved path - the object form left `vendor` empty because
          // React is pulled in via react/jsx-runtime and react-dom/client.
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (/node_modules\/(recharts|d3-|victory-)/.test(id)) return 'recharts';
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor';
            if (id.includes('@supabase')) return 'supabase';
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
