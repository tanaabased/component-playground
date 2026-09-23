<template>
  <div
    class="component-playground"
    :data-appearance="resolvedAppearance"
    :data-preview-fit="resolvedPreviewFit"
  >
    <div class="component-playground__preview" aria-label="Component preview">
      <div class="component-playground__preview-inner">
        <component :is="props.component" v-if="hasPreviewSlots" v-bind="previewProps">
          <template v-for="slot in namedPreviewSlots" #[slot.name] :key="slot.name">
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-if="slot.rendersHtml"
              class="component-playground__slot-html"
              v-html="slot.value"
            ></div>
            <!-- eslint-enable vue/no-v-html -->
            <template v-else>{{ slot.value }}</template>
          </template>

          <template v-if="defaultRepeatSlot">
            <component
              :is="defaultRepeatSlot.component"
              v-for="item in defaultRepeatSlot.items"
              :key="item.key"
              v-bind="defaultRepeatSlot.props"
            >
              {{ item.label }}
            </component>
          </template>

          <!-- eslint-disable vue/no-v-html -->
          <div
            v-else-if="hasDefaultSlot && rendersDefaultSlotHtml"
            class="component-playground__slot-html"
            v-html="defaultSlotText"
          ></div>
          <!-- eslint-enable vue/no-v-html -->
          <template v-else-if="hasDefaultSlot">{{ defaultSlotText }}</template>
        </component>
        <component :is="props.component" v-else v-bind="previewProps" />
      </div>
    </div>

    <div class="component-playground__code-area">
      <div class="component-playground__code">
        <button
          class="component-playground__copy"
          type="button"
          :aria-label="copyLabel"
          :title="copyLabel"
          @click="copyCode"
        >
          {{ copied ? 'copied' : 'copy' }}
        </button>

        <InteractiveCode
          :appearance="resolvedAppearance"
          :code="generated.code"
          :regions="generated.regions"
          @select-enum="selectEnum"
          @toggle-boolean="toggleBoolean"
          @update-region="updateRegion"
        />
      </div>

      <div class="component-playground__links">
        <a
          v-if="props.source"
          class="component-playground__action"
          :href="props.source"
          target="_blank"
          rel="noreferrer"
        >
          source
        </a>
        <span v-if="props.source" class="component-playground__separator" aria-hidden="true"
          >|</span
        >
        <button class="component-playground__action" type="button" @click="resetPlayground">
          reset
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

import InteractiveCode from './InteractiveCode.vue';
import {
  applyControlDerivedProps,
  createPlaygroundState,
  decodeRegionValue,
  generateComponentUsage,
  getPreviewProps,
  getRepeatSlotItems,
  setNestedValue,
} from '../utils/codegen.js';
import { resolvePlaygroundAppearance } from '../utils/playground-style.js';

const props = defineProps({
  component: {
    type: [Object, String, Function],
    required: true,
  },
  schema: {
    type: Object,
    required: true,
  },
  source: {
    type: String,
    default: '',
  },
  initialState: {
    type: Object,
    default: () => ({}),
  },
  previewFit: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'contained'].includes(value),
  },
  appearance: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'light', 'dark'].includes(value),
  },
});

const emit = defineEmits(['copy', 'update:state']);

const copied = ref(false);
const state = reactive(createPlaygroundState(props.schema, props.initialState));

const generated = computed(() => generateComponentUsage(props.schema, state));
const previewProps = computed(() => getPreviewProps(props.schema, state));
const resolvedAppearance = computed(() => resolvePlaygroundAppearance(props.appearance));
const resolvedPreviewFit = computed(() => {
  return props.previewFit === 'contained' ? 'contained' : 'full';
});
const slotDefinitions = computed(() => Object.entries(props.schema?.slots ?? {}));
const defaultSlotDefinition = computed(() => props.schema?.slots?.default ?? null);
const defaultRepeatSlotDefinition = computed(() => {
  return defaultSlotDefinition.value?.kind === 'repeat' ? defaultSlotDefinition.value : null;
});
const defaultSlotText = computed(() => state.slots.default ?? '');
const hasDefaultSlot = computed(() => Boolean(defaultSlotDefinition.value));
const rendersDefaultSlotHtml = computed(() => defaultSlotDefinition.value?.kind === 'html');
const defaultRepeatSlot = computed(() => {
  const definition = defaultRepeatSlotDefinition.value;
  if (!definition) return null;

  return {
    component: definition.component,
    props: definition.props ?? {},
    items: getRepeatSlotItems(definition, state),
  };
});
const namedPreviewSlots = computed(() => {
  return slotDefinitions.value
    .filter(([slotName, definition]) => slotName !== 'default' && definition.kind !== 'repeat')
    .map(([name, definition]) => ({
      name,
      rendersHtml: definition.kind === 'html',
      value: state.slots[name] ?? '',
    }));
});
const hasPreviewSlots = computed(() => {
  return (
    namedPreviewSlots.value.length > 0 || Boolean(defaultRepeatSlot.value) || hasDefaultSlot.value
  );
});
const copyLabel = computed(() => (copied.value ? 'Copied code' : 'Copy code'));

