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

Repeat slots accept `component`, `componentName`, optional child `props`, and either `defaultCount`
or a `countControl`. `autoCountProp` can derive an automatic count from a numeric parent prop.

### Playground options

| Prop           | Behavior                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `component`    | Required Vue component constructor, component object, or registered component name to preview.                   |
| `schema`       | Required description of the component name and editable surface.                                                 |
| `source`       | Optional explicit URL for the **source** link. This replaces automatic theme source-link inference.              |
| `initialState` | Optional `{ controls, props, slots }` overrides. Declared keys override schema defaults; other keys are ignored. |
| `previewFit`   | `full` (default) or `contained`. Invalid values resolve to `full`.                                               |

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

The **copy** and **reset** controls are ordinary buttons and remain keyboard reachable. The live
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
- The optional stylesheet is structural. It inherits host typography and color and exposes no public
  theming API yet.
- The package targets Vue 3 and has no Nuxt-specific integration in this release.
