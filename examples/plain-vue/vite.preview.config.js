import { fileURLToPath, URL } from 'node:url';

import { mergeConfig } from 'vite';

import config from './vite.local.config.js';

export default mergeConfig(config, {
  base: '/plain-vue/',
  build: {
    emptyOutDir: false,
    outDir: fileURLToPath(new URL('../../docs/.vitepress/dist/plain-vue', import.meta.url)),
  },
});
