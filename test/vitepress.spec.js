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
    ];

    for (const mapping of expectedMappings) {
      assert.match(stylesheet, new RegExp(mapping.replace(/[()]/g, '\\$&')));
    }
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
