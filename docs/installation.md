<script setup>
import { ComponentPlayground as VueComponentPlayground } from '@tanaab/component-playground';

import ExampleSection from './components/ExampleSection.vue';
import { sectionSchema } from './example-schemas.js';

const exampleSource =
  'https://github.com/tanaabased/component-playground/blob/main/docs/components/ExampleSection.vue';

const vitePressCustomization = {
  '--component-playground-accent-color': 'var(--vp-c-brand-1)',
  '--component-playground-border-radius': '0.75rem',
};
</script>

# Installation

Component Playground is one Vue component with two explicit consumption paths. Vue applications
import it directly with the standalone stylesheet. VitePress sites can add an optional theme
adapter, shared syntax configuration, and integration stylesheet. The live examples below use the
same component and schema so the integration is the only meaningful difference.

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

- **Component:** the public Vue export, imported directly as `VueComponentPlayground` on this page.
- **Stylesheet:** `@tanaab/component-playground/style.css`.
- **Appearance:** `auto` follows the operating system color scheme. Set `appearance="light"` or
  `appearance="dark"` when the surrounding application has a fixed mode.
- **VitePress integration:** none. This instance has no `data-vitepress` marker, so the optional
  `vitepress.css` rules do not apply even though the documentation page also loads that stylesheet.

<VueComponentPlayground
  :component="ExampleSection"
  :schema="sectionSchema"
  :source="exampleSource"
/>

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
  :source="exampleSource"
/>

- **Component:** the globally registered wrapper around the same public Vue component.
- **Stylesheets:** `@tanaab/component-playground/style.css` provides structure and standalone
  defaults; `@tanaab/component-playground/vitepress.css` maps the wrapper to VitePress variables.
- **Appearance:** `withComponentPlayground` uses `useData().isDark`, so the playground follows the
  active VitePress appearance rather than the operating system setting.
- **Customization:** the live example sets `--component-playground-accent-color` and
  `--component-playground-border-radius` on that instance.

## Try both paths

For each live example, edit the title slot, toggle the `border-top` Boolean off and back on, use
**copy**, then use **reset**. Both previews should follow the same component edits. Copied markup
should contain the edited title and `border-top`; reset should restore the original title and
Boolean state.

Switch the site's appearance as a separate comparison. The VitePress adapter should follow the
site, while the direct Vue component should continue using its `auto` appearance setting.

These exercises are review aids for the Netlify preview. The component test suite owns interaction
behavior; the Leia scenarios in `examples/vue` and `examples/vitepress` install one candidate tarball
into separate consumers and build both through the public imports shown above. The example projects
are executable installation contracts, not a second documentation site. One is quite enough.
