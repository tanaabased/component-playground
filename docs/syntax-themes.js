import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';
import vitesseDark from 'shiki/themes/vitesse-dark.mjs';
import vitesseLight from 'shiki/themes/vitesse-light.mjs';

export const syntaxThemePairs = Object.freeze({
  github: Object.freeze({
    light: githubLight,
    dark: githubDark,
  }),
  vitesse: Object.freeze({
    light: vitesseLight,
    dark: vitesseDark,
  }),
});
