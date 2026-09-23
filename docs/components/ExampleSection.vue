<template>
  <section
    class="example-section"
    :data-border-bottom="borderBottom"
    :data-border-top="borderTop"
    :data-orientation="orientation"
  >
    <h3 class="example-section__title"><slot name="title"></slot></h3>
    <div class="example-section__content"><slot></slot></div>
  </section>
</template>

<script setup>
defineProps({
  borderBottom: {
    type: Boolean,
    default: false,
  },
  borderTop: {
    type: Boolean,
    default: false,
  },
  orientation: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value),
  },
});
</script>

<style scoped>
.example-section {
  display: grid;
  grid-template-areas: 'title content';
  grid-template-columns: minmax(8rem, 0.32fr) minmax(0, 1fr);
  gap: clamp(1.5rem, 5vw, 3rem);
  align-items: start;
  width: 100%;
  padding-block: 1.5rem;
  color: var(--vp-c-text-1);
}

.example-section[data-border-bottom='true'] {
  border-bottom: 1px solid var(--vp-c-divider);
}

.example-section[data-border-top='true'] {
  border-top: 1px solid var(--vp-c-divider);
}

.example-section[data-orientation='right'] {
  grid-template-areas: 'content title';
  grid-template-columns: minmax(0, 1fr) minmax(8rem, 0.32fr);
}

.example-section__title {
  grid-area: title;
  min-width: 0;
  margin: 0;
  border: 0;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  line-height: 1.4;
}

.example-section__content {
  grid-area: content;
  min-width: 0;
  color: var(--vp-c-text-2);
}

.example-section__content :deep(> :first-child) {
  margin-top: 0;
}

.example-section__content :deep(> :last-child) {
  margin-bottom: 0;
}

.example-section[data-orientation='right'] .example-section__title {
  text-align: right;
}

@media (max-width: 640px) {
  .example-section,
  .example-section[data-orientation='right'] {
    grid-template-areas:
      'title'
      'content';
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .example-section[data-orientation='right'] .example-section__title {
    text-align: left;
  }
}
</style>
