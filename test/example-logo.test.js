import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExampleLogo from '../docs/components/ExampleLogo.vue';

describe('ExampleLogo', () => {
  it('renders an accessible logo link with default theme variables', () => {
    const wrapper = mount(ExampleLogo);

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('aria-label')).toBe('Tanaab Maneuvering Systems');
    expect(wrapper.attributes('href')).toBe('/');
    expect(wrapper.element.style.getPropertyValue('--example-logo-background')).toBe(
      'var(--vp-c-bg-soft)',
    );
    expect(wrapper.element.style.getPropertyValue('--example-logo-color')).toBe(
      'var(--vp-c-brand-1)',
    );
    expect(wrapper.get('.example-logo__mark').attributes('aria-hidden')).toBe('true');
  });

  it('applies custom values and falls back when they are blank', async () => {
    const wrapper = mount(ExampleLogo, {
      props: {
        background: '#fff7ed',
        color: '#db2777',
        link: 'https://github.com/tanaabased',
      },
    });

    expect(wrapper.attributes('href')).toBe('https://github.com/tanaabased');
    expect(wrapper.element.style.getPropertyValue('--example-logo-background')).toBe('#fff7ed');
    expect(wrapper.element.style.getPropertyValue('--example-logo-color')).toBe('#db2777');

    await wrapper.setProps({ background: ' ', color: ' ', link: ' ' });
    expect(wrapper.attributes('href')).toBe('/');
    expect(wrapper.element.style.getPropertyValue('--example-logo-background')).toBe(
      'var(--vp-c-bg-soft)',
    );
    expect(wrapper.element.style.getPropertyValue('--example-logo-color')).toBe(
      'var(--vp-c-brand-1)',
    );
  });
});
