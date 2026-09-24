# Schema, behavior, and limitations

The schema describes the editable surface for one component example. It does not replace the
component's Vue prop or slot declarations.

## Schema shape

```js
const schema = {
  name: 'ExampleComponent',
  props: {
    label: { kind: 'string', default: 'Example' },
    count: { kind: 'number', default: 2 },
    tone: { kind: 'enum', options: ['quiet', 'loud'], default: 'quiet' },
    visible: { kind: 'boolean', default: true },
    items: {
      kind: 'object-array',
      default: [{ label: 'One', meta: { tone: 'quiet' } }],
      fields: [
        { path: 'label', kind: 'string' },
        { path: 'meta.tone', kind: 'enum', options: ['quiet', 'loud'] },
        { path: 'note', kind: 'string', optional: true },
      ],
    },
  },
  slots: {
    title: { kind: 'text', default: 'Named slot' },
    default: { kind: 'html', default: '<strong>Trusted HTML</strong>' },
  },
};
```

### Props

| Kind           | Editable value                                                    |
| -------------- | ----------------------------------------------------------------- |
| `string`       | Attribute text                                                    |
| `number`       | Bound numeric value                                               |
| `enum`         | One value from `options`                                          |
| `boolean`      | Presence or an explicit `false` for a default-true prop           |
| `object-array` | Declared string and enum fields, including one nested object path |

Object arrays may also declare `presets`, `presetControl`, and `countControl`. Those controls change
the demonstration state but are omitted from copied component markup.

### Slots

- `text` escapes markup and remains editable.
- `html` renders trusted demo HTML and remains editable.
- `repeat` is available for the default slot and generates repeated child components from `items`.

Repeat slots accept `component`, `componentName`, optional shared child `props`, and either
`defaultCount` or a `countControl`. Each `items` entry may be a label string or
`{ label, props }`; item props override shared props for that child. `autoCountProp` can derive an
automatic count from a numeric parent prop.

### Playground options

| Prop           | Behavior                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `component`    | Required Vue component constructor, component object, or registered component name to preview.                   |
| `schema`       | Required description of the component name and editable surface.                                                 |
| `source`       | Optional explicit URL for the **source** link. This replaces automatic theme source-link inference.              |
| `initialState` | Optional `{ controls, props, slots }` overrides. Declared keys override schema defaults; other keys are ignored. |
| `previewFit`   | `full` (default) or `contained`. Invalid values resolve to `full`.                                               |
| `appearance`   | `auto` (default), `light`, or `dark`. Invalid values resolve to `auto`.                                          |
| `language`     | `vue` (default) or `html`; controls the visible code label and Shiki grammar.                                    |
| `syntaxThemes` | Optional `{ light, dark }` Shiki theme registrations or lazy registration loaders.                               |

## Syntax highlighting contract

The `language` prop defaults to `vue`; `html` is available for examples that generate plain HTML. It
selects both the visible language label and the loaded Shiki grammar. Omitting `syntaxThemes`
preserves the lazily loaded `github-light` and `github-dark` defaults. Each configured value may be a
Shiki theme registration or a function that returns a registration, module, or promise. Import
themes from exact `shiki/themes/*.mjs` paths so consumers ship only the selected pair rather than the
complete bundled-theme registry.

Raw registration pairs can be shared with compatible Shiki-based Markdown renderers. Lazy loaders are
useful when an application wants separate theme chunks, but build-time renderers generally consume
the resolved registrations. Theme selection is per playground instance. A later code or theme update
wins over older asynchronous work, and a failed load removes token colors without disabling the
readable, editable code surface.

## Styling contract

The package stylesheet gives playground chrome standalone light and dark defaults. `appearance="auto"`
uses `prefers-color-scheme`; `light` and `dark` remain fixed regardless of the operating-system
setting. Set any of these variables on a playground instance or an ancestor:

| Variable                                         | Purpose                               | Default                         |
| ------------------------------------------------ | ------------------------------------- | ------------------------------- |
| `--component-playground-background-color`        | Code and control surfaces             | `#f6f8fa` light; `#0d1117` dark |
| `--component-playground-foreground-color`        | Primary chrome and code text          | `#1f2328` light; `#f0f6fc` dark |
| `--component-playground-muted-color`             | Secondary action text                 | `#59636e` light; `#9198a1` dark |
| `--component-playground-border-color`            | Code, button, and menu borders        | `#d1d9e0` light; `#3d444d` dark |
| `--component-playground-accent-color`            | Links and editable-region markers     | `#0969da` light; `#58a6ff` dark |
| `--component-playground-hover-background-color`  | Hovered controls and regions          | `#d8dee4` light; `#262c36` dark |
| `--component-playground-active-background-color` | Active controls and selected options  | `#b6d6ff` light; `#1f4979` dark |
| `--component-playground-focus-color`             | Keyboard focus outlines               | `#0969da` light; `#58a6ff` dark |
| `--component-playground-font-family`             | Playground action typography          | System sans-serif stack         |
| `--component-playground-monospace-font-family`   | Code and enum-menu typography         | System monospace stack          |
| `--component-playground-font-size`               | Base chrome and code size             | `0.875rem`                      |
| `--component-playground-line-height`             | Code and menu line height             | `1.5`                           |
| `--component-playground-gap`                     | Preview-to-code spacing               | `1rem`                          |
| `--component-playground-actions-gap`             | Action-row spacing                    | `0.35rem`                       |
| `--component-playground-code-padding`            | Code editor padding                   | `1rem`                          |
| `--component-playground-control-padding-block`   | Button and menu-option block padding  | `0.35rem`                       |
| `--component-playground-control-padding-inline`  | Button and menu-option inline padding | `0.6rem`                        |
| `--component-playground-border-width`            | Chrome border width                   | `1px`                           |
| `--component-playground-border-style`            | Chrome border style                   | `solid`                         |
| `--component-playground-border-radius`           | Code, button, and menu corner radius  | `0.375rem`                      |
| `--component-playground-focus-width`             | Keyboard focus outline width          | `2px`                           |

