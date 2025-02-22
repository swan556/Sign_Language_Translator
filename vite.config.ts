import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/video_feed': 'http://localhost:5000',
      '/disconnect': 'http://localhost:5000',
    }
  }
});