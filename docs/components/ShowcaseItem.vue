<template>
  <article :data-quiet="quiet || undefined">{{ label }}<slot></slot></article>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: '',
  },
  quiet: {
    type: Boolean,
    default: false,
  },
});
</script>
