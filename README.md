# Component Playground

A small Vue 3 component for building schema-driven, interactive component examples without a
VitePress or Tanaab runtime dependency.

Try the [live demo](https://cp.tanaab.dev).

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
bun run test:components
bun run test:components -- -t "test name"
bun run test:components:watch
bun run build
bun run test:package
bun run dev:docs
```

`test` runs the Mocha unit suite and the Vitest component suite. The component commands provide
non-watch, focused, and watch modes using Vue Test Utils and jsdom; they verify behavior rather than
browser layout or visual appearance.

`test:package` builds the package, packs it once, installs that exact tarball into separate plain Vue
and VitePress consumers, and runs both production builds. It requires Node 26 because the current
Vite toolchain is part of the consumer check. `build` produces the package and the stock-theme
VitePress site; `dev:docs` builds the local package first so the site exercises its public exports.

## Deploy

The documentation site is ready for Netlify through [`netlify.toml`](netlify.toml). Import
`tanaabased/component-playground` as an existing Git repository, use `main` as the production branch,
and leave the base directory unset. The repository configuration installs the locked dependencies
with Bun 1.4.2, runs the package and documentation build, and publishes
`docs/.vitepress/dist`. No deployment secrets are required.

Package releases use npm trusted publishing. Configure the package's GitHub trusted publisher for
`tanaabased/component-playground` and workflow `release.yml` before releasing. The
`TANAAB_NPM_DEPLOY` secret is used only to update the `edge` dist-tag after a stable release.

## Package boundary

The package exports the `ComponentPlayground` Vue component and its standalone stylesheet:

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

The stylesheet provides usable light and dark defaults without a VitePress or Tanaab dependency.
Use the `appearance` prop and the documented `--component-playground-*` variables to adapt each
instance; floating enum menus retain their owning instance's values after teleporting to `body`.
Use `syntaxThemes` with exact Shiki theme imports to share a light/dark syntax pair without bundling
the complete theme registry.

VitePress consumers can opt into `@tanaab/component-playground/vitepress` and
`@tanaab/component-playground/vitepress.css`. The helper registers the same component with the
site's reactive appearance and a shared Markdown/playground Shiki pair; ordinary Vue imports do not
load VitePress.
The [installation paths](docs/installation.md), [guide](docs/guide/index.md), [live capability
examples](docs/examples.md), and [schema and styling reference](docs/reference.md) document the
complete contract.
