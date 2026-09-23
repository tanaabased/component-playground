<script setup>
import ShowcaseCard from './components/ShowcaseCard.vue';
import ShowcaseItem from './components/ShowcaseItem.vue';
import ShowcaseList from './components/ShowcaseList.vue';
import ShowcaseStack from './components/ShowcaseStack.vue';
import { ref } from 'vue';

const sourceBase =
  'https://github.com/tanaabased/component-playground/blob/main/docs/components';

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
        {
          path: 'meta.role',
          kind: 'enum',
          options: ['Engineer', 'Designer', 'Writer'],
        },
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
      component: ShowcaseItem,
      componentName: 'ShowcaseItem',
      props: { quiet: true },
      items: ['First child', 'Second child', 'Third child'],
      countControl: 'childCount',
      autoCountProp: 'columns',
      defaultCount: 2,
    },
  },
};

const eventInitialState = {
  props: {
    heading: 'State supplied by the host',
    count: 7,
    tone: 'accent',
  },
  slots: {
    default: 'This value survives reset because it is part of initial state.',
  },
};

const copiedUsage = ref('Nothing copied yet.');
const observedState = ref(null);

function recordCopy(usage) {
  copiedUsage.value = usage;
}

function recordState(state) {
  observedState.value = state;
}
</script>

# Capability examples

Edit the underlined values in each code block. Enum values open a small selector; boolean attributes
toggle when clicked. Copy returns ordinary component usage without playground-only controls.

## Props and text or HTML slots

This full-width preview covers string, number, enum, and boolean props; a default text slot; and
named text and HTML slots.

<ComponentPlayground
  :component="ShowcaseCard"
  :schema="cardSchema"
  :source="`${sourceBase}/ShowcaseCard.vue`"
/>

## Object arrays and demonstration controls

This contained preview covers editable object-array fields, including a nested enum field, plus
demonstration-only selectors that choose a preset and visible item count. It also covers a named
text slot and a default HTML slot.

<ComponentPlayground
  :component="ShowcaseList"
  :schema="listSchema"
  :source="`${sourceBase}/ShowcaseList.vue`"
  preview-fit="contained"
/>

## Repeated children

The `childCount` control changes how many child components are generated. Selecting `auto` derives
the count from the editable `columns` prop.

<ComponentPlayground
  :component="ShowcaseStack"
  :schema="stackSchema"
  :source="`${sourceBase}/ShowcaseStack.vue`"
/>

Use **reset** beneath any example to restore its schema defaults. Each **source** link is supplied by
the page rather than inferred by the package.

## Events and initial state

This example starts from host-supplied state rather than `cardSchema` defaults. Edit it, then use
**reset** to restore those supplied values. The panels below show the `copy` string and latest
`update:state` payload, which makes the integration observable without ceremonial guesswork.

<ComponentPlayground
:component="ShowcaseCard"
:schema="cardSchema"
:initial-state="eventInitialState"
:source="`${sourceBase}/ShowcaseCard.vue`"
@copy="recordCopy"
@update:state="recordState"
/>

### Latest `copy` payload

<pre><code>{{ copiedUsage }}</code></pre>

### Latest `update:state` payload

<pre><code>{{ JSON.stringify(observedState, null, 2) }}</code></pre>

The package exposes these events but does not own the host's persistence policy: store, inspect, or
ignore the observed state as the consuming application requires.
