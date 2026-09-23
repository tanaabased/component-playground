<template>
  <component
    :is="resolvedLink ? 'a' : 'div'"
    class="example-box"
    :data-linked="Boolean(resolvedLink)"
    :data-type="resolvedType"
    :href="resolvedLink || undefined"
  >
    <slot></slot>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  link: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'content',
  },
});

const resolvedLink = computed(() => props.link.trim());
const resolvedType = computed(() => (props.type === 'title' ? 'title' : 'content'));
</script>

<style scoped>
.example-box {
  display: flex;
  width: 100%;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.example-box[data-type='title'] {
  font-size: clamp(1.1rem, 3vw, 1.75rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.example-box[data-linked='true']:hover,
.example-box[data-linked='true']:focus-visible {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.example-box[data-linked='true']:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
</style>
