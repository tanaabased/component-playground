import { EditorView } from '@codemirror/view';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, markRaw, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';

import ComponentPlayground from '../components/ComponentPlayground.vue';
import ShowcaseCard from '../docs/components/ShowcaseCard.vue';
import ShowcaseItem from '../docs/components/ShowcaseItem.vue';
import ShowcaseList from '../docs/components/ShowcaseList.vue';
import ShowcaseStack from '../docs/components/ShowcaseStack.vue';
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

const cardSchema = {
  name: 'ShowcaseCard',
  props: {
    heading: { kind: 'string', default: 'Editable card' },
    count: { kind: 'number', default: 3 },
    tone: { kind: 'enum', options: ['neutral', 'accent'], default: 'neutral' },
    visible: { kind: 'boolean', default: true },
  },
  slots: {
    eyebrow: { kind: 'text', default: 'Named text slot' },
    title: { kind: 'html', default: '<strong>Named HTML slot</strong>' },
    default: { kind: 'text', default: 'Default text slot.' },
  },
};

const listSchema = {
  name: 'ShowcaseList',
  controls: {
    contentPreset: {
      kind: 'enum',
      options: ['brief', 'detailed'],
      default: 'detailed',
    },
    visibleItems: {
      kind: 'enum',
      options: ['1', '2', '3'],
      default: '3',
    },
  },
  props: {
    items: {
      kind: 'object-array',
      presetControl: 'contentPreset',
      countControl: 'visibleItems',
      defaultPreset: 'detailed',
      defaultCount: 3,
      presets: {
        brief: [
          { label: 'Ada', meta: { role: 'Engineer' } },
          { label: 'Grace', meta: { role: 'Writer' } },
          { label: 'Evelyn', meta: { role: 'Designer' } },
        ],
        detailed: [
          { label: 'Ada', meta: { role: 'Engineer' }, note: 'Builds useful things' },
          { label: 'Grace', meta: { role: 'Writer' }, note: 'Explains difficult things' },
          { label: 'Evelyn', meta: { role: 'Designer' }, note: 'Makes them comprehensible' },
        ],
      },
      fields: [
        { path: 'label', kind: 'string' },
        { path: 'meta.role', kind: 'enum', options: ['Engineer', 'Designer', 'Writer'] },
        { path: 'note', kind: 'string', optional: true },
      ],
    },
  },
  slots: {
    heading: { kind: 'text', default: 'Named text heading' },
    default: { kind: 'html', default: '<em>Default HTML slot.</em>' },
  },
};

