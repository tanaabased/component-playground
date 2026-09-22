<template>
  <div class="component-playground" :data-preview-fit="resolvedPreviewFit">
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
});

const emit = defineEmits(['copy', 'update:state']);

const copied = ref(false);
const state = reactive(createPlaygroundState(props.schema, props.initialState));

const generated = computed(() => generateComponentUsage(props.schema, state));
const previewProps = computed(() => getPreviewProps(props.schema, state));
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
  gap: 1rem;
  min-width: 0;
  color: inherit;
  font: inherit;
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
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.component-playground__code {
  position: relative;
  min-width: 0;
  border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  border-radius: 0.25rem;
  overflow: hidden;
  background: transparent;
}

.component-playground__code:focus-within {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.component-playground__copy {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 3;
  padding: 0.25rem 0.5rem;
  border: 1px solid currentColor;
  border-radius: 0.25rem;
  background: Canvas;
  color: CanvasText;
  cursor: pointer;
  font: inherit;
  font-size: 0.75rem;
}

.component-playground__copy:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.component-playground__links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
  min-width: 0;
  font-size: 0.75rem;
}

.component-playground__action {
  display: block;
  width: max-content;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.component-playground__action:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.component-playground__separator {
  user-select: none;
}

.component-playground__code :deep(.component-playground-code) {
  min-width: 0;
}
</style>
