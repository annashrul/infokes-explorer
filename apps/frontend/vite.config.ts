import { defineConfig } from 'vite';
// @ts-ignore
const vue = require('@vitejs/plugin-vue');

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@packages': new URL('../../packages', import.meta.url).pathname
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    }
  }
});