const stackSchema = {
  name: 'ShowcaseStack',
  controls: {
    childCount: {
      kind: 'enum',
      options: ['1', '2', '3', 'auto'],
      default: '2',
    },
  },
  props: {
    columns: { kind: 'number', default: 3 },
  },
  slots: {
    default: {
      kind: 'repeat',
      component: markRaw(ShowcaseItem),
      componentName: 'ShowcaseItem',
      props: { quiet: true },
      items: ['First child', 'Second child', 'Third child'],
      countControl: 'childCount',
      autoCountProp: 'columns',
      defaultCount: 2,
    },
  },
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

  it('toggles a default-true demo prop by keyboard and preserves explicit false copy output', async () => {
    const wrapper = await mountPlayground({
      component: ShowcaseCard,
      schema: cardSchema,
    });
    const visible = findRegion(wrapper, cardSchema, (candidate) => candidate.prop === 'visible');

    expect(wrapper.find('.component-playground__preview article').exists()).toBe(true);
    await activateWithKeyboard(wrapper, visible);

    expect(wrapper.find('.component-playground__preview article').exists()).toBe(false);
    vi.useFakeTimers();
    await wrapper.get('[aria-label="Copy code"]').trigger('click');
    await settle();
    expect(wrapper.emitted('copy').at(-1)[0]).toContain(':visible="false"');
    vi.runAllTimers();
  });

  it('edits text and number regions, emits state, and resets to authored initial state', async () => {
    const initialState = {
      props: {
        heading: 'State supplied by the host',
        count: 7,
        tone: 'accent',
      },
      slots: {
        default: 'Authored body copy.',
      },
    };
    const wrapper = await mountPlayground({
      component: ShowcaseCard,
      schema: cardSchema,
      initialState,
    });

    expect(wrapper.get('article footer').text()).toContain('7 items');
    expect(wrapper.get('article p').text()).toBe('Authored body copy.');

    await editRegion(
      wrapper,
      cardSchema,
      (candidate) => candidate.kind === 'prop-value' && candidate.prop === 'count',
      '11',
    );
    await editRegion(
      wrapper,
      cardSchema,
      (candidate) => candidate.kind === 'prop-value' && candidate.prop === 'heading',
      'Edited heading',
    );

    expect(wrapper.get('article footer').text()).toContain('11 items');
    expect(latestState(wrapper, cardSchema).props.heading).toBe('Edited heading');

    await wrapper.get('.component-playground__action').trigger('click');
    await settle();

    expect(wrapper.get('article footer').text()).toContain('7 items');
    expect(latestState(wrapper, cardSchema).props.heading).toBe('State supplied by the host');
  });

  it('selects enums, closes them with Escape, and propagates appearance updates', async () => {
    const wrapper = await mountPlayground({
      appearance: 'dark',
      component: ShowcaseCard,
      schema: cardSchema,
      style: {
        '--component-playground-background-color': '#071a1e',
      },
    });

    const tone = findRegion(wrapper, cardSchema, (candidate) => candidate.prop === 'tone');
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
    await activateWithKeyboard(wrapper, tone);
    computedStyleShim.mockRestore();

    let menu = document.body.querySelector('[role="group"]');
    expect(menu.dataset.appearance).toBe('dark');
    expect(menu.style.getPropertyValue('--component-playground-background-color')).toBe('#071a1e');

    menu.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    await settle();
    expect(document.body.querySelector('[role="group"]')).toBeNull();
    expect(wrapper.get('article').attributes('data-tone')).toBe('neutral');

    await selectEnum(wrapper, cardSchema, (candidate) => candidate.prop === 'tone', 'accent');
    expect(wrapper.get('article').attributes('data-tone')).toBe('accent');

    await wrapper.setProps({ appearance: 'light' });
    await settle();
    expect(wrapper.get('.component-playground').attributes('data-appearance')).toBe('light');
    expect(wrapper.get('.component-playground-code').attributes('data-appearance')).toBe('light');

    const updatedTone = findRegion(wrapper, cardSchema, (candidate) => candidate.prop === 'tone');
    await activateWithKeyboard(wrapper, updatedTone);
    menu = document.body.querySelector('[role="group"]');
    expect(menu.dataset.appearance).toBe('light');
  });

  it('applies object-array preset and count controls to the ShowcaseList preview', async () => {
    const wrapper = await mountPlayground({
      component: ShowcaseList,
      schema: listSchema,
    });

    expect(wrapper.findAll('.component-playground__preview li')).toHaveLength(3);
    expect(wrapper.get('.component-playground__preview').text()).toContain('Builds useful things');

    await selectEnum(
      wrapper,
      listSchema,
      (candidate) => candidate.control === 'contentPreset',
      'brief',
    );
    expect(wrapper.get('.component-playground__preview').text()).not.toContain(
      'Builds useful things',
    );

    await selectEnum(wrapper, listSchema, (candidate) => candidate.control === 'visibleItems', '1');
    expect(wrapper.findAll('.component-playground__preview li')).toHaveLength(1);
  });

  it('updates repeated ShowcaseStack children through the real count control', async () => {
    const wrapper = await mountPlayground({
      component: ShowcaseStack,
      schema: stackSchema,
    });

    expect(wrapper.findAll('.component-playground__preview article')).toHaveLength(2);
    await selectEnum(wrapper, stackSchema, (candidate) => candidate.control === 'childCount', '3');

    expect(wrapper.findAll('.component-playground__preview article')).toHaveLength(3);
    expect(
      editorView(wrapper)
        .state.doc.toString()
        .match(/<ShowcaseItem/g),
    ).toHaveLength(3);
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
