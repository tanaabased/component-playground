<template>
  <div
    ref="wrapperElement"
    class="component-playground-code"
    :data-appearance="props.appearance"
    @focusout="handleWrapperFocusout"
    @keydown.esc="closeEnumPopover(true)"
  >
    <div ref="editorElement" class="component-playground-code__editor"></div>
    <pre
      v-if="!editorReady"
      class="component-playground-code__fallback"
    ><code>{{ props.code }}</code></pre>
    <Teleport to="body">
      <div
        v-if="activeEnum"
        ref="enumMenuElement"
        class="component-playground-code__enum-menu"
        :data-appearance="props.appearance"
        :style="activeEnum.style"
        role="group"
        :aria-label="`Select ${activeEnum.label}`"
        @focusout="handlePopoverFocusout"
        @keydown.esc="closeEnumPopover(true)"
      >
        <button
          v-for="option in activeEnum.options"
          :key="option"
          class="component-playground-code__enum-option"
          :class="{
            'component-playground-code__enum-option--active': option === activeEnum.value,
          }"
          type="button"
          :aria-pressed="option === activeEnum.value"
          :data-active="option === activeEnum.value ? 'true' : undefined"
          @click="selectEnumValue(option)"
        >
          {{ formatEnumOptionLabel(option) }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script>
const defaultSyntaxThemes = {
  light: () => import('shiki/themes/github-light.mjs'),
  dark: () => import('shiki/themes/github-dark.mjs'),
};

let shikiHighlighterPromise;
const shikiThemePromises = new WeakMap();

function getShikiHighlighter() {
  shikiHighlighterPromise ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/vue.mjs'),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }, html, vue]) => {
    return createHighlighterCore({
      themes: [],
      langs: [html.default, vue.default],
      engine: createJavaScriptRegexEngine(),
    });
  });

  return shikiHighlighterPromise;
}

function resolveThemeRegistration(themeInput) {
  const registration = typeof themeInput === 'function' ? themeInput() : themeInput;

  return Promise.resolve(registration).then((theme) => theme?.default ?? theme);
}

function loadShikiTheme(highlighter, themeInput) {
  let promise = shikiThemePromises.get(themeInput);

  if (!promise) {
    promise = resolveThemeRegistration(themeInput).then(async (theme) => {
      if (!theme?.name) throw new Error('Shiki theme registrations require a name.');

      if (!highlighter.getLoadedThemes().includes(theme.name)) {
        await highlighter.loadTheme(theme);
      }

      return theme.name;
    });
    shikiThemePromises.set(themeInput, promise);
    promise.catch(() => shikiThemePromises.delete(themeInput));
  }

  return promise;
}
</script>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { getFloatingPlaygroundStyle } from '../utils/playground-style.js';

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  regions: {
    type: Array,
    default: () => [],
  },
  appearance: {
    type: String,
    default: 'auto',
  },
  language: {
    type: String,
    default: 'vue',
    validator: (value) => ['vue', 'html'].includes(value),
  },
  syntaxThemes: {
    type: Object,
    default: null,
    validator: (value) => {
      return ['light', 'dark'].every((variant) => {
        const theme = value?.[variant];
        return typeof theme === 'function' || (theme && typeof theme === 'object');
      });
    },
  },
});

const emit = defineEmits(['update-region', 'toggle-boolean', 'select-enum']);

const wrapperElement = ref(null);
const editorElement = ref(null);
const enumMenuElement = ref(null);
const editorReady = ref(false);
const activeEnum = ref(null);

let view;
let regionCompartment;
let syntaxCompartment;
let codeMirrorEditorSelection;
let codeMirrorEditorView;
let codeMirrorDecoration;
let currentRegions = props.regions;
let suppressUpdate = false;
let highlightSequence = 0;
let unmounted = false;

function isTextEditableRegion(region) {
  if (!region) return false;
  if (region.kind === 'slot-text') return true;
  if (region.kind === 'array-prop-field') return region.valueKind !== 'enum';
  return region.kind === 'prop-value' && region.valueKind !== 'enum';
}

function isEnumRegion(region) {
  return (
    (region?.kind === 'prop-value' ||
      region?.kind === 'control-value' ||
      region?.kind === 'array-prop-field') &&
    region.valueKind === 'enum'
  );
}

function getEnumRegionLabel(region) {
  if (region?.path) return `${region.prop}.${region.path}`;
  return region?.prop ?? region?.control ?? 'value';
}

