import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mahjong-demo/', // GitHub Pages path
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
