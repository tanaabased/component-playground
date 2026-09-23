<template>
  <section
    class="example-list"
    :data-columns="resolvedColumns"
    :data-orientation="orientation"
    :style="{ '--example-list-columns': resolvedColumns }"
  >
    <h3>{{ header }}</h3>
    <ul>
      <li v-for="item in items" :key="`${item.label}-${item.category}`">
        <strong>{{ item.label }}</strong>
        <span>{{ item.category }}</span>
        <small v-if="item.detail">{{ item.detail }}</small>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  header: {
    type: String,
    default: '',
  },
  columns: {
    type: String,
    default: '1',
    validator: (value) => ['1', '2', '3'].includes(value),
  },
  items: {
    type: Array,
    default: () => [],
  },
  orientation: {
    type: String,
    default: 'column',
    validator: (value) => ['column', 'row'].includes(value),
  },
});

const resolvedColumns = computed(() => {
  return ['1', '2', '3'].includes(props.columns) ? props.columns : '1';
});
</script>

<style scoped>
.example-list {
  display: grid;
  gap: 1.25rem;
  width: 100%;
  box-sizing: border-box;
  padding: 1.25rem;
  border-radius: 0.5rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.example-list > h3 {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 1.1rem;
}

.example-list > ul {
  display: grid;
  grid-template-columns: repeat(var(--example-list-columns), minmax(0, 1fr));
  gap: 0 1.25rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.example-list li {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  margin: 0;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.example-list li > span,
.example-list li > small {
  color: var(--vp-c-text-2);
}

.example-list[data-orientation='row'] li {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
}

.example-list[data-orientation='row'] li > small {
  grid-column: 1 / -1;
}
</style>
