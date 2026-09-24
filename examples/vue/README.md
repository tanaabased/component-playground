# Vue consumer

This scenario installs the prepared Component Playground package into a minimal Vue application
and builds the application through the package's documented public component and stylesheet
imports.

## Setup

```bash
# should install the Component Playground package into a disposable Vue consumer
cp -R . "$TMPDIR/vue-consumer"
cd "$TMPDIR/vue-consumer"
npm install --ignore-scripts --no-audit --no-fund --package-lock=false "$COMPONENT_PLAYGROUND_PACKAGE"
```

## Testing

```bash
# should build the Vue consumer through the public package exports
cd "$TMPDIR/vue-consumer"
npm run build
test -f dist/index.html
```
