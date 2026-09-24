<template>
  <main>
    <h1>Plain Vue consumer</h1>
    <p>Each instance uses the package stylesheet without a documentation theme.</p>
    <div class="playground-grid">
      <section>
        <h2>Automatic appearance</h2>
        <ComponentPlayground
          :component="ExamplePanel"
          :schema="schema"
          :initial-state="initialState"
          source="https://github.com/tanaabased/component-playground/blob/main/examples/vue/src/ExamplePanel.vue"
        />
      </section>
      <section>
        <h2>Instance override</h2>
        <ComponentPlayground
          appearance="dark"
          class="custom-playground"
          :component="ExamplePanel"
          :schema="schema"
          :initial-state="initialState"
          source="https://github.com/tanaabased/component-playground/blob/main/examples/vue/src/ExamplePanel.vue"
        />
      </section>
    </div>
  </main>
</template>

<script setup>
import { ComponentPlayground } from '@tanaab/component-playground';
import '@tanaab/component-playground/style.css';

import ExamplePanel from './ExamplePanel.vue';

const schema = {
  name: 'ExamplePanel',
  props: {
    heading: {
      kind: 'string',
      default: 'Independent component example',
    },
    count: {
      kind: 'number',
      default: 2,
    },
    tone: {
      kind: 'enum',
      options: ['plain', 'strong'],
      default: 'plain',
    },
    visible: {
      kind: 'boolean',
      default: true,
    },
    items: {
      kind: 'object-array',
      default: [{ label: 'One' }, { label: 'Two "quoted" items' }],
      fields: [{ path: 'label', kind: 'string' }],
    },
  },
  slots: {
    title: {
      kind: 'html',
      default: '<strong>Editable title</strong>',
    },
    default: {
      kind: 'text',
      default: 'Editable body copy.',
    },
  },
};

const initialState = {
  props: {
    visible: false,
  },
};
</script>

<style>
body {
  max-width: 60rem;
  padding: 2rem;
  margin: 0 auto;
  color: #202124;
  font-family: system-ui, sans-serif;
}

.playground-grid {
  display: grid;
  gap: 2rem;
}

.custom-playground {
  --component-playground-accent-color: #8be9fd;
  --component-playground-focus-color: #f1fa8c;
  --component-playground-border-radius: 0.75rem;
}
</style>
