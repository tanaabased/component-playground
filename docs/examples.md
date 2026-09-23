<script setup>
import { computed, ref } from 'vue';

import ShowcaseCard from './components/ShowcaseCard.vue';
import ShowcaseItem from './components/ShowcaseItem.vue';
import ShowcaseList from './components/ShowcaseList.vue';
import ShowcaseStack from './components/ShowcaseStack.vue';
import { syntaxThemePairs } from './syntax-themes.js';

const sourceBase =
  'https://github.com/tanaabased/component-playground/blob/main/docs/components';

const tanaabPlaygroundStyle = {
  '--component-playground-background-color': '#071a1e',
  '--component-playground-foreground-color': '#e7fff8',
  '--component-playground-muted-color': '#9cc8be',
  '--component-playground-border-color': '#176b5a',
  '--component-playground-accent-color': '#00c88a',
  '--component-playground-hover-background-color': '#0d332f',
  '--component-playground-active-background-color': '#12523f',
  '--component-playground-focus-color': '#db2777',
  '--component-playground-font-family': 'Inter, ui-sans-serif, system-ui, sans-serif',
  '--component-playground-monospace-font-family':
    'Berkeley Mono, ui-monospace, SFMono-Regular, Consolas, monospace',
  '--component-playground-border-radius': '0.75rem',
  '--component-playground-control-padding-inline': '0.75rem',
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
const selectedAppearance = ref('light');
const selectedSyntaxThemePair = ref('github');
const selectedSyntaxThemes = computed(() => syntaxThemePairs[selectedSyntaxThemePair.value]);

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

## Props, slots, and standalone styles

These playgrounds use the same component and schema. The first exposes syntax-theme and appearance
selectors while leaving every CSS variable at its package default. The second fixes the chrome to
dark mode and applies a Tanaab-flavored set of instance variables. Edit either example and open its
`tone` selector: the floating menu should match its owning playground rather than inheriting the
other instance's styles. Together they also cover string, number, enum, and boolean props; a default
text slot; and named text and HTML slots.

<div class="playground-style-comparison">
  <section>
    <h3>Package defaults</h3>
    <div class="playground-settings">
      <label>
        Syntax theme pair
        <select v-model="selectedSyntaxThemePair">
          <option value="github">GitHub</option>
          <option value="vitesse">Vitesse</option>
        </select>
      </label>
      <label>
        Appearance
        <select v-model="selectedAppearance">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </div>
    <ComponentPlayground
      :appearance="selectedAppearance"
      :component="ShowcaseCard"
      :schema="cardSchema"
      :source="`${sourceBase}/ShowcaseCard.vue`"
      :syntax-themes="selectedSyntaxThemes"
    />
  </section>
  <section>
    <h3>Tanaab-flavored override</h3>
    <ComponentPlayground
      :component="ShowcaseCard"
      :schema="cardSchema"
      :source="`${sourceBase}/ShowcaseCard.vue`"
      :style="tanaabPlaygroundStyle"
      appearance="dark"
    />
  </section>
</div>

::: tip Try it
In **Package defaults**, edit a value, choose another syntax theme pair, switch appearance, and copy
the code. The edit, component preview, and copied component usage should remain intact. Only the code
tokens change with the syntax pair; playground chrome remains governed by appearance and CSS
variables. The neighboring playground keeps its own syntax pair.
:::

The customized instance is ordinary Vue; no theme provider or global stylesheet is involved:

```vue
<ComponentPlayground
  appearance="dark"
  :style="{
    '--component-playground-background-color': '#071a1e',
    '--component-playground-foreground-color': '#e7fff8',
    '--component-playground-border-color': '#176b5a',
    '--component-playground-accent-color': '#00c88a',
    '--component-playground-focus-color': '#db2777',
    '--component-playground-border-radius': '0.75rem',
  }"
/>
```

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

<style scoped>
.playground-style-comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.playground-style-comparison section,
.playground-style-comparison h3 {
  min-width: 0;
  margin-top: 0;
}

.playground-settings {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.playground-settings label {
  display: grid;
  gap: 0.25rem;
}

@media (max-width: 720px) {
  .playground-style-comparison {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
