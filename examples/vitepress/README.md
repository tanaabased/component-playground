# VitePress consumer

This scenario installs the prepared Component Playground package into a minimal VitePress site and
builds the site through the documented public component, stylesheet, theme adapter, and syntax
imports.

## Setup

```bash
# should install the Component Playground package into a disposable VitePress consumer
test -n "$COMPONENT_PLAYGROUND_PACKAGE"
test -f "$COMPONENT_PLAYGROUND_PACKAGE"
cp -R . "$TMPDIR/vitepress-consumer"
cd "$TMPDIR/vitepress-consumer"
npm install --ignore-scripts --no-audit --no-fund --package-lock=false "$COMPONENT_PLAYGROUND_PACKAGE"
```

## Testing

```bash
# should build the VitePress consumer through the public package exports
cd "$TMPDIR/vitepress-consumer"
npm run build
test -f docs/.vitepress/dist/index.html
```
