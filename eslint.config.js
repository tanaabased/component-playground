import { builtinModules } from 'node:module';

import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const restrictedBuiltinImports = builtinModules
  .filter((name) => !name.startsWith('_') && !name.startsWith('node:'))
  .map((name) => ({
    name,
    message: `Use node:${name} instead of bare builtin imports.`,
  }));

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/temp/**',
    '**/.vitepress/cache/**',
  ]),
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: restrictedBuiltinImports,
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.type='Identifier'][callee.name='require']",
          message: 'Use ESM imports instead of require() in module files.',
        },
        {
          selector:
            "AssignmentExpression[left.type='MemberExpression'][left.object.type='Identifier'][left.object.name='module'][left.property.type='Identifier'][left.property.name='exports']",
          message: 'Use ESM exports instead of module.exports.',
        },
      ],
    },
  },
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.browser,
    },
  },
  {
    files: ['examples/plain-vue/**/*.{js,vue}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['test/**/*.{js,mjs}', '**/*.spec.{js,mjs}'],
    languageOptions: {
      globals: globals.mocha,
    },
  },
  {
    files: ['test/components/**/*.{js,mjs}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  prettierConfig,
]);
