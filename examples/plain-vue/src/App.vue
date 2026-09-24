<template>
  <main>
    <h1>Plain Vue installation example</h1>
    <p><strong>Stylesheet:</strong> <code>@tanaab/component-playground/style.css</code></p>
    <p>
      <strong>Appearance:</strong> standalone <code>auto</code> mode, which follows the operating
      system color scheme without loading VitePress CSS.
    </p>

    <section>
      <h2>Try it</h2>
      <ol>
        <li>Edit the default slot text.</li>
        <li>Toggle the <code>visible</code> Boolean off and back on.</li>
        <li>Use <strong>copy</strong>, then use <strong>reset</strong>.</li>
      </ol>
      <p>
        The preview should hide while <code>visible</code> is off and return with the edited body
        text when it is on. Copied markup should contain that text and the
        <code>visible</code> attribute. Reset should restore the original body copy.
      </p>
    </section>

    <ComponentPlayground
      :component="ExamplePanel"
      :schema="schema"
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
</script>

<style>
body {
  max-width: 60rem;
  padding: 2rem;
  margin: 0 auto;
  color: #202124;
  font-family: system-ui, sans-serif;
}

main > section {
  margin-block: 2rem;
}
</style>
