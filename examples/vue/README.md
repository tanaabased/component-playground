# Vue consumer

This scenario installs one prepared package tarball into a minimal Vue application and builds the
application through the package's documented public component and stylesheet imports.

## Setup

```bash
# should install the candidate package into a disposable Vue consumer
test -n "$TARBALL"
test -f "$TARBALL"
cp -R . "$TMPDIR/vue-consumer"
cd "$TMPDIR/vue-consumer"
npm install --ignore-scripts --no-audit --no-fund --package-lock=false "$TARBALL"
```

## Testing

```bash
# should build the Vue consumer through the public package exports
cd "$TMPDIR/vue-consumer"
npm run build
test -f dist/index.html
```
