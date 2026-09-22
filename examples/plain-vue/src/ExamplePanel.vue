<template>
  <article v-if="visible" class="example-panel" :data-tone="tone">
    <header>
      <slot name="title">{{ heading }}</slot>
    </header>
    <slot></slot>
    <ul>
      <li v-for="item in items.slice(0, count)" :key="item.label">{{ item.label }}</li>
    </ul>
  </article>
</template>

<script setup>
defineProps({
  heading: {
    type: String,
    default: '',
  },
  count: {
    type: Number,
    default: 2,
  },
  tone: {
    type: String,
    default: 'plain',
  },
  visible: {
    type: Boolean,
    default: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.example-panel {
  padding: 1rem;
  border: 1px solid currentColor;
}

.example-panel[data-tone='strong'] {
  border-width: 2px;
}
</style>
