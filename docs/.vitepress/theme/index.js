import '@tanaab/component-playground/style.css';
import { withComponentPlayground } from '@tanaab/component-playground/vitepress';
import '@tanaab/component-playground/vitepress.css';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import { syntaxThemePairs } from '../../syntax-themes.js';

export default withComponentPlayground(DefaultTheme, {
  syntaxThemes: syntaxThemePairs.github,
  useData,
});
