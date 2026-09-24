import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        'component-playground': fileURLToPath(new URL('./index.js', import.meta.url)),
        vitepress: fileURLToPath(new URL('./vitepress.js', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'style',
    },
    rollupOptions: {
      external: (id) => {
        return (
          id === 'vue' ||
          id === 'vitepress' ||
          id.startsWith('vitepress/') ||
          id.startsWith('@codemirror/') ||
          id.startsWith('shiki/')
        );
      },
    },
  },
});
