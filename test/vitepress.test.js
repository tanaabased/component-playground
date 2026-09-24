import { EditorView } from '@codemirror/view';
import { flushPromises, mount } from '@vue/test-utils';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';
import vitesseDark from 'shiki/themes/vitesse-dark.mjs';
import vitesseLight from 'shiki/themes/vitesse-light.mjs';
import { markRaw, nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';

const vitepressState = { isDark: ref(false) };

import ComponentPlayground from '../components/ComponentPlayground.vue';
import ExampleSection from '../docs/components/ExampleSection.vue';
import { sectionSchema } from '../docs/example-schemas.js';
import { createPlaygroundState, generateComponentUsage } from '../utils/codegen.js';
import { withComponentPlayground } from '../vitepress.js';

const githubThemes = {
  light: githubLight,
  dark: githubDark,
};

const vitesseThemes = {
  light: vitesseLight,
  dark: vitesseDark,
};

async function settle() {
  await nextTick();
  await flushPromises();
  await nextTick();
}

function registerPlayground(syntaxThemes) {
  const baseResult = Promise.resolve();
  const baseEnhanceApp = vi.fn(() => baseResult);
  let registeredPlayground;
  const app = {
    component: vi.fn((_name, component) => {
      registeredPlayground = component;
    }),
  };
  const theme = withComponentPlayground(
    { enhanceApp: baseEnhanceApp },
    { syntaxThemes, useData: () => vitepressState },
  );
  const context = { app };

  const result = theme.enhanceApp(context);

  expect(baseEnhanceApp).toHaveBeenCalledWith(context);
  expect(app.component).toHaveBeenCalledWith('ComponentPlayground', registeredPlayground);
  expect(result).toBe(baseResult);
  return registeredPlayground;
}

async function mountRegisteredPlayground(syntaxThemes, props = {}) {
  const registeredPlayground = registerPlayground(syntaxThemes);
  const wrapper = mount(registeredPlayground, {
    attachTo: document.body,
    props: {
      component: markRaw(ExampleSection),
      schema: sectionSchema,
      ...props,
    },
  });

  await vi.waitFor(() => {
    expect(wrapper.find('[aria-label="Editable component usage code"]').exists()).toBe(true);
  });

  return wrapper;
}

function editorView(wrapper) {
  return EditorView.findFromDOM(wrapper.get('.cm-editor').element);
}

function findRegion(wrapper, predicate) {
  const state =
    wrapper.emitted('update:state')?.at(-1)?.[0] ?? createPlaygroundState(sectionSchema, {});

  return generateComponentUsage(sectionSchema, state).regions.find(predicate);
}

async function openOrientationMenu(wrapper) {
  const region = findRegion(wrapper, (candidate) => candidate.prop === 'orientation');
  const view = editorView(wrapper);

  view.dispatch({ selection: { anchor: region.from } });
  view.contentDOM.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }),
  );
  await settle();

  return document.body.querySelector('[role="group"]');
}

function tokenStyles(wrapper) {
  return wrapper
    .findAll('.component-playground-code__token')
    .map((token) => token.attributes('style'));
}

describe('VitePress integration', () => {
  it('follows VitePress appearance and forwards component props and events', async () => {
    const onCopy = vi.fn();
    const onUpdateState = vi.fn();
    const wrapper = await mountRegisteredPlayground(githubThemes, {
      source: 'https://example.com/ExampleSection.vue',
      previewFit: 'contained',
      onCopy,
      'onUpdate:state': onUpdateState,
    });
    const playground = wrapper.getComponent(ComponentPlayground);

    expect(playground.props('schema')).toStrictEqual(sectionSchema);
    expect(playground.props('previewFit')).toBe('contained');
    expect(playground.props('source')).toBe('https://example.com/ExampleSection.vue');
    expect(playground.props('syntaxThemes')).toStrictEqual(githubThemes);
    expect(wrapper.get('.component-playground').attributes('data-appearance')).toBe('light');
    expect(wrapper.get('.component-playground-code').attributes('data-appearance')).toBe('light');

    vitepressState.isDark.value = true;
    await settle();

    expect(wrapper.get('.component-playground').attributes('data-appearance')).toBe('dark');
    expect(wrapper.get('.component-playground-code').attributes('data-appearance')).toBe('dark');

    const menu = await openOrientationMenu(wrapper);
    expect(menu.dataset.appearance).toBe('dark');

    vitepressState.isDark.value = false;
    await settle();
    expect(menu.dataset.appearance).toBe('light');

    const right = [...menu.querySelectorAll('button')].find(
      (button) => button.textContent.trim() === 'right',
    );
    right.click();
    await settle();
    expect(onUpdateState).toHaveBeenLastCalledWith(
      expect.objectContaining({ props: expect.objectContaining({ orientation: 'right' }) }),
    );

    vi.useFakeTimers();
    await wrapper.get('[aria-label="Copy code"]').trigger('click');
    await settle();
    expect(onCopy).toHaveBeenCalledWith(expect.stringContaining('orientation="right"'));
    expect(wrapper.get('[aria-label="Copied code"]').classes()).toContain('copied');
    vi.runAllTimers();
  });

  it('applies the shared default pair and a configured alternative', async () => {
    const defaultWrapper = await mountRegisteredPlayground(githubThemes);
    const alternativeWrapper = await mountRegisteredPlayground(vitesseThemes);

    await vi.waitFor(() => {
      expect(tokenStyles(defaultWrapper).length).toBeGreaterThan(0);
      expect(tokenStyles(alternativeWrapper).length).toBeGreaterThan(0);
    });

    expect(tokenStyles(alternativeWrapper)).not.toEqual(tokenStyles(defaultWrapper));
    expect(defaultWrapper.getComponent(ComponentPlayground).props('syntaxThemes')).toStrictEqual(
      githubThemes,
    );
    expect(
      alternativeWrapper.getComponent(ComponentPlayground).props('syntaxThemes'),
    ).toStrictEqual(vitesseThemes);
  });
});
