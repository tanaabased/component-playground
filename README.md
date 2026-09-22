# Component Playground

A small Vue 3 component for building schema-driven, interactive component examples without a
VitePress or Tanaab runtime dependency.

## Development

Use Bun 1.4.2 and Node 26:

```sh
bun install --frozen-lockfile --ignore-scripts
bun run lint
bun run test
bun run build
bun run test:package
```

`test:package` builds the package, packs it, installs that exact tarball into the plain Vue example,
and runs the example's production build. It requires Node 26 because the current Vite toolchain is
part of the consumer check.

## Package boundary

The package exports the `ComponentPlayground` Vue component and an optional structural stylesheet:

```js
import { ComponentPlayground } from '@tanaab/component-playground';
import '@tanaab/component-playground/style.css';
```

Pass the component to preview, its playground schema, and an explicit source URL when a source link
is useful:

```vue
<ComponentPlayground
  :component="ExampleButton"
  :schema="buttonSchema"
  source="https://github.com/example/project/blob/main/components/ExampleButton.vue"
/>
```

The stylesheet intentionally provides only layout, overflow, focus, and popover behavior. Typography
and color inherit from the consuming application. VitePress documentation, public theming hooks, and
publication are separate follow-up work.
