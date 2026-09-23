<template>
  <div
    class="example-grid"
    :data-columns="resolvedColumns"
    :style="{ '--example-grid-columns': resolvedColumns }"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  columns: {
    type: Number,
    default: 1,
  },
});

const resolvedColumns = computed(() => {
  return Number.isInteger(props.columns) && props.columns >= 1 && props.columns <= 4
    ? props.columns
    : 1;
});
</script>

<style scoped>
.example-grid {
  display: grid;
  grid-template-columns: repeat(var(--example-grid-columns), minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
}
</style>
