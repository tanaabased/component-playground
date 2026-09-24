<script setup>
import ExampleSection from './components/ExampleSection.vue';
import { sectionSchema } from './example-schemas.js';

const vitePressCustomization = {
  '--component-playground-accent-color': 'var(--vp-c-brand-1)',
  '--component-playground-border-radius': '0.75rem',
};
</script>

# Installation

Component Playground has two installation paths. Plain Vue uses the standalone component and
stylesheet. VitePress adds a theme wrapper, shared syntax configuration, and an integration
stylesheet. Pick the path your application actually runs; loading both and hoping CSS develops good
judgment is not a strategy.

## Vue

Install the package in an existing Vue 3.5 or later application:

```sh
npm install @tanaab/component-playground
```

Import the public component and standalone stylesheet in the Vue component that owns the example:

```vue
<script setup>
import { ComponentPlayground } from '@tanaab/component-playground';
import '@tanaab/component-playground/style.css';

import ExamplePanel from './ExamplePanel.vue';

const schema = {
  name: 'ExamplePanel',
  props: {
    visible: { kind: 'boolean', default: true },
  },
  slots: {
    default: { kind: 'text', default: 'Editable body copy.' },
  },
};
</script>

<template>
  <ComponentPlayground :component="ExamplePanel" :schema="schema" />
</template>
```

- **Stylesheet:** `@tanaab/component-playground/style.css`
- **Appearance:** `auto` follows the operating system color scheme. Set `appearance="light"` or
  `appearance="dark"` when the surrounding application has a fixed mode.

[Open the standalone Vue example](/plain-vue/). It is built as a separate application and does not
load VitePress or `@tanaab/component-playground/vitepress.css`.

### Try it

In the standalone example, edit the default slot text, toggle the `visible` Boolean off and back on,
use **copy**, then use **reset**. The preview should disappear only while `visible` is off and return
with the edited body text. Copied markup should contain that text and the `visible` attribute; reset
should restore the original body copy.

## VitePress

Install the package and Shiki in an existing VitePress 1 site. Shiki is listed directly because the
configuration imports its public theme modules instead of leaning on a transitive dependency like a
drunk against a bulkhead.

```sh
npm install @tanaab/component-playground shiki
```

Create one syntax-theme module for both Markdown and playground code:

```js
// docs/syntax-themes.js
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';

export const syntaxThemes = {
  light: githubLight,
  dark: githubDark,
};
```

Use that pair in the VitePress configuration:

```js
// docs/.vitepress/config.js
import { defineConfig } from 'vitepress';

import { syntaxThemes } from '../syntax-themes.js';

export default defineConfig({
  markdown: {
    theme: syntaxThemes,
  },
});
```

Extend the active theme with the public wrapper, both public stylesheets, and VitePress's reactive
appearance source:

```js
// docs/.vitepress/theme/index.js
import '@tanaab/component-playground/style.css';
import { withComponentPlayground } from '@tanaab/component-playground/vitepress';
import '@tanaab/component-playground/vitepress.css';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import { syntaxThemes } from '../../syntax-themes.js';

export default withComponentPlayground(DefaultTheme, {
  syntaxThemes,
  useData,
});
```

Markdown pages can now use the globally registered component. This example also overrides two CSS
variables on one instance; the demonstrated component keeps its own styles.

<ComponentPlayground
  :component="ExampleSection"
  :schema="sectionSchema"
  :style="vitePressCustomization"
  source="https://github.com/tanaabased/component-playground/blob/main/docs/components/ExampleSection.vue"
/>

- **Stylesheets:** `@tanaab/component-playground/style.css` provides structure and standalone
  defaults; `@tanaab/component-playground/vitepress.css` maps the wrapper to VitePress variables.
- **Appearance:** `withComponentPlayground` uses `useData().isDark`, so the playground follows the
  active VitePress appearance rather than the operating system setting.
- **Customization:** the live example sets `--component-playground-accent-color` and
  `--component-playground-border-radius` on that instance.

### Try it

Edit the title slot, toggle the `border-top` Boolean off and back on, use **copy**, then use
**reset**. The preview heading and border should follow those edits. Copied markup should contain
the edited title and `border-top`; reset should restore the original title and Boolean state. Switch
the site's appearance as a separate check: the playground chrome and syntax colors should follow it.

These exercises are review aids for the Netlify preview. The component test suite owns interaction
behavior; the package checks install one candidate tarball into separate Vue and VitePress consumers
and build both through the public imports shown above.
