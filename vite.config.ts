import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  define: {
    'process.env': process.env,
    global: 'globalThis'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://assets.meshy.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util'
    }
  }
});
