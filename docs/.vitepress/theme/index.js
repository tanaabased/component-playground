import { ComponentPlayground } from '@tanaab/component-playground';
import '@tanaab/component-playground/style.css';
import DefaultTheme from 'vitepress/theme';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ComponentPlayground', ComponentPlayground);
  },
};
