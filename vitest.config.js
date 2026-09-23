import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['test/components/**/*.test.js'],
    setupFiles: ['./test/components/setup.js'],
  },
});
