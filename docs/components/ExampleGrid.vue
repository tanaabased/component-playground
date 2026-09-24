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
    type: [Number, String],
    default: 1,
    validator: (value) => {
      const columns = Number(value);
      return Number.isInteger(columns) && columns >= 1 && columns <= 6;
    },
  },
});

const resolvedColumns = computed(() => {
  const columns = Number(props.columns);
  return Number.isInteger(columns) && columns >= 1 && columns <= 6 ? columns : 1;
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
