import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./index.js', import.meta.url)),
      formats: ['es'],
      fileName: 'component-playground',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: (id) => {
        return id === 'vue' || id.startsWith('@codemirror/') || id.startsWith('shiki/');
      },
    },
  },
});
