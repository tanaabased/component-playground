# VitePress consumer

This scenario installs the same prepared package tarball into a minimal VitePress site and builds
the site through the documented public component, stylesheet, theme adapter, and syntax imports.

## Setup

```bash
# should install the candidate package into a disposable VitePress consumer
test -n "$TARBALL"
test -f "$TARBALL"
cp -R . "$TMPDIR/vitepress-consumer"
cd "$TMPDIR/vitepress-consumer"
npm install --ignore-scripts --no-audit --no-fund --package-lock=false "$TARBALL"
```

## Testing

```bash
# should build the VitePress consumer through the public package exports
cd "$TMPDIR/vitepress-consumer"
npm run build
test -f docs/.vitepress/dist/index.html
```
