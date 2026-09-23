import { EditorView } from '@codemirror/view';
import { flushPromises, mount } from '@vue/test-utils';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';
import vitesseDark from 'shiki/themes/vitesse-dark.mjs';
import vitesseLight from 'shiki/themes/vitesse-light.mjs';
import { defineComponent, markRaw, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';

import ComponentPlayground from '../components/ComponentPlayground.vue';
import ExampleBox from '../docs/components/ExampleBox.vue';
import ExampleGrid from '../docs/components/ExampleGrid.vue';
import ExampleList from '../docs/components/ExampleList.vue';
import ExampleSection from '../docs/components/ExampleSection.vue';
import { createPlaygroundState, generateComponentUsage } from '../utils/codegen.js';

const BooleanPreview = defineComponent({
  props: {
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  template: '<p data-preview>{{ enabled ? "enabled" : "disabled" }}</p>',
});

const booleanSchema = {
  name: 'BooleanPreview',
  props: {
    enabled: { kind: 'boolean', default: false },
  },
};

const sectionSchema = {
  name: 'ExampleSection',
  props: {
    borderTop: { kind: 'boolean', default: true },
    borderBottom: { kind: 'boolean', default: false },
    orientation: { kind: 'enum', options: ['left', 'right'], default: 'left' },
  },
  slots: {
    title: { kind: 'text', default: 'A section with a job' },
    default: {
      kind: 'html',
      default:
        '<p>Its controls change <strong>visible structure</strong>, not decorative trivia.</p>',
    },
  },
};

const listSchema = {
  name: 'ExampleList',
  controls: {
    contentPreset: {
      kind: 'enum',
      options: ['compact', 'detailed'],
      default: 'detailed',
    },
    itemCount: {
      kind: 'enum',
      options: ['1', '2', '3', '4'],
      default: '4',
    },
  },
  props: {
    header: { kind: 'string', default: 'Mission crew' },
    columns: { kind: 'enum', options: ['1', '2', '3'], default: '2' },
    orientation: { kind: 'enum', options: ['column', 'row'], default: 'column' },
    items: {
      kind: 'object-array',
      presetControl: 'contentPreset',
      countControl: 'itemCount',
      defaultPreset: 'detailed',
      defaultCount: 4,
      presets: {
        compact: [
          { label: 'Naomi Nagata', category: 'Engineer' },
          { label: 'James Holden', category: 'Captain' },
          { label: 'Camina Drummer', category: 'Commander' },
          { label: 'Amos Burton', category: 'Engineer' },
        ],
        detailed: [
          { label: 'Naomi Nagata', category: 'Engineer', detail: 'Keeps the ship flying' },
          { label: 'James Holden', category: 'Captain', detail: 'Pushes every available button' },
          { label: 'Camina Drummer', category: 'Commander', detail: 'Makes the hard calls' },
          { label: 'Amos Burton', category: 'Engineer', detail: 'Fixes what remains' },
        ],
      },
      fields: [
        { path: 'label', kind: 'string' },
        {
          path: 'category',
          kind: 'enum',
          options: ['Captain', 'Commander', 'Engineer'],
        },
        { path: 'detail', kind: 'string', optional: true },
      ],
    },
  },
};

const gridSchema = {
  name: 'ExampleGrid',
  controls: {
    boxCount: {
      kind: 'enum',
      options: ['1', '2', '3', '4', 'auto'],
      default: '3',
    },
  },
  props: {
    columns: { kind: 'number', default: 3 },
  },
  slots: {
    default: {
      kind: 'repeat',
      component: markRaw(ExampleBox),
      componentName: 'ExampleBox',
      items: ['Navigation', 'Search', 'Release notes', 'Support'],
      countControl: 'boxCount',
      autoCountProp: 'columns',
      defaultCount: 3,
    },
  },
};

const contrastingSyntaxThemes = {
  light: vitesseLight,
  dark: vitesseDark,
};

async function settle() {
  await nextTick();
  await flushPromises();
  await nextTick();
}

async function mountPlayground({ component, schema, ...props }) {
  const wrapper = mount(ComponentPlayground, {
    attachTo: document.body,
    props: {
      component: markRaw(component),
      schema,
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

function tokenStyles(wrapper) {
  return wrapper
    .findAll('.component-playground-code__token')
    .map((token) => token.attributes('style'));
}

async function waitForTokenStyles(wrapper) {
  await vi.waitFor(() => {
    expect(tokenStyles(wrapper).length).toBeGreaterThan(0);
  });

  return tokenStyles(wrapper);
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, reject, resolve };
}

function latestState(wrapper, schema) {
  return (
    wrapper.emitted('update:state')?.at(-1)?.[0] ??
    createPlaygroundState(schema, wrapper.props('initialState'))
  );
}

function findRegion(wrapper, schema, predicate) {
  const generated = generateComponentUsage(schema, latestState(wrapper, schema));
  const region = generated.regions.find(predicate);

  expect(region).toBeDefined();
  return region;
}

async function activateWithKeyboard(wrapper, region) {
  const view = editorView(wrapper);
  view.dispatch({ selection: { anchor: region.from } });
  view.contentDOM.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }),
  );
  await settle();
}

async function activateWithClick(wrapper, region) {
  const view = editorView(wrapper);
  const positionShim = vi.spyOn(view, 'posAtCoords').mockReturnValue(region.from);

  view.contentDOM.dispatchEvent(
    new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: 10,
      clientY: 10,
    }),
  );
  positionShim.mockRestore();
  await settle();
}

