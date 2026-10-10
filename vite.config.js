import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The contact form posts to /api/contact. In development that request is
// forwarded to the small Node server in /server (started by `npm run dev`).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 8787}`,
        changeOrigin: true,
      },
      '/socket.io': {
        target: `http://localhost:${process.env.PORT || 8787}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
});
