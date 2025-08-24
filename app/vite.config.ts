import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@rest': path.resolve(__dirname, './rest'),
    },
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true, // <- critical for Docker volumes
      interval: 100, // optional, how often to check for changes
    },
  },
});