async function editRegion(wrapper, schema, predicate, value) {
  const region = findRegion(wrapper, schema, predicate);
  editorView(wrapper).dispatch({
    changes: {
      from: region.from,
      to: region.to,
      insert: value,
    },
  });
  await settle();
}

async function selectEnum(wrapper, schema, predicate, option) {
  const region = findRegion(wrapper, schema, predicate);
  await activateWithKeyboard(wrapper, region);

  const menu = document.body.querySelector('[role="group"]');
  expect(menu).not.toBeNull();
  const button = [...menu.querySelectorAll('button')].find(
    (candidate) => candidate.textContent.trim() === option,
  );
  expect(button).toBeDefined();
  button.click();
  await settle();
}

describe('ComponentPlayground', () => {
  it('toggles default-false booleans by click and copies the synchronized markup', async () => {
    const wrapper = await mountPlayground({
      component: BooleanPreview,
      schema: booleanSchema,
    });
    expect(wrapper.get('[data-preview]').text()).toBe('disabled');
    const region = findRegion(wrapper, booleanSchema, (candidate) => candidate.prop === 'enabled');

    await activateWithClick(wrapper, region);

    expect(wrapper.get('[data-preview]').text()).toBe('enabled');
    vi.useFakeTimers();
    await wrapper.get('[aria-label="Copy code"]').trigger('click');
    await settle();

    const copied = wrapper.emitted('copy').at(-1)[0];
    expect(copied).toContain('enabled');
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(copied);
    vi.runAllTimers();
  });

  it('toggles a default-true section border and preserves explicit false copy output', async () => {
    const wrapper = await mountPlayground({
      component: ExampleSection,
      schema: sectionSchema,
    });
    const borderTop = findRegion(
      wrapper,
      sectionSchema,
      (candidate) => candidate.prop === 'borderTop',
    );

    expect(wrapper.get('.example-section').attributes('data-border-top')).toBe('true');
    await activateWithKeyboard(wrapper, borderTop);

    expect(wrapper.get('.example-section').attributes('data-border-top')).toBe('false');
    expect(wrapper.find('.component-playground-code__region--inactive').exists()).toBe(true);
    vi.useFakeTimers();
    await wrapper.get('[aria-label="Copy code"]').trigger('click');
    await settle();
    expect(wrapper.emitted('copy').at(-1)[0]).toContain(':border-top="false"');
    vi.runAllTimers();
  });

  it('edits meaningful text and HTML slots, copies them, and resets authored initial state', async () => {
    const initialState = {
      props: {
        borderTop: false,
        borderBottom: true,
        orientation: 'right',
      },
      slots: {
        title: 'State supplied by the host',
        default: '<p>Authored <strong>body copy</strong>.</p>',
      },
    };
    const wrapper = await mountPlayground({
      component: ExampleSection,
      schema: sectionSchema,
      initialState,
    });

    expect(wrapper.get('.example-section__title').text()).toBe('State supplied by the host');
    expect(wrapper.get('.example-section__content strong').text()).toBe('body copy');

    await editRegion(
      wrapper,
      sectionSchema,
      (candidate) => candidate.kind === 'slot-text' && candidate.slot === 'title',
      'Edited mission title',
    );
    await editRegion(
      wrapper,
      sectionSchema,
      (candidate) => candidate.kind === 'slot-text' && candidate.slot === 'default',
      '<p>Edited <em>HTML content</em>.</p>',
    );

    expect(wrapper.get('.example-section__title').text()).toBe('Edited mission title');
    expect(wrapper.get('.example-section__content em').text()).toBe('HTML content');

    vi.useFakeTimers();
    await wrapper.get('[aria-label="Copy code"]').trigger('click');
    await settle();
    const copied = wrapper.emitted('copy').at(-1)[0];
    expect(copied).toContain('<template #title>');
    expect(copied).toContain('Edited mission title');
    expect(copied).toContain('<p>Edited <em>HTML content</em>.</p>');
    vi.runAllTimers();
    vi.useRealTimers();

    await wrapper.get('.component-playground__action').trigger('click');
    await settle();

    expect(wrapper.get('.example-section__title').text()).toBe('State supplied by the host');
    expect(wrapper.get('.example-section__content strong').text()).toBe('body copy');
  });

  it('selects enums, closes them with Escape, and propagates appearance updates', async () => {
    const wrapper = await mountPlayground({
      appearance: 'dark',
      component: ExampleSection,
      schema: sectionSchema,
      style: {
        '--component-playground-background-color': '#071a1e',
      },
    });

    const orientation = findRegion(
      wrapper,
      sectionSchema,
      (candidate) => candidate.prop === 'orientation',
    );
    const nativeGetComputedStyle = globalThis.getComputedStyle;
    const computedStyleShim = vi
      .spyOn(globalThis, 'getComputedStyle')
      .mockImplementation((element) => {
        const computedStyle = nativeGetComputedStyle(element);

        return new Proxy(computedStyle, {
          get(target, property) {
            if (property === 'getPropertyValue') {
              return (name) => {
                if (name === '--_component-playground-background-color') {
                  return element
                    .closest('.component-playground')
                    ?.style.getPropertyValue('--component-playground-background-color');
                }

                return target.getPropertyValue(name);
              };
            }

            return Reflect.get(target, property, target);
          },
        });
      });
    await activateWithKeyboard(wrapper, orientation);
    computedStyleShim.mockRestore();

    let menu = document.body.querySelector('[role="group"]');
    expect(menu.dataset.appearance).toBe('dark');
    expect(menu.style.getPropertyValue('--component-playground-background-color')).toBe('#071a1e');

    menu.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    await settle();
    expect(document.body.querySelector('[role="group"]')).toBeNull();
    expect(wrapper.get('.example-section').attributes('data-orientation')).toBe('left');

    await selectEnum(
      wrapper,
      sectionSchema,
      (candidate) => candidate.prop === 'orientation',
      'right',
    );
    expect(wrapper.get('.example-section').attributes('data-orientation')).toBe('right');

    await wrapper.setProps({ appearance: 'light' });
    await settle();
    expect(wrapper.get('.component-playground').attributes('data-appearance')).toBe('light');
    expect(wrapper.get('.component-playground-code').attributes('data-appearance')).toBe('light');

    const updatedOrientation = findRegion(
      wrapper,
      sectionSchema,
      (candidate) => candidate.prop === 'orientation',
    );
    await activateWithKeyboard(wrapper, updatedOrientation);
    menu = document.body.querySelector('[role="group"]');
    expect(menu.dataset.appearance).toBe('light');
  });

  it('applies list presets and counts, then edits preview content and copied markup', async () => {
    const wrapper = await mountPlayground({
      component: ExampleList,
      schema: listSchema,
    });

    expect(wrapper.findAll('.component-playground__preview li')).toHaveLength(4);
    expect(wrapper.get('.component-playground__preview').text()).toContain('Keeps the ship flying');

    await selectEnum(
      wrapper,
      listSchema,
      (candidate) => candidate.control === 'contentPreset',
      'compact',
    );
    expect(wrapper.get('.component-playground__preview').text()).not.toContain(
      'Keeps the ship flying',
    );

    await selectEnum(wrapper, listSchema, (candidate) => candidate.control === 'itemCount', '2');
    await editRegion(
      wrapper,
      listSchema,
      (candidate) =>
        candidate.kind === 'array-prop-field' &&
        candidate.prop === 'items' &&
        candidate.index === 0 &&
        candidate.path === 'label',
      'Flight director',
    );
    await editRegion(
      wrapper,
      listSchema,
      (candidate) => candidate.kind === 'prop-value' && candidate.prop === 'header',
      'Edited crew',
    );

    expect(wrapper.findAll('.component-playground__preview li')).toHaveLength(2);
    expect(wrapper.get('.component-playground__preview h3').text()).toBe('Edited crew');
    expect(wrapper.get('.component-playground__preview li strong').text()).toBe('Flight director');

    vi.useFakeTimers();
    await wrapper.get('[aria-label="Copy code"]').trigger('click');
    await settle();
    const copied = wrapper.emitted('copy').at(-1)[0];
    expect(copied).toContain('header="Edited crew"');
    expect(copied).toContain("label: 'Flight director'");
    expect(copied.match(/label: '/g)).toHaveLength(2);
    expect(copied).not.toContain('content-preset');
    vi.runAllTimers();
  });

  it('updates declared grid columns and repeated boxes in preview and copied markup', async () => {
    const wrapper = await mountPlayground({
      component: ExampleGrid,
      schema: gridSchema,
    });

    expect(wrapper.findAll('.component-playground__preview article')).toHaveLength(3);
    expect(wrapper.get('.example-grid').attributes('data-columns')).toBe('3');

    await editRegion(
      wrapper,
      gridSchema,
      (candidate) => candidate.kind === 'prop-value' && candidate.prop === 'columns',
      '2',
    );
    await selectEnum(wrapper, gridSchema, (candidate) => candidate.control === 'boxCount', '4');

    const grid = wrapper.get('.example-grid');
    expect(grid.attributes('data-columns')).toBe('2');
    expect(grid.attributes('style')).toContain('--example-grid-columns: 2');
    expect(wrapper.findAll('.component-playground__preview article')).toHaveLength(4);

    vi.useFakeTimers();
    await wrapper.get('[aria-label="Copy code"]').trigger('click');
    await settle();
    const copied = wrapper.emitted('copy').at(-1)[0];
    expect(copied).toContain(':columns="2"');
    expect(copied.match(/<ExampleBox/g)).toHaveLength(4);
    expect(copied).not.toContain('box-count');
    vi.runAllTimers();
  });

  it('uses the default syntax pair and changes token themes without losing playground state', async () => {
    const wrapper = await mountPlayground({
      component: ExampleSection,
      schema: sectionSchema,
    });
    const defaultStyles = await waitForTokenStyles(wrapper);

    expect(
      defaultStyles.some((style) => style.includes('--component-playground-token-light')),
    ).toBe(true);
    expect(defaultStyles.some((style) => style.includes('--component-playground-token-dark'))).toBe(
      true,
    );

    await editRegion(
      wrapper,
      sectionSchema,
      (candidate) => candidate.kind === 'slot-text' && candidate.slot === 'title',
      'Theme-safe title',
    );
    const editedCode = editorView(wrapper).state.doc.toString();
    expect(wrapper.get('.example-section__title').text()).toBe('Theme-safe title');

    vi.useFakeTimers();
    await wrapper.get('[aria-label="Copy code"]').trigger('click');
    await settle();
    const copiedCode = wrapper.emitted('copy').at(-1)[0];
    vi.runAllTimers();
    vi.useRealTimers();

    const editedStyles = tokenStyles(wrapper);
    await wrapper.setProps({
      appearance: 'dark',
      syntaxThemes: contrastingSyntaxThemes,
    });
    await vi.waitFor(() => {
      expect(tokenStyles(wrapper)).not.toEqual(editedStyles);
    });

    expect(wrapper.get('.component-playground').attributes('data-appearance')).toBe('dark');
    expect(editorView(wrapper).state.doc.toString()).toBe(editedCode);
    expect(wrapper.get('.example-section__title').text()).toBe('Theme-safe title');
    expect(editorView(wrapper).state.doc.toString()).toContain('Theme-safe title');
    expect(wrapper.find('.component-playground-code__region').exists()).toBe(true);

    vi.useFakeTimers();
    await wrapper.get('[aria-label="Copy code"]').trigger('click');
    await settle();
    expect(wrapper.emitted('copy').at(-1)[0]).toBe(copiedCode);
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('keeps syntax theme choices independent between playground instances', async () => {
    const defaultWrapper = await mountPlayground({
      component: ExampleSection,
      schema: sectionSchema,
    });
    const contrastingWrapper = await mountPlayground({
      component: ExampleSection,
      schema: sectionSchema,
      syntaxThemes: contrastingSyntaxThemes,
    });

    const defaultStyles = await waitForTokenStyles(defaultWrapper);
    const contrastingStyles = await waitForTokenStyles(contrastingWrapper);

    expect(contrastingStyles).not.toEqual(defaultStyles);

    await contrastingWrapper.setProps({
      syntaxThemes: {
        light: githubLight,
        dark: githubDark,
      },
    });
    await vi.waitFor(() => {
      expect(tokenStyles(contrastingWrapper)).toEqual(defaultStyles);
    });
    expect(tokenStyles(defaultWrapper)).toEqual(defaultStyles);
  });

  it('ignores stale asynchronous themes after a newer pair finishes loading', async () => {
    const staleLight = deferred();
    const staleDark = deferred();
    const currentLight = deferred();
    const currentDark = deferred();
    const wrapper = await mountPlayground({
      component: ExampleSection,
      schema: sectionSchema,
      syntaxThemes: {
        light: () => staleLight.promise,
        dark: () => staleDark.promise,
      },
    });

    await wrapper.setProps({
      syntaxThemes: {
        light: () => currentLight.promise,
        dark: () => currentDark.promise,
      },
    });
    currentLight.resolve(vitesseLight);
    currentDark.resolve(vitesseDark);
    const currentStyles = await waitForTokenStyles(wrapper);

    staleLight.resolve(githubLight);
    staleDark.resolve(githubDark);
    await settle();

    expect(tokenStyles(wrapper)).toEqual(currentStyles);
  });

  it('keeps failed theme loads readable and editable', async () => {
    const wrapper = await mountPlayground({
      component: ExampleSection,
      schema: sectionSchema,
      syntaxThemes: {
        light: () => Promise.reject(new Error('light theme unavailable')),
        dark: () => Promise.reject(new Error('dark theme unavailable')),
      },
    });
    await settle();

    expect(tokenStyles(wrapper)).toHaveLength(0);
    expect(editorView(wrapper).state.doc.toString()).toContain('<ExampleSection');

    await editRegion(
      wrapper,
      sectionSchema,
      (candidate) => candidate.kind === 'slot-text' && candidate.slot === 'title',
      'Readable fallback',
    );

    expect(wrapper.get('.example-section__title').text()).toBe('Readable fallback');
    expect(editorView(wrapper).state.doc.toString()).toContain('Readable fallback');
  });

  it('cleans up an editor unmounted before asynchronous setup finishes', async () => {
    const wrapper = mount(ComponentPlayground, {
      attachTo: document.body,
      props: {
        component: markRaw(BooleanPreview),
        schema: booleanSchema,
      },
    });

    wrapper.unmount();
    await settle();

    expect(document.body.querySelector('.component-playground')).toBeNull();
    expect(document.body.querySelector('[role="group"]')).toBeNull();
  });
});
