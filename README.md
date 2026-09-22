# Component Playground

A small Vue 3 component for building schema-driven, interactive component examples without a
VitePress or Tanaab runtime dependency.

## Install

```sh
npm install @tanaab/component-playground
```

## Development

Use Bun 1.4.2 and Node 26:

```sh
bun install --frozen-lockfile --ignore-scripts
bun run lint
bun run test
bun run build
bun run test:package
bun run dev:docs
```

`test:package` builds the package, packs it, installs that exact tarball into the plain Vue example,
and runs the example's production build. It requires Node 26 because the current Vite toolchain is
part of the consumer check. `build` produces both the package and the stock-theme VitePress site;
`dev:docs` builds the local package first so the site exercises its public exports.

## Deploy

The documentation site is ready for Netlify through [`netlify.toml`](netlify.toml). Import
`tanaabased/component-playground` as an existing Git repository, use `main` as the production branch,
and leave the base directory unset. The repository configuration installs the locked dependencies
with Bun 1.4.2, runs the package and documentation build, and publishes
`docs/.vitepress/dist`. No deployment secrets are required.

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
and color inherit from the consuming application. The [guide](docs/guide/index.md), [live capability
examples](docs/examples.md), and [schema reference](docs/reference.md) document the proof of concept.
Public theming hooks remain separate work.