function getEnumRegionValue(region) {
  if (!region) return '';
  if ('value' in region) return region.value;
  return view?.state.doc.sliceString(region.from, region.to) ?? '';
}

function formatEnumOptionLabel(option) {
  return option === '' ? "''" : option;
}

function findRegionAt(position) {
  return currentRegions.find((region) => position >= region.from && position <= region.to);
}

function findEditableRegionForChange(from, to) {
  return currentRegions.find((region) => {
    if (!isTextEditableRegion(region)) return false;
    return from >= region.from && to <= region.to;
  });
}

function getSingleEditableChange(update) {
  const changes = [];

  update.changes.iterChanges((fromA, toA, fromB, toB) => {
    changes.push({ fromA, toA, fromB, toB });
  });

  if (changes.length !== 1) return null;

  const [change] = changes;
  const region = findEditableRegionForChange(change.fromA, change.toA);

  if (!region) return null;

  const delta = change.toB - change.fromB - (change.toA - change.fromA);
  const value = update.state.doc.sliceString(region.from, region.to + delta);

  return { region, value };
}

function allChangesAreEditable(transaction) {
  let allowed = true;

  transaction.changes.iterChanges((fromA, toA) => {
    if (!findEditableRegionForChange(fromA, toA)) {
      allowed = false;
    }
  });

  return allowed;
}

function closeEnumPopover(restoreFocus = false) {
  if (!activeEnum.value) return;

  activeEnum.value = null;
  if (restoreFocus) view?.focus();
}

function focusStaysInEditorOrPopover(target) {
  if (!target) return false;

  return Boolean(wrapperElement.value?.contains(target) || enumMenuElement.value?.contains(target));
}

function handleWrapperFocusout(event) {
  if (focusStaysInEditorOrPopover(event.relatedTarget)) return;

  closeEnumPopover();
}

function handlePopoverFocusout(event) {
  if (focusStaysInEditorOrPopover(event.relatedTarget)) return;

  closeEnumPopover();
}

function selectEnumValue(value) {
  if (!activeEnum.value) return;

  emit('select-enum', {
    control: activeEnum.value.control,
    prop: activeEnum.value.prop,
    region: activeEnum.value.region,
    value,
  });

  closeEnumPopover(true);
}

function openEnumPopover(region) {
  if (!view || !wrapperElement.value) return;

  const coords = view.coordsAtPos(region.from);
  if (!coords) return;

  view.dispatch({ selection: codeMirrorEditorSelection.cursor(region.from) });
  activeEnum.value = {
    control: region.control,
    label: getEnumRegionLabel(region),
    prop: region.prop,
    region,
    value: getEnumRegionValue(region),
    options: region.options ?? [],
    style: {
      ...getFloatingPlaygroundStyle(wrapperElement.value),
      top: `${Math.max(8, coords.bottom + 4)}px`,
      left: `${Math.max(8, coords.left)}px`,
    },
  };

  nextTick(() => {
    const activeOption = enumMenuElement.value?.querySelector('[data-active="true"]');
    const firstOption = enumMenuElement.value?.querySelector('button');

    (activeOption ?? firstOption)?.focus();
  });
}

