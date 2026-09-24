import { defineConfig } from 'vitepress';

import { syntaxThemes } from '../syntax-themes.js';

export default defineConfig({
  title: 'Component Playground VitePress consumer',
  markdown: {
    theme: syntaxThemes,
  },
});
