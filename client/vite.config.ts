import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    port: 3000,
    fs: {
      allow: [
        // default: serve files from project root
        '.',
        // allow the shared directory one level up
        path.resolve(__dirname, '../shared'),
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});