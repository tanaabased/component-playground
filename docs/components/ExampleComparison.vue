<template>
  <div class="example-comparison">
    <section>
      <h3>{{ staticLabel }}</h3>
      <slot name="static"></slot>
    </section>
    <section>
      <h3>{{ editableLabel }}</h3>
      <slot name="editable"></slot>
    </section>
  </div>
</template>

<script setup>
defineProps({
  staticLabel: {
    type: String,
    default: 'Static Markdown',
  },
  editableLabel: {
    type: String,
    default: 'Editable playground',
  },
});
</script>

<style scoped>
.example-comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.example-comparison section,
.example-comparison h3 {
  min-width: 0;
  margin-top: 0;
}

@media (max-width: 720px) {
  .example-comparison {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
