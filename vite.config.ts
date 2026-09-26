import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath, URL} from 'node:url';
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  resolve: {alias: {'@': fileURLToPath(new URL('.', import.meta.url))}},
  build: {rollupOptions: {input: {
    main: fileURLToPath(new URL('index.html', import.meta.url)),
    privacy: fileURLToPath(new URL('privacy/index.html', import.meta.url)),
    terms: fileURLToPath(new URL('terms/index.html', import.meta.url)),
  }}},
});
