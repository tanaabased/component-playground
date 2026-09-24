import { defineComponent, h } from 'vue';

import ComponentPlayground from './components/ComponentPlayground.vue';

function createVitePressPlayground(useData, syntaxThemes) {
  return defineComponent({
    name: 'VitePressComponentPlayground',
    inheritAttrs: false,
    emits: ['copy', 'update:state'],
    setup(_props, { attrs, emit }) {
      const { isDark } = useData();

      return () =>
        h(ComponentPlayground, {
          ...attrs,
          appearance: isDark.value ? 'dark' : 'light',
          'data-vitepress': '',
          syntaxThemes: attrs.syntaxThemes ?? syntaxThemes,
          onCopy: (usage) => emit('copy', usage),
          'onUpdate:state': (state) => emit('update:state', state),
        });
    },
  });
}

export function withComponentPlayground(theme, options = {}) {
  if (typeof options.useData !== 'function') {
    throw new TypeError('withComponentPlayground requires the VitePress useData composable');
  }

  const playground = createVitePressPlayground(options.useData, options.syntaxThemes);

  return {
    ...theme,
    enhanceApp(context) {
      const result = theme?.enhanceApp?.(context);
      context.app.component('ComponentPlayground', playground);
      return result;
    },
  };
}
