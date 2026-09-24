import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExampleLogo from '../docs/components/ExampleLogo.vue';
import exampleLogoSource from '../docs/components/ExampleLogo.vue?raw';
import { logoSchema } from '../docs/example-schemas.js';

describe('ExampleLogo', () => {
  it('exposes every logo prop and layout in the documentation schema', () => {
    expect(Object.keys(logoSchema.props)).toEqual(['type', 'link', 'color', 'background']);
    expect(logoSchema.props.type.options).toEqual(['left', 'right', 'centered', 'mark']);
  });

  it('renders the accessible centered logo with default theme variables', () => {
    const wrapper = mount(ExampleLogo);

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('aria-label')).toBe('Tanaab Maneuvering Systems');
    expect(wrapper.attributes('href')).toBe('/');
    expect(wrapper.attributes('data-type')).toBe('centered');
    expect(wrapper.element.style.getPropertyValue('--example-logo-background')).toBe('none');
    expect(wrapper.element.style.getPropertyValue('--example-logo-color')).toBe(
      'var(--vp-c-text-1)',
    );
    expect(wrapper.element.style.getPropertyValue('--example-logo-image')).toContain(
      'tms-centered.svg',
    );
    expect(wrapper.get('.example-logo__image').attributes('aria-hidden')).toBe('true');
  });

  it('selects every layout and applies custom presentation values', async () => {
    const wrapper = mount(ExampleLogo, {
      props: {
        background: '#fff7ed',
        color: '#db2777',
        link: 'https://github.com/tanaabased',
        type: 'left',
      },
    });

    expect(wrapper.attributes('href')).toBe('https://github.com/tanaabased');
    expect(wrapper.attributes('data-type')).toBe('left');
    expect(wrapper.element.style.getPropertyValue('--example-logo-image')).toContain(
      'tms-left.svg',
    );
    expect(wrapper.element.style.getPropertyValue('--example-logo-background')).toBe('#fff7ed');
    expect(wrapper.element.style.getPropertyValue('--example-logo-color')).toBe('#db2777');

    await wrapper.setProps({ type: 'right' });
    expect(wrapper.attributes('data-type')).toBe('right');
    expect(wrapper.element.style.getPropertyValue('--example-logo-image')).toContain(
      'tms-right.svg',
    );

    await wrapper.setProps({ type: 'mark' });
    expect(wrapper.attributes('data-type')).toBe('mark');
    expect(wrapper.element.style.getPropertyValue('--example-logo-image')).toContain(
      'tms-mark.svg',
    );
  });

  it('keeps the mark at the same wrapper size as every other layout', () => {
    expect(exampleLogoSource).toContain('width: min(100%, 20rem);');
    expect(exampleLogoSource).not.toMatch(/\.example-logo\[data-type='mark'\]\s*\{/);
  });

  it('falls back from blank presentation values and an unsupported type', async () => {
    const wrapper = mount(ExampleLogo, {
      global: {
        config: {
          warnHandler: () => {},
        },
      },
    });

    await wrapper.setProps({ background: ' ', color: ' ', link: ' ', type: 'unknown' });
    expect(wrapper.attributes('href')).toBe('/');
    expect(wrapper.attributes('data-type')).toBe('centered');
    expect(wrapper.element.style.getPropertyValue('--example-logo-background')).toBe('none');
    expect(wrapper.element.style.getPropertyValue('--example-logo-color')).toBe(
      'var(--vp-c-text-1)',
    );
  });
});
