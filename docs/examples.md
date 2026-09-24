<script setup>
import { computed, ref } from 'vue';
import { ComponentPlayground as StandaloneComponentPlayground } from '@tanaab/component-playground';

import ExampleBox from './components/ExampleBox.vue';
import ExampleComparison from './components/ExampleComparison.vue';
import ExampleGrid from './components/ExampleGrid.vue';
import ExampleList from './components/ExampleList.vue';
import ExampleLogo from './components/ExampleLogo.vue';
import ExampleSection from './components/ExampleSection.vue';
import {
  boxSchema,
  gridSchema,
  listSchema,
  logoSchema,
  sectionSchema,
} from './example-schemas.js';
import { syntaxThemePairs } from './syntax-themes.js';

const sourceBase =
  'https://github.com/tanaabased/component-playground/blob/main/docs/components';

const integratedHtmlSchema = {
  name: 'article',
  props: {
    class: { kind: 'enum', options: ['launch-card', 'mission-card'], default: 'launch-card' },
  },
  slots: {
    default: {
      kind: 'html',
      default: '<h3>Launch sequence</h3>\n  <p>All systems are ready.</p>',
    },
  },
};

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
[box](https://github.com/tanaabased/theme/blob/main/components/TMSBox.vue),
[list](https://github.com/tanaabased/theme/blob/main/components/TMSList.vue), and
[logo](https://github.com/tanaabased/theme/blob/main/components/TMSLogo.vue) components. The logo
uses Tanaab's four upstream SVG layouts: left, right, centered, and mark.
They retain the stock VitePress theme and use its `--vp-c-*` variables; no replacement theme is
required.

## VitePress appearance and syntax integration

The static Markdown block and the editable playground start with identical HTML. Both receive the
GitHub light/dark Shiki pair from this site's shared configuration, while the optional VitePress
stylesheet maps the playground's code surface, typography, borders, controls, and floating menus to
VitePress variables.

<ExampleComparison>
  <template #static>

<!-- prettier-ignore -->
```html
<article
  class="launch-card">
  <h3>Launch sequence</h3>
  <p>All systems are ready.</p>
</article>
```

  </template>
  <template #editable>
    <ComponentPlayground component="article" :schema="integratedHtmlSchema" />
  </template>
</ExampleComparison>

::: tip Try it on the Netlify preview
Switch the site's appearance, then activate the `class` value in the editable example to open its
enum menu. The playground, syntax colors, controls, and teleported menu should follow the selected
site appearance even when it differs from the operating system.
:::

Markdown highlighting is generated at site build time. The runtime `syntaxThemes` selector below
can recolor that playground, but it cannot recolor the static block above; the integration does not
smuggle in a live Markdown renderer merely to pretend otherwise.

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
    <StandaloneComponentPlayground
      :appearance="selectedAppearance"
      :component="ExampleSection"
      :schema="sectionSchema"
      :source="`${sourceBase}/ExampleSection.vue`"
      :syntax-themes="selectedSyntaxThemes"
    />
  </section>
  <section>
    <h3>Tanaab-flavored override</h3>
    <StandaloneComponentPlayground
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

## Box type, link, and content

The box preserves both upstream content treatments and switches between a plain container and an
anchor when `link` has a value. Its default slot remains ordinary editable text.

<ComponentPlayground
  :component="ExampleBox"
  :schema="boxSchema"
  :source="`${sourceBase}/ExampleBox.vue`"
  preview-fit="contained"
/>

::: tip Try it
Change `type` from `title` to `content`, edit the slot text, then clear and restore `link`. The
preview should switch treatments, the linked box should use an anchor, and copied markup should
contain the selected type, link, and content.
:::

## Grid columns and repeated boxes

The upstream grid accepts numeric or numeric-string column counts from `1` through `6`; this
playground exposes the number form so it also retains number-prop editing. The demonstration-only
`boxCount` control renders up to twelve `ExampleBox` children; `auto` derives the child count from
`columns`. Per-item props mix links, box types, and VitePress-token colors while preserving the
box component's upstream API.

<ComponentPlayground
  :component="ExampleGrid"
  :schema="gridSchema"
  :source="`${sourceBase}/ExampleGrid.vue`"
/>

::: tip Try it
Change `columns` from `4` to `6`, then select `12` for `box-count`. The preview should become a
six-column grid containing two full rows of colored boxes, and copied markup should contain twelve
`ExampleBox` children with their individual links, types, and styles. Try `7` as well; odd counts are
allowed, despite the grid gods' predictable disapproval.
:::

## List presets and editable content

The list exposes every upstream prop: header text and link, column and orientation modes, plus up to
twelve editable item labels, links, and safe link attributes. The linked preset mixes internal,
external, email, and download links; the plain preset removes links entirely. Presets and item count
remain demonstration-only controls and do not leak into copied component usage.

<ComponentPlayground
  :component="ExampleList"
  :schema="listSchema"
  :source="`${sourceBase}/ExampleList.vue`"
  preview-fit="contained"
/>

::: tip Try it
Set `item-count` to `12` and inspect the internal, external, email, and download links. Then select
the `plain` content preset, set `item-count` to `7`, and edit the first label and link. Change
`header-link`, `columns`, and `orientation`. The preview should contain exactly seven edited items,
links should appear only when provided, and copied markup should contain the selected layout, header,
items, and safe nested attributes.
:::

Use **reset** beneath any example to restore its schema defaults. The border appearance and grid or
list layout are human checks here; automated checks cover the corresponding DOM attributes, state,
child counts, preview content, and copied markup.

## Logo layout, color, background, and link

The logo preserves all four upstream `type` values without requiring the Tanaab theme. Its color
defaults to the stock VitePress text variable, its background defaults to transparent, the root link
has a useful accessible name, and each decorative SVG stays hidden from assistive technology.

<ComponentPlayground
  :component="ExampleLogo"
  :schema="logoSchema"
  :source="`${sourceBase}/ExampleLogo.vue`"
  preview-fit="contained"
/>

::: tip Try it
Change `type` through `left`, `right`, `centered`, and `mark`; then set `color` to `#db2777`,
`background` to `#fff7ed`, and `link` to `https://github.com/tanaabased`. The preview should use each
real logo layout and the new presentation values, while copied markup should contain all four props.
:::

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