function createRegionDecorations(Decoration) {
  const decorations = currentRegions.flatMap((region) => {
    if (region.from === region.to) return [];

    const className = [
      'component-playground-code__region',
      `component-playground-code__region--${region.kind}`,
      region.valueKind ? `component-playground-code__region--${region.valueKind}` : '',
      region.active === false ? 'component-playground-code__region--inactive' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return [Decoration.mark({ class: className }).range(region.from, region.to)];
  });

  return Decoration.set(decorations, true);
}

function createShikiDecorations(Decoration, tokenLines) {
  const decorations = [];

  for (const line of tokenLines) {
    for (const token of line) {
      const length = token.content.length;
      const lightColor = token.variants?.light?.color;
      const darkColor = token.variants?.dark?.color;

      if (!length || (!lightColor && !darkColor)) continue;

      const styles = [];

      if (lightColor) styles.push(`--component-playground-token-light: ${lightColor}`);
      if (darkColor) styles.push(`--component-playground-token-dark: ${darkColor}`);

      decorations.push(
        Decoration.mark({
          class: 'component-playground-code__token',
          attributes: { style: styles.join('; ') },
        }).range(token.offset, token.offset + length),
      );
    }
  }

  return Decoration.set(decorations, true);
}

async function refreshSyntaxDecorations(code) {
  if (!view || !syntaxCompartment || !codeMirrorEditorView || !codeMirrorDecoration) return;

  const sequence = ++highlightSequence;

  try {
    const highlighter = await getShikiHighlighter();
    const themes = props.syntaxThemes ?? defaultSyntaxThemes;
    const [lightTheme, darkTheme] = await Promise.all([
      loadShikiTheme(highlighter, themes.light),
      loadShikiTheme(highlighter, themes.dark),
    ]);

    if (sequence !== highlightSequence || !view || !syntaxCompartment) return;

    const tokenLines = highlighter.codeToTokensWithThemes(code, {
      lang: props.language,
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      defaultColor: false,
    });

    view.dispatch({
      effects: syntaxCompartment.reconfigure(
        codeMirrorEditorView.decorations.of(
          createShikiDecorations(codeMirrorDecoration, tokenLines),
        ),
      ),
    });
  } catch {
    if (sequence !== highlightSequence || !view || !syntaxCompartment) return;

    view.dispatch({
      effects: syntaxCompartment.reconfigure(
        codeMirrorEditorView.decorations.of(codeMirrorDecoration.set([], true)),
      ),
    });
  }
}

function openRegionAtSelection() {
  if (!view) return false;

  const region = findRegionAt(view.state.selection.main.head);

  if (region?.kind === 'boolean-prop') {
    emit('toggle-boolean', region.prop);
    return true;
  }

  if (isEnumRegion(region)) {
    openEnumPopover(region);
    return true;
  }

  return false;
}

onMounted(async () => {
  const [{ EditorState, Compartment, EditorSelection }, { EditorView, Decoration, keymap }] =
    await Promise.all([import('@codemirror/state'), import('@codemirror/view')]);

  if (unmounted || !editorElement.value) return;

  regionCompartment = new Compartment();
  syntaxCompartment = new Compartment();
  codeMirrorEditorSelection = EditorSelection;
  codeMirrorEditorView = EditorView;
  codeMirrorDecoration = Decoration;

  const transactionFilter = EditorState.transactionFilter.of((transaction) => {
    if (suppressUpdate || !transaction.docChanged) return transaction;
    return allChangesAreEditable(transaction) ? transaction : [];
  });

  const updateListener = EditorView.updateListener.of((update) => {
    if (suppressUpdate || !update.docChanged) return;

    void refreshSyntaxDecorations(update.state.doc.toString());

    const change = getSingleEditableChange(update);
    if (change) emit('update-region', change);
  });

  const clickHandlers = EditorView.domEventHandlers({
    mousedown(event, currentView) {
      const position = currentView.posAtCoords({
        x: event.clientX,
        y: event.clientY,
      });
      const region = typeof position === 'number' ? findRegionAt(position) : null;

      if (region?.kind === 'boolean-prop') {
        event.preventDefault();
        emit('toggle-boolean', region.prop);
        return true;
      }

      if (isEnumRegion(region)) {
        event.preventDefault();
        openEnumPopover(region);
        return true;
      }

      closeEnumPopover();
      return false;
    },
  });

  view = new EditorView({
    parent: editorElement.value,
    state: EditorState.create({
      doc: props.code,
      extensions: [
        transactionFilter,
        updateListener,
        clickHandlers,
        EditorView.contentAttributes.of({
          'aria-label': 'Editable component usage code',
        }),
        keymap.of([
          {
            key: 'Enter',
            run: openRegionAtSelection,
          },
        ]),
        syntaxCompartment.of(EditorView.decorations.of(Decoration.set([], true))),
        regionCompartment.of(EditorView.decorations.of(createRegionDecorations(Decoration))),
        EditorView.theme({
          '&': {
            backgroundColor: 'transparent',
            color: 'inherit',
          },
          '.cm-content': {
            fontFamily: 'var(--_component-playground-monospace-font-family)',
            padding: 'var(--component-playground-code-padding, 1rem)',
          },
          '.cm-line': {
            lineHeight: 'var(--_component-playground-line-height)',
          },
          '.cm-scroller': {
            overflow: 'auto',
          },
          '.cm-focused': {
            outline: 'none',
          },
        }),
      ],
    }),
  });

  editorReady.value = true;
  void refreshSyntaxDecorations(props.code);
});

watch(
  () => props.regions,
  (regions) => {
    currentRegions = regions;

    if (!view || !regionCompartment || !codeMirrorEditorView || !codeMirrorDecoration) return;

    view.dispatch({
      effects: regionCompartment.reconfigure(
        codeMirrorEditorView.decorations.of(createRegionDecorations(codeMirrorDecoration)),
      ),
    });
  },
  { deep: true },
);

watch(
  () => props.code,
  (code) => {
    if (!view || view.state.doc.toString() === code) return;

    const selection = view.state.selection.main;
    const anchor = Math.min(selection.anchor, code.length);
    const head = Math.min(selection.head, code.length);

    suppressUpdate = true;
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: code,
      },
      selection: codeMirrorEditorSelection.range(anchor, head),
    });
    suppressUpdate = false;
    void refreshSyntaxDecorations(code);
  },
);

