import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@rest': path.resolve(__dirname, './rest'),
      },
    },
    server: {
      port: 3001,
      host: true,
      watch: {
        usePolling: true, // <- critical for Docker volumes
        interval: 100, // optional, how often to check for changes
      },
      /** Forwards to the Node Stripe app (`/stripe` in repo, port 5000). Set VITE_STRIPE_PROXY_TARGET=http://stripe:5000 in Docker. */
      proxy: {
        '/stripe-service': {
          target: env.VITE_STRIPE_PROXY_TARGET || 'http://127.0.0.1:5000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/stripe-service/, ''),
        },
      },
    },
  };
});