The preview wrapper uses structural layout only. It does not apply playground colors, typography,
or interaction styling to the demonstrated component. A floating enum menu copies the resolved
public variables from its owning playground when it opens, so separate instances can safely carry
different overrides despite the menu being teleported to `body`.

## Events and state

`copy` emits the exact clean component-usage string written to the clipboard. `update:state` emits
after any state mutation with `{ controls, props, slots }`. The payload is a shallow snapshot of the
top-level state groups; consumers should treat it as an observation rather than a writable state
object.

The resolved initial state begins with schema defaults, then applies `initialState`. Object-array
presets normally derive their prop value from their selected controls, except when that prop appears
in `initialState.props`. **Reset**, and changes to `schema` or `initialState`, restore that resolved
state.

## Controls and copy behavior

`schema.controls` supports enum selectors. They are rendered as playground-only comments in the
editable display and can derive object-array values through `presetControl` and `countControl`.
Controls never appear in copied markup.

Copy produces component usage only: no imports, wrapper code, playground controls, or empty optional
object-array fields. A false boolean whose schema default is false is omitted; a false boolean whose
schema default is true is preserved as an explicit `:prop="false"`. Optional object-array fields are
shown while editing, but empty (`undefined`, `null`, or `''`) fields are omitted from both the copied
markup and preview prop object.

## Interaction and keyboard behavior

The generated usage is an editor with only declared text regions editable. Text, number, and
object-array string regions accept normal text editing; number input is coerced to a finite number
or `0`. Enum values and boolean attributes are operated as controls rather than free-form text:

- Click a boolean attribute or press <kbd>Enter</kbd> while it is selected to toggle it.
- Click an enum value or press <kbd>Enter</kbd> while it is selected to open its option menu.
- Opening an enum menu focuses its selected option (or the first option); selecting an option returns
  focus to the editor.
- <kbd>Escape</kbd> closes an enum menu and restores editor focus. Moving focus outside the editor or
  menu closes it without restoring focus.

The standalone code header presents the active language and copy action as `vue | copy`; the action
changes to `copied` after activation. The VitePress integration projects its native icon treatment
from the same semantic button. **Copy** and **reset** remain keyboard reachable. The live
[capability examples](/examples) demonstrate each editable region, controls, reset, copied output,
and event observation.

## Original playground capability inventory

The standalone package preserves the original theme playground's interactive core while removing its
theme dependency. The table accounts for the known theme behavior and points to its supported
replacement, because hand-waving at a migration is how documentation becomes archaeological fiction.

| Original theme capability                                     | Standalone status    | Documentation                                                           |
| ------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------- |
| Preview beside editable component usage                       | Preserved            | [Examples: props and slots](/examples#props-and-text-or-html-slots)     |
| Editable props, text slots, HTML slots, and repeated children | Preserved            | [Schema shape](#schema-shape), [examples](/examples)                    |
| Enum, boolean, preset, and count controls                     | Preserved            | [Controls and copy behavior](#controls-and-copy-behavior)               |
| Copyable component usage                                      | Preserved            | [Controls and copy behavior](#controls-and-copy-behavior)               |
| Reset to authored initial values                              | Preserved            | [Events and state](#events-and-state)                                   |
| Keyboard operation of editable regions and menus              | Preserved            | [Interaction and keyboard behavior](#interaction-and-keyboard-behavior) |
| Automatic source-link inference from a theme page             | Deliberately changed | [Explicit `source` URLs](/guide/#minimal-vue-usage)                     |

No missing implementation capability was found during this documentation audit. Any later,
reproducible discrepancy belongs in a follow-up issue rather than in an opportunistic expansion of
this task.

## Proof-of-concept limitations

- Copied output contains component usage, not imports or surrounding `<script setup>` code.
- Demonstration controls are currently enum selectors rather than a general control API.
- Object-array editing is limited to declared string and enum fields.
- HTML slot values are rendered with `v-html`; schemas must provide trusted content.
- The stylesheet is optional; consumers that omit it own all layout, interaction, and menu styling.
- The package targets Vue 3 and has no Nuxt-specific integration in this release.
