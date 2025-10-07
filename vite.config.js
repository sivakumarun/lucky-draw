import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        trainer: resolve(__dirname, 'trainer.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  server: {
    host: true, // 👈 enables access over local network
    port: 3000,
    open: true,
  },
});