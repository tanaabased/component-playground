<template>
  <article v-if="visible" :data-tone="tone">
    <header>
      <small><slot name="eyebrow"></slot></small>
      <h3>
        <slot name="title">{{ heading }}</slot>
      </h3>
    </header>
    <p><slot></slot></p>
    <footer>{{ count }} items · {{ tone }}</footer>
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
    default: 0,
  },
  tone: {
    type: String,
    default: 'neutral',
  },
  visible: {
    type: Boolean,
    default: true,
  },
});
</script>
