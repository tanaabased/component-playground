# Guide

Component Playground renders a Vue component beside editable, copyable usage markup. The package is
independent of VitePress; this site uses the stock VitePress theme as one ordinary consumer.

## Install

```sh
npm install @tanaab/component-playground
```

Vue 3.5 or later is required as a peer dependency.

## Minimal Vue usage

Import the component and its optional structural stylesheet, then supply a component and schema:

```vue
<template>
  <ComponentPlayground
    :component="ExampleButton"
    :schema="schema"
    source="https://github.com/example/project/blob/main/ExampleButton.vue"
  />
</template>

<script setup>
import { ComponentPlayground } from '@tanaab/component-playground';
import '@tanaab/component-playground/style.css';

import ExampleButton from './ExampleButton.vue';

const schema = {
  name: 'ExampleButton',
  props: {
    label: { kind: 'string', default: 'Continue' },
    disabled: { kind: 'boolean', default: false },
  },
};
</script>
```

The source URL is explicit because the package cannot know where its consumer keeps source files.
This deliberately replaces the original theme playground's automatic source-link inference: pass a
URL when a source link is useful, or omit `source` when it is not.

## Component API

`ComponentPlayground` takes the following props:

| Prop            | Required | Description                                                                        |
| --------------- | -------- | ---------------------------------------------------------------------------------- |
| `component`     | Yes      | The Vue component to render in the preview.                                        |
| `schema`        | Yes      | The component name plus the props, slots, and optional controls to expose.         |
| `source`        | No       | An explicit URL for the **source** link. It replaces theme-aware source inference. |
| `initial-state` | No       | Initial `controls`, `props`, and `slots` values that override schema defaults.     |
| `preview-fit`   | No       | `full` (the default) or `contained` for a bounded preview area.                    |
| `appearance`    | No       | `auto` (default), `light`, or `dark` for the playground chrome and enum menus.     |
| `syntax-themes` | No       | A light/dark pair of Shiki theme registrations or lazy registration loaders.       |

The playground does not receive Vue slots of its own. Instead, describe the preview component's
slots in `schema.slots`; `text` values are escaped, while `html` values render as trusted HTML.
The schema reference documents [all supported prop and slot shapes](/reference#schema-shape).

## Appearance and customization

`auto` follows the operating system's `prefers-color-scheme` setting. Use an explicit appearance
when the surrounding surface already has a fixed mode, then set CSS variables on the instance or an
ancestor for local customization:

```vue
<ComponentPlayground
  appearance="dark"
  class="product-playground"
  :component="ExampleButton"
  :schema="schema"
/>

<style>
.product-playground {
  --component-playground-accent-color: #8be9fd;
  --component-playground-focus-color: #f1fa8c;
  --component-playground-border-radius: 0.75rem;
}
</style>
```

The variables style playground controls and code, not the demonstrated component. Enum menus are
teleported to `body`, but copy their owning instance's resolved variables when opened. See the
[styling contract](/reference#styling-contract) for the complete variable table.

## Syntax highlighting

The default `github-light` and `github-dark` pair loads lazily when `syntax-themes` is omitted. To use
another pair, import only those theme registrations and pass them to the playground:

```vue
<script setup>
import vitesseDark from 'shiki/themes/vitesse-dark.mjs';
import vitesseLight from 'shiki/themes/vitesse-light.mjs';

const syntaxThemes = {
  light: vitesseLight,
  dark: vitesseDark,
};
</script>

<template>
  <ComponentPlayground :component="ExampleButton" :schema="schema" :syntax-themes="syntaxThemes" />
</template>
```

Theme registrations use Shiki's ordinary `{ light, dark }` shape, so one exported pair can also feed
a compatible Markdown renderer such as VitePress's `markdown.theme`. Exact theme imports keep the
consumer bundle bounded to the selected pair; importing Shiki's complete theme registry is neither
required nor recommended.

## State, reset, and events

Schema defaults establish the starting state. `initial-state` can replace any declared control,
prop, or slot value; an explicitly supplied object-array prop is retained instead of being replaced
by a control-derived preset. **Reset** restores that same resolved initial state, not merely the
bare schema defaults. Changing `schema` or `initial-state` also resets the playground.

Listen for `update:state` to observe every edit, selection, boolean toggle, or control-driven
update. Its payload has `{ controls, props, slots }`. **Copy** writes the clean component usage to
the clipboard and emits the same string as `copy`.

```vue
<ComponentPlayground
  :component="ExampleButton"
  :schema="schema"
  :initial-state="{ props: { label: 'Start here' } }"
  @copy="(usage) => console.log('Copied:', usage)"
  @update:state="(state) => console.log('Current state:', state)"
/>
```

See the [live event and initial-state example](/examples#events-and-initial-state) and the
[interaction reference](/reference#interaction-and-keyboard-behavior).

## VitePress usage

Use the optional VitePress helper and stylesheet in a local theme extension. The helper registers
the existing standalone component, supplies the shared Shiki pair, and follows VitePress's reactive
appearance instead of the operating system:

```js
// docs/.vitepress/theme/index.js
import '@tanaab/component-playground/style.css';
import { withComponentPlayground } from '@tanaab/component-playground/vitepress';
import '@tanaab/component-playground/vitepress.css';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import { syntaxThemePairs } from '../../syntax-themes.js';

export default withComponentPlayground(DefaultTheme, {
  syntaxThemes: syntaxThemePairs.github,
  useData,
});
```

Use that same resolved pair in VitePress's Markdown configuration:

```js
// docs/.vitepress/config.js
import { defineConfig } from 'vitepress';

import { syntaxThemePairs } from '../syntax-themes.js';

export default defineConfig({
  markdown: { theme: syntaxThemePairs.github },
});
```

Static Markdown code is highlighted during the site build. Switching VitePress appearance selects
the corresponding colors already generated for that pair; changing a playground's `syntaxThemes`
prop at runtime does not recolor existing Markdown. A live Markdown renderer would be an absurdly
large machine for this tiny job, so the integration does not add one.

Markdown pages can then use `<ComponentPlayground>` with page-local schemas and imported example
components. See the [capability examples](/examples) for the complete proof of concept and the
[schema reference](/reference) for supported shapes.
