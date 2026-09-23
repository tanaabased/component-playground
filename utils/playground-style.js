const floatingStyleProperties = {
  '--component-playground-background-color': '--_component-playground-background-color',
  '--component-playground-foreground-color': '--_component-playground-foreground-color',
  '--component-playground-muted-color': '--_component-playground-muted-color',
  '--component-playground-border-color': '--_component-playground-border-color',
  '--component-playground-accent-color': '--_component-playground-accent-color',
  '--component-playground-hover-background-color': '--_component-playground-hover-background-color',
  '--component-playground-active-background-color':
    '--_component-playground-active-background-color',
  '--component-playground-focus-color': '--_component-playground-focus-color',
  '--component-playground-font-family': '--_component-playground-font-family',
  '--component-playground-monospace-font-family': '--_component-playground-monospace-font-family',
  '--component-playground-font-size': '--_component-playground-font-size',
  '--component-playground-line-height': '--_component-playground-line-height',
  '--component-playground-control-padding-block': '--_component-playground-control-padding-block',
  '--component-playground-control-padding-inline': '--_component-playground-control-padding-inline',
  '--component-playground-border-width': '--_component-playground-border-width',
  '--component-playground-border-style': '--_component-playground-border-style',
  '--component-playground-border-radius': '--_component-playground-border-radius',
  '--component-playground-focus-width': '--_component-playground-focus-width',
};

export function resolvePlaygroundAppearance(appearance) {
  return appearance === 'light' || appearance === 'dark' ? appearance : 'auto';
}

export function createFloatingPlaygroundStyle(computedStyle) {
  return Object.fromEntries(
    Object.entries(floatingStyleProperties).flatMap(([publicName, resolvedName]) => {
      const value = computedStyle.getPropertyValue(resolvedName).trim();
      return value ? [[publicName, value]] : [];
    }),
  );
}

export function getFloatingPlaygroundStyle(element) {
  return createFloatingPlaygroundStyle(window.getComputedStyle(element));
}
