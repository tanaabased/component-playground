<template>
  <a
    class="example-logo"
    :href="resolvedLink"
    :style="logoVariables"
    aria-label="Tanaab Maneuvering Systems"
  >
    <span class="example-logo__mark" aria-hidden="true"></span>
  </a>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  background: {
    type: String,
    default: 'var(--vp-c-bg-soft)',
  },
  color: {
    type: String,
    default: 'var(--vp-c-brand-1)',
  },
  link: {
    type: String,
    default: '/',
  },
});

const resolvedBackground = computed(() => {
  return props.background.trim() || 'var(--vp-c-bg-soft)';
});

const resolvedColor = computed(() => {
  return props.color.trim() || 'var(--vp-c-brand-1)';
});

const resolvedLink = computed(() => {
  return props.link.trim() || '/';
});

const logoVariables = computed(() => ({
  '--example-logo-background': resolvedBackground.value,
  '--example-logo-color': resolvedColor.value,
}));
</script>

<style scoped>
.example-logo {
  box-sizing: border-box;
  display: inline-block;
  width: min(100%, 18rem);
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: var(--example-logo-background);
  color: var(--example-logo-color);
  line-height: 0;
  text-decoration: none;
}

.example-logo:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.example-logo:hover {
  color: var(--vp-c-brand-2);
}

.example-logo__mark {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  background-color: currentcolor;
  mask: url('./assets/tms-mark.svg') center / contain no-repeat;
  -webkit-mask: url('./assets/tms-mark.svg') center / contain no-repeat;
}
</style>
