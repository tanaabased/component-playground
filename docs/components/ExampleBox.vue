<template>
  <article class="example-box"><slot></slot></article>
</template>

<style scoped>
.example-box {
  display: grid;
  min-height: 6rem;
  place-items: center;
  box-sizing: border-box;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 600;
  text-align: center;
}
</style>
