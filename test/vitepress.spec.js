import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import siteConfig from '../docs/.vitepress/config.js';
import { syntaxThemePairs } from '../docs/syntax-themes.js';

describe('VitePress integration contract', () => {
  it('should share the configured Shiki pair with Markdown', () => {
    assert.equal(siteConfig.markdown.theme, syntaxThemePairs.github);
  });

  it('should map playground presentation to VitePress theme variables', () => {
    const stylesheet = readFileSync(new URL('../vitepress.css', import.meta.url), 'utf8');
    const expectedMappings = [
      '--component-playground-background-color: var(--vp-code-block-bg)',
      '--component-playground-foreground-color: var(--vp-code-block-color',
      '--component-playground-border-color: var(--vp-code-block-divider-color',
      '--component-playground-accent-color: var(--vp-c-brand-1)',
      '--component-playground-hover-background-color: var(--vp-c-default-soft)',
      '--component-playground-active-background-color: var(--vp-c-brand-soft)',
      '--component-playground-font-family: var(--vp-font-family-base)',
      '--component-playground-monospace-font-family: var(--vp-font-family-mono)',
      '--component-playground-font-size: var(--vp-code-font-size)',
      '--component-playground-line-height: var(--vp-code-line-height)',
      'border: 1px solid var(--vp-code-copy-code-border-color)',
      'background-color: var(--vp-code-copy-code-bg)',
      'background-image: var(--vp-icon-copy)',
      'content: var(--vp-code-copy-copied-text-content)',
      'color: var(--vp-code-lang-color)',
      'border: 0',
      'outline: none',
      'display: contents',
      'display: none',
    ];

    for (const mapping of expectedMappings) {
      assert.match(stylesheet, new RegExp(mapping.replace(/[()]/g, '\\$&')));
    }

    assert.match(stylesheet, /^\.component-playground\[data-vitepress\] \{/m);
    assert.doesNotMatch(stylesheet, /^\.component-playground \{/m);
  });

  it('keeps the standalone language and copy actions in one text metadata row', () => {
    const playground = readFileSync(
      new URL('../components/ComponentPlayground.vue', import.meta.url),
      'utf8',
    );

    assert.match(playground, /class="component-playground__code-meta"/);
    assert.match(playground, /class="component-playground__code-separator"[^>]*>\|<\/span>/);
    assert.match(playground, /\.component-playground__code-meta \{[\s\S]*?display: flex;/);
    assert.match(playground, /\.component-playground__copy \{[\s\S]*?border: 0;/);
    assert.match(playground, /\.component-playground__copy:hover \{\s*text-decoration: underline;/);
  });

  it('should apply the relative VitePress code size only once', () => {
    const playground = readFileSync(
      new URL('../components/ComponentPlayground.vue', import.meta.url),
      'utf8',
    );
    const interactiveCode = readFileSync(
      new URL('../components/InteractiveCode.vue', import.meta.url),
      'utf8',
    );
    const fontSizeDeclaration = 'font-size: var(--_component-playground-font-size);';

    assert.equal(playground.split(fontSizeDeclaration).length - 1, 1);
    assert.doesNotMatch(
      interactiveCode,
      /font(?:Size|-size): ['"]?var\(--_component-playground-font-size\)/,
    );
  });
});
