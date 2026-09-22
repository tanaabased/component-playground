<template>
  <section :data-columns="columns">
    <p>{{ columns }} columns requested</p>
    <div><slot></slot></div>
  </section>
</template>

<script setup>
defineProps({
  columns: {
    type: Number,
    default: 1,
  },
});
</script>
