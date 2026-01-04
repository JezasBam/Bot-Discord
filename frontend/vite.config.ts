import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['*.traefik.me', 'discord-bot-full-bot-ovc6mi-861be7-45-13-151-18.traefik.me', true],
  },
  build: {
    rollupOptions: {
      external: ['vitest'],
    },
  },
});