watch(
  () => [props.language, props.syntaxThemes?.light, props.syntaxThemes?.dark],
  () => {
    if (!view) return;

    void refreshSyntaxDecorations(view.state.doc.toString());
  },
);

onBeforeUnmount(() => {
  unmounted = true;
  highlightSequence += 1;
  view?.destroy();
  view = undefined;
});
</script>

<style scoped>
.component-playground-code {
  position: relative;
  min-width: 0;
  color: var(--_component-playground-foreground-color);
  font-family: var(--_component-playground-monospace-font-family);
  line-height: var(--_component-playground-line-height);
}

.component-playground-code__editor {
  min-width: 0;
}

.component-playground-code :deep(.cm-content) {
  caret-color: currentColor;
}

.component-playground-code :deep(.cm-cursor),
.component-playground-code :deep(.cm-dropCursor) {
  border-left-color: currentColor;
}

.component-playground-code__fallback {
  min-width: 0;
  padding: var(--component-playground-code-padding, 1rem);
  margin: 0;
  overflow-x: auto;
  background: transparent;
  color: var(--_component-playground-foreground-color);
  font: inherit;
}

.component-playground-code :deep(.component-playground-code__region) {
  border-bottom: var(--_component-playground-border-width) dotted
    var(--_component-playground-accent-color);
  cursor: text;
}

.component-playground-code :deep(.component-playground-code__region--enum),
.component-playground-code :deep(.component-playground-code__region--boolean-prop) {
  cursor: pointer;
}

.component-playground-code :deep(.component-playground-code__region:hover) {
  background-color: var(--_component-playground-hover-background-color);
}

.component-playground-code :deep(.component-playground-code__region--inactive) {
  opacity: 0.45;
}

.component-playground-code :deep(.component-playground-code__region--inactive:hover) {
  opacity: 0.75;
}

.component-playground-code :deep(.component-playground-code__token) {
  color: var(--component-playground-token-light, currentColor);
}

.component-playground-code__enum-menu {
  position: fixed;
  z-index: 100;
  max-width: calc(100vw - 1rem);
  max-block-size: min(16rem, calc(100vh - 1rem));
  overflow-y: auto;
  border-color: var(--component-playground-border-color, #d1d9e0);
  border-style: var(--component-playground-border-style, solid);
  border-width: var(--component-playground-border-width, 1px);
  border-radius: var(--component-playground-border-radius, 0.375rem);
  background: var(--component-playground-background-color, #f6f8fa);
  color: var(--component-playground-foreground-color, #1f2328);
  color-scheme: light;
  font-family: var(
    --component-playground-monospace-font-family,
    ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace
  );
  font-size: var(--component-playground-font-size, 0.875rem);
  line-height: var(--component-playground-line-height, 1.5);
}

.component-playground-code__enum-option {
  display: block;
  width: 100%;
  padding: var(--component-playground-control-padding-block, 0.35rem)
    var(--component-playground-control-padding-inline, 0.6rem);
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.component-playground-code__enum-option:hover,
.component-playground-code__enum-option:focus-visible {
  background-color: var(--component-playground-hover-background-color, #d8dee4);
}

.component-playground-code__enum-option:focus-visible {
  outline: var(--component-playground-focus-width, 2px) solid
    var(--component-playground-focus-color, #0969da);
  outline-offset: calc(-1 * var(--component-playground-focus-width, 2px));
}

.component-playground-code__enum-option--active {
  background-color: var(--component-playground-active-background-color, #b6d6ff);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.component-playground-code__enum-menu[data-appearance='dark'] {
  color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
  .component-playground-code[data-appearance='auto'] :deep(.component-playground-code__token) {
    color: var(
      --component-playground-token-dark,
      var(--component-playground-token-light, currentColor)
    );
  }

  .component-playground-code__enum-menu[data-appearance='auto'] {
    color-scheme: dark;
  }
}

.component-playground-code[data-appearance='dark'] :deep(.component-playground-code__token) {
  color: var(
    --component-playground-token-dark,
    var(--component-playground-token-light, currentColor)
  );
}
</style>
