<template>
  <section
    class="example-list"
    :aria-labelledby="resolvedHeader ? headerId : undefined"
    :data-columns="resolvedColumns"
    :data-orientation="resolvedOrientation"
  >
    <div v-if="resolvedHeader" :id="headerId" class="example-list__header">
      <a v-if="resolvedHeaderLink" :href="resolvedHeaderLink">{{ resolvedHeader }}</a>
      <span v-else>{{ resolvedHeader }}</span>
    </div>
    <ul class="example-list__items">
      <slot v-if="hasDefaultSlot"></slot>
      <li v-for="item in resolvedItems" v-else :key="item.key" class="example-list__item">
        <a v-if="item.link" :href="item.link" v-bind="item.attrs">{{ item.label }}</a>
        <span v-else>{{ item.label }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed, useId, useSlots } from 'vue';

const props = defineProps({
  header: {
    type: String,
    default: '',
  },
  headerLink: {
    type: String,
    default: '',
  },
  columns: {
    type: [String, Number],
    default: 'none',
    validator: (value) => ['none', '2', '3'].includes(String(value).trim()),
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

const allowedAttrs = new Set(['target', 'rel', 'download', 'title']);
const slots = useSlots();
const headerId = useId();

const hasDefaultSlot = computed(() => Boolean(slots.default));
const resolvedHeader = computed(() => props.header.trim());
const resolvedHeaderLink = computed(() => props.headerLink.trim());
const resolvedColumns = computed(() => {
  const columns = String(props.columns).trim();
  return columns === '2' || columns === '3' ? columns : 'none';
});
const resolvedOrientation = computed(() => (props.orientation === 'row' ? 'row' : 'column'));

function isAllowedAttr(name) {
  return allowedAttrs.has(name) || name.startsWith('aria-') || name.startsWith('data-');
}

function sanitizeAttrs(attrs = {}) {
  if (!attrs || typeof attrs !== 'object' || Array.isArray(attrs)) return {};

  const sanitized = {};

  Object.entries(attrs).forEach(([name, value]) => {
    if (!isAllowedAttr(name) || value === undefined) return;
    sanitized[name] = value;
  });

  if (sanitized.target === '_blank' && !sanitized.rel) sanitized.rel = 'noreferrer';

  return sanitized;
}

const resolvedItems = computed(() =>
  props.items
    .map((item, index) => {
      const label = typeof item?.label === 'string' ? item.label.trim() : '';
      const link = typeof item?.link === 'string' ? item.link.trim() : '';

      return {
        attrs: link ? sanitizeAttrs(item?.attrs) : {},
        key: `${label}-${link}-${index}`,
        label,
        link,
      };
    })
    .filter((item) => item.label),
);
</script>

<style scoped>
.example-list {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
  padding: 1.25rem;
  border-radius: 0.5rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.example-list__header {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.example-list__header a {
  color: inherit;
  text-decoration: none;
}

.example-list__header a:hover,
.example-list__header a:focus-visible,
.example-list__item a:hover,
.example-list__item a:focus-visible {
  color: var(--vp-c-brand-1);
}

.example-list__items {
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.example-list__item,
.example-list__items :deep(> li) {
  min-width: 0;
  margin: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 0;
  break-inside: avoid;
}

.example-list__item > a,
.example-list__item > span,
.example-list__items :deep(> li > a),
.example-list__items :deep(> li > span) {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding-block: 0.75rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.example-list[data-columns='2'] .example-list__items {
  column-count: 2;
  column-gap: 2rem;
}

.example-list[data-columns='3'] .example-list__items {
  column-count: 3;
  column-gap: 2rem;
}

.example-list[data-orientation='row'] {
  grid-template-columns: minmax(8rem, 0.25fr) minmax(0, 1fr);
  align-items: center;
}

.example-list[data-orientation='row'][data-columns='none'] .example-list__items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  justify-content: flex-end;
}

.example-list[data-orientation='row'][data-columns='none'] .example-list__item {
  border-bottom: 0;
}

@media (max-width: 640px) {
  .example-list,
  .example-list[data-orientation='row'] {
    grid-template-columns: 1fr;
  }

  .example-list[data-columns='2'] .example-list__items,
  .example-list[data-columns='3'] .example-list__items,
  .example-list[data-orientation='row'][data-columns='none'] .example-list__items {
    display: block;
    column-count: auto;
  }

  .example-list[data-orientation='row'][data-columns='none'] .example-list__item {
    border-bottom: 1px solid var(--vp-c-divider);
  }
}
</style>
