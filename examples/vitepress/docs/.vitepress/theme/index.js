import '@tanaab/component-playground/style.css';
import { withComponentPlayground } from '@tanaab/component-playground/vitepress';
import '@tanaab/component-playground/vitepress.css';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import { syntaxThemes } from '../../syntax-themes.js';

export default withComponentPlayground(DefaultTheme, {
  syntaxThemes,
  useData,
});
