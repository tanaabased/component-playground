import { readFileSync } from 'node:fs';

import { defineConfig } from 'vitepress';

import { syntaxThemePairs } from '../syntax-themes.js';

const packageMetadata = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
);

export default defineConfig({
  title: 'Component Playground',
  description: 'Schema-driven interactive examples for Vue 3 components.',
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    theme: syntaxThemePairs.github,
  },
  themeConfig: {
    nav: [
      { text: 'Installation', link: '/installation' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Examples', link: '/examples' },
      { text: `v${packageMetadata.version}`, link: '/reference' },
    ],
    sidebar: [
      {
        text: 'Start here',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Guide', link: '/guide/' },
          { text: 'Capability examples', link: '/examples' },
          { text: 'Events and initial state', link: '/examples#events-and-initial-state' },
        ],
      },
      {
        text: 'Package',
        items: [{ text: 'Schema and limitations', link: '/reference' }],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/tanaabased/component-playground' }],
    editLink: {
      pattern: 'https://github.com/tanaabased/component-playground/edit/main/docs/:path',
    },
    outline: [2, 3],
  },
});
