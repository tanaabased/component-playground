import { fileURLToPath, URL } from 'node:url';

import { mergeConfig } from 'vite';

import config from './vite.config.js';

export default mergeConfig(config, {
  resolve: {
    alias: [
      {
        find: '@tanaab/component-playground/style.css',
        replacement: fileURLToPath(new URL('../../dist/style.css', import.meta.url)),
      },
      {
        find: /^@tanaab\/component-playground$/,
        replacement: fileURLToPath(new URL('../../dist/component-playground.js', import.meta.url)),
      },
    ],
  },
});
