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

## VitePress usage

Register the public component in a local VitePress theme extension:

```js
// docs/.vitepress/theme/index.js
import { ComponentPlayground } from '@tanaab/component-playground';
import '@tanaab/component-playground/style.css';
import DefaultTheme from 'vitepress/theme';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ComponentPlayground', ComponentPlayground);
  },
};
```

Markdown pages can then use `<ComponentPlayground>` with page-local schemas and imported example
components. See the [capability examples](/examples) for the complete proof of concept and the
[schema reference](/reference) for supported shapes.
