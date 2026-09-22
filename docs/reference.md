# Schema and limitations

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

`source` supplies an explicit source URL. `initialState` overrides initial controls, props, or slots.
`previewFit` accepts `full` or `contained`.

## Proof-of-concept limitations

- Copied output contains component usage, not imports or surrounding `<script setup>` code.
- Demonstration controls are currently enum selectors rather than a general control API.
- Object-array editing is limited to declared string and enum fields.
- HTML slot values are rendered with `v-html`; schemas must provide trusted content.
- The optional stylesheet is structural. It inherits host typography and color and exposes no public
  theming API yet.
- The package targets Vue 3 and has no Nuxt-specific integration in this release.