function replaceReactiveObject(target, source) {
  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, source);
}

function replacePlaygroundState(nextState) {
  replaceReactiveObject(state.controls, nextState.controls);
  replaceReactiveObject(state.props, nextState.props);
  replaceReactiveObject(state.slots, nextState.slots);
}

function resetPlayground() {
  replacePlaygroundState(createPlaygroundState(props.schema, props.initialState));
}

watch(
  () => [props.schema, props.initialState],
  () => {
    resetPlayground();
  },
  { deep: true },
);

watch(
  state,
  () => {
    emit('update:state', {
      controls: { ...state.controls },
      props: { ...state.props },
      slots: { ...state.slots },
    });
  },
  { deep: true },
);

function updateRegion({ region, value }) {
  const decodedValue = decodeRegionValue(region, value);

  if (region.kind === 'slot-text') {
    state.slots[region.slot] = decodedValue;
    return;
  }

  if (region.kind === 'array-prop-field') {
    updateArrayPropField(region, decodedValue);
    return;
  }

  if (region.kind !== 'prop-value') return;

  if (region.valueKind === 'number') {
    const numberValue = Number(decodedValue);
    state.props[region.prop] = Number.isFinite(numberValue) ? numberValue : 0;
    return;
  }

  state.props[region.prop] = decodedValue;
}

function updateArrayPropField(region, value) {
  if (!Array.isArray(state.props[region.prop])) {
    state.props[region.prop] = [];
  }

  if (
    !state.props[region.prop][region.index] ||
    typeof state.props[region.prop][region.index] !== 'object'
  ) {
    state.props[region.prop][region.index] = {};
  }

  setNestedValue(state.props[region.prop][region.index], region.path, value);
}

function toggleBoolean(prop) {
  state.props[prop] = !state.props[prop];
}

function selectEnum({ control, prop, region, value }) {
  if (region?.kind === 'array-prop-field') {
    updateArrayPropField(region, value);
    return;
  }

  if (control) {
    state.controls[control] = value;
    applyControlDerivedProps(props.schema, state, control);
    return;
  }

  state.props[prop] = value;
}

async function copyCode() {
  await navigator.clipboard.writeText(generated.value.copyCode);
  copied.value = true;
  emit('copy', generated.value.copyCode);

  window.setTimeout(() => {
    copied.value = false;
  }, 1400);
}
</script>

<style scoped>
.component-playground {
  display: grid;
  gap: var(--component-playground-gap, 1rem);
  min-width: 0;
}

.component-playground__preview {
  display: grid;
  min-width: 0;
  place-items: center;
  overflow: visible;
}

.component-playground[data-preview-fit='contained'] .component-playground__preview {
  min-height: 12rem;
  max-block-size: clamp(16rem, 45vh, 24rem);
  overflow: hidden;
}

.component-playground__preview-inner {
  display: grid;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  place-items: center;
}

.component-playground[data-preview-fit='contained'] .component-playground__preview-inner {
  width: min(100%, clamp(12rem, 42vw, 20rem));
  max-block-size: 100%;
}

.component-playground__slot-html {
  display: block;
  width: 100%;
  min-width: 0;
  color: inherit;
  font: inherit;
}

