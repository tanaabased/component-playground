<template>
  <a
    class="example-logo"
    :href="resolvedLink"
    :data-type="resolvedType"
    :style="logoVariables"
    aria-label="Tanaab Maneuvering Systems"
  >
    <span class="example-logo__image" aria-hidden="true"></span>
  </a>
</template>

<script setup>
import { computed } from 'vue';

import centeredLogo from './assets/tms-centered.svg';
import leftLogo from './assets/tms-left.svg';
import markLogo from './assets/tms-mark.svg';
import rightLogo from './assets/tms-right.svg';

const logos = {
  centered: centeredLogo,
  left: leftLogo,
  mark: markLogo,
  right: rightLogo,
};

const props = defineProps({
  type: {
    type: String,
    default: 'centered',
    validator: (value) => ['left', 'right', 'centered', 'mark'].includes(value),
  },
  background: {
    type: String,
    default: 'none',
  },
  color: {
    type: String,
    default: 'var(--vp-c-text-1)',
  },
  link: {
    type: String,
    default: '/',
  },
});

const resolvedBackground = computed(() => {
  return props.background.trim() || 'none';
});

const resolvedColor = computed(() => {
  return props.color.trim() || 'var(--vp-c-text-1)';
});

const resolvedLink = computed(() => {
  return props.link.trim() || '/';
});

const resolvedType = computed(() => (props.type in logos ? props.type : 'centered'));
const selectedLogo = computed(() => logos[resolvedType.value]);

const logoVariables = computed(() => ({
  '--example-logo-background': resolvedBackground.value,
  '--example-logo-color': resolvedColor.value,
  '--example-logo-image': `url("${selectedLogo.value}")`,
}));
</script>

<style scoped>
.example-logo {
  box-sizing: border-box;
  display: inline-block;
  width: min(100%, 20rem);
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

.example-logo__image {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  background-color: currentcolor;
  mask: var(--example-logo-image) center / contain no-repeat;
  -webkit-mask: var(--example-logo-image) center / contain no-repeat;
}
</style>
