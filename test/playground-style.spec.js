import assert from 'node:assert/strict';

import {
  createFloatingPlaygroundStyle,
  resolvePlaygroundAppearance,
} from '../utils/playground-style.js';

describe('utils/playground-style', () => {
  it('should resolve supported appearances and fall back to automatic mode', () => {
    assert.equal(resolvePlaygroundAppearance('light'), 'light');
    assert.equal(resolvePlaygroundAppearance('dark'), 'dark');
    assert.equal(resolvePlaygroundAppearance('auto'), 'auto');
    assert.equal(resolvePlaygroundAppearance('sepia'), 'auto');
  });

  it('should transfer resolved instance variables to a floating menu', () => {
    const values = new Map([
      ['--_component-playground-background-color', '  #101820  '],
      ['--_component-playground-foreground-color', '#f8f9fa'],
      ['--_component-playground-focus-color', '#ffd166'],
      ['--_component-playground-border-radius', '0.75rem'],
    ]);
    const computedStyle = {
      getPropertyValue(name) {
        return values.get(name) ?? '';
      },
    };

    assert.deepEqual(createFloatingPlaygroundStyle(computedStyle), {
      '--component-playground-background-color': '#101820',
      '--component-playground-foreground-color': '#f8f9fa',
      '--component-playground-focus-color': '#ffd166',
      '--component-playground-border-radius': '0.75rem',
    });
  });
});
