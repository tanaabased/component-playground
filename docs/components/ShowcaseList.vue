<template>
  <section>
    <h3><slot name="heading"></slot></h3>
    <slot></slot>
    <ul>
      <li v-for="item in items" :key="item.label">
        {{ item.label }} — {{ item.meta?.role }}
        <small v-if="item.note"> · {{ item.note }}</small>
      </li>
    </ul>
  </section>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});
</script>
