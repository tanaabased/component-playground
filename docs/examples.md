<script setup>
import { computed, markRaw, ref } from 'vue';

import ExampleBox from './components/ExampleBox.vue';
import ExampleGrid from './components/ExampleGrid.vue';
import ExampleList from './components/ExampleList.vue';
import ExampleSection from './components/ExampleSection.vue';
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
      default: '<p>Its controls change <strong>visible structure</strong>, not decorative trivia.</p>',
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

const eventInitialState = {
  props: {
    borderTop: false,
    borderBottom: true,
    orientation: 'right',
  },
  slots: {
    title: 'State supplied by the host',
    default: '<p>This content survives reset because it is part of <strong>initial state</strong>.</p>',
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

Edit the underlined values in each code block. Enum values open a selector; Boolean attributes
toggle when clicked. Copy returns ordinary component usage without playground-only controls.

These examples adapt Tanaab's
[section](https://github.com/tanaabased/theme/blob/main/components/TMSSection.vue),
[grid](https://github.com/tanaabased/theme/blob/main/components/TMSGrid.vue),
[box](https://github.com/tanaabased/theme/blob/main/components/TMSBox.vue), and
[list](https://github.com/tanaabased/theme/blob/main/components/TMSList.vue) components. They retain
the stock VitePress theme and use its `--vp-c-*` variables; no replacement theme is required.

## Section borders, orientation, and slots

Both playgrounds expose meaningful title and content slots, two border states, and section
orientation. The first also exposes syntax-theme and appearance selectors while leaving package CSS
variables at their defaults. The second changes only this playground's chrome with instance-level
variables.

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
      :component="ExampleSection"
      :schema="sectionSchema"
      :source="`${sourceBase}/ExampleSection.vue`"
      :syntax-themes="selectedSyntaxThemes"
    />
  </section>
  <section>
    <h3>Tanaab-flavored override</h3>
    <ComponentPlayground
      :component="ExampleSection"
      :schema="sectionSchema"
      :source="`${sourceBase}/ExampleSection.vue`"
      :style="tanaabPlaygroundStyle"
      appearance="dark"
    />
  </section>
</div>

::: tip Try it
In **Package defaults**, toggle `border-top` and `border-bottom`, then change `orientation`. The
preview's top and bottom rules should follow the Boolean states, and the title should move to the
opposite side on a wide screen. Edit both slot bodies and copy the code; the preview and copied
markup should contain those edits.
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

## Grid columns and repeated boxes

The number prop declares the real CSS grid column count. The demonstration-only `boxCount` control
changes how many `ExampleBox` children appear; `auto` derives the child count from `columns`.

<ComponentPlayground
  :component="ExampleGrid"
  :schema="gridSchema"
  :source="`${sourceBase}/ExampleGrid.vue`"
/>

::: tip Try it
Change `columns` from `3` to `2`, then select `4` for `box-count`. The preview should become a
two-column grid containing four boxes, and copied markup should contain four `ExampleBox` children.
:::

## List presets and editable content

The list combines a string prop, enum props, object-array presets, a visible-item count, and editable
item fields. Its column and orientation values change actual layout state rather than narrating what
the component might hypothetically do. An inspiring advance for software everywhere.

<ComponentPlayground
  :component="ExampleList"
  :schema="listSchema"
  :source="`${sourceBase}/ExampleList.vue`"
  preview-fit="contained"
/>

::: tip Try it
Select the `compact` content preset, set `item-count` to `2`, then edit the first label. The details
should disappear, two edited items should remain, and copied markup should contain exactly those
items. Change `columns` or `orientation` to verify the declared list layout in the preview.
:::

Use **reset** beneath any example to restore its schema defaults. The border appearance and grid or
list layout are human checks here; automated checks cover the corresponding DOM attributes, state,
child counts, preview content, and copied markup.

## Events and initial state

This example starts from host-supplied state rather than `sectionSchema` defaults. Edit it, then use
**reset** to restore those supplied values. The panels below show the `copy` string and latest
`update:state` payload, which makes the integration observable without divination or interpretive
dance.

<ComponentPlayground
:component="ExampleSection"
:schema="sectionSchema"
:initial-state="eventInitialState"
:source="`${sourceBase}/ExampleSection.vue`"
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