.component-playground__code-area {
  --_component-playground-default-background-color: #f6f8fa;
  --_component-playground-default-foreground-color: #1f2328;
  --_component-playground-default-muted-color: #59636e;
  --_component-playground-default-border-color: #d1d9e0;
  --_component-playground-default-accent-color: #0969da;
  --_component-playground-default-hover-background-color: #d8dee4;
  --_component-playground-default-active-background-color: #b6d6ff;
  --_component-playground-default-focus-color: #0969da;
  --_component-playground-background-color: var(
    --component-playground-background-color,
    var(--_component-playground-default-background-color)
  );
  --_component-playground-foreground-color: var(
    --component-playground-foreground-color,
    var(--_component-playground-default-foreground-color)
  );
  --_component-playground-muted-color: var(
    --component-playground-muted-color,
    var(--_component-playground-default-muted-color)
  );
  --_component-playground-border-color: var(
    --component-playground-border-color,
    var(--_component-playground-default-border-color)
  );
  --_component-playground-accent-color: var(
    --component-playground-accent-color,
    var(--_component-playground-default-accent-color)
  );
  --_component-playground-hover-background-color: var(
    --component-playground-hover-background-color,
    var(--_component-playground-default-hover-background-color)
  );
  --_component-playground-active-background-color: var(
    --component-playground-active-background-color,
    var(--_component-playground-default-active-background-color)
  );
  --_component-playground-focus-color: var(
    --component-playground-focus-color,
    var(--_component-playground-default-focus-color)
  );
  --_component-playground-font-family: var(
    --component-playground-font-family,
    ui-sans-serif,
    system-ui,
    sans-serif
  );
  --_component-playground-monospace-font-family: var(
    --component-playground-monospace-font-family,
    ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace
  );
  --_component-playground-font-size: var(--component-playground-font-size, 0.875rem);
  --_component-playground-line-height: var(--component-playground-line-height, 1.5);
  --_component-playground-control-padding-block: var(
    --component-playground-control-padding-block,
    0.35rem
  );
  --_component-playground-control-padding-inline: var(
    --component-playground-control-padding-inline,
    0.6rem
  );
  --_component-playground-border-width: var(--component-playground-border-width, 1px);
  --_component-playground-border-style: var(--component-playground-border-style, solid);
  --_component-playground-border-radius: var(--component-playground-border-radius, 0.375rem);
  --_component-playground-focus-width: var(--component-playground-focus-width, 2px);

  display: grid;
  gap: var(--component-playground-actions-gap, 0.35rem);
  min-width: 0;
  color: var(--_component-playground-foreground-color);
  color-scheme: light;
  font-family: var(--_component-playground-font-family);
  font-size: var(--_component-playground-font-size);
  line-height: var(--_component-playground-line-height);
}

.component-playground[data-appearance='dark'] .component-playground__code-area {
  --_component-playground-default-background-color: #0d1117;
  --_component-playground-default-foreground-color: #f0f6fc;
  --_component-playground-default-muted-color: #9198a1;
  --_component-playground-default-border-color: #3d444d;
  --_component-playground-default-accent-color: #58a6ff;
  --_component-playground-default-hover-background-color: #262c36;
  --_component-playground-default-active-background-color: #1f4979;
  --_component-playground-default-focus-color: #58a6ff;

  color-scheme: dark;
}

.component-playground__code {
  position: relative;
  min-width: 0;
  border-color: var(--_component-playground-border-color);
  border-style: var(--_component-playground-border-style);
  border-width: var(--_component-playground-border-width);
  border-radius: var(--_component-playground-border-radius);
  overflow: hidden;
  background: var(--_component-playground-background-color);
}

.component-playground__code:focus-within {
  outline: var(--_component-playground-focus-width) solid var(--_component-playground-focus-color);
  outline-offset: var(--_component-playground-focus-width);
}

.component-playground__copy {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 3;
  padding: var(--_component-playground-control-padding-block)
    var(--_component-playground-control-padding-inline);
  border-color: var(--_component-playground-border-color);
  border-style: var(--_component-playground-border-style);
  border-width: var(--_component-playground-border-width);
  border-radius: var(--_component-playground-border-radius);
  background: var(--_component-playground-background-color);
  color: var(--_component-playground-foreground-color);
  cursor: pointer;
  font: inherit;
  font-size: 0.8125em;
}

.component-playground__copy:hover {
  background: var(--_component-playground-hover-background-color);
}

.component-playground__copy:active {
  background: var(--_component-playground-active-background-color);
}

.component-playground__copy:focus-visible {
  outline: var(--_component-playground-focus-width) solid var(--_component-playground-focus-color);
  outline-offset: var(--_component-playground-focus-width);
}

.component-playground__links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--component-playground-actions-gap, 0.35rem);
  min-width: 0;
  color: var(--_component-playground-muted-color);
  font-size: 0.8125em;
}

.component-playground__action {
  display: block;
  width: max-content;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--_component-playground-accent-color);
  cursor: pointer;
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.component-playground__action:focus-visible {
  outline: var(--_component-playground-focus-width) solid var(--_component-playground-focus-color);
  outline-offset: var(--_component-playground-focus-width);
}

.component-playground__separator {
  user-select: none;
}

.component-playground__code :deep(.component-playground-code) {
  min-width: 0;
}

@media (prefers-color-scheme: dark) {
  .component-playground[data-appearance='auto'] .component-playground__code-area {
    --_component-playground-default-background-color: #0d1117;
    --_component-playground-default-foreground-color: #f0f6fc;
    --_component-playground-default-muted-color: #9198a1;
    --_component-playground-default-border-color: #3d444d;
    --_component-playground-default-accent-color: #58a6ff;
    --_component-playground-default-hover-background-color: #262c36;
    --_component-playground-default-active-background-color: #1f4979;
    --_component-playground-default-focus-color: #58a6ff;

    color-scheme: dark;
  }
}
</style>
