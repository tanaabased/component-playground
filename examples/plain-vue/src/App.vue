<template>
  <main>
    <h1>Plain Vue consumer</h1>
    <ComponentPlayground
      :component="ExamplePanel"
      :schema="schema"
      :initial-state="initialState"
      source="https://github.com/tanaabased/component-playground/blob/main/examples/plain-vue/src/ExamplePanel.vue"
    />
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
</style>
