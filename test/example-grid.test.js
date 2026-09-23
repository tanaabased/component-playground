import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExampleGrid from '../docs/components/ExampleGrid.vue';

describe('ExampleGrid', () => {
  it('defaults to one column and preserves its slot content', () => {
    const wrapper = mount(ExampleGrid, {
      slots: {
        default: '<article>Navigation</article><article>Search</article>',
      },
    });

    expect(wrapper.attributes('data-columns')).toBe('1');
    expect(wrapper.element.style.getPropertyValue('--example-grid-columns')).toBe('1');
    expect(wrapper.findAll('article')).toHaveLength(2);
  });

  it('uses supported column counts and falls back for invalid values', async () => {
    const wrapper = mount(ExampleGrid, {
      props: {
        columns: 4,
      },
    });

    expect(wrapper.attributes('data-columns')).toBe('4');
    expect(wrapper.element.style.getPropertyValue('--example-grid-columns')).toBe('4');

    await wrapper.setProps({ columns: 2.5 });
    expect(wrapper.attributes('data-columns')).toBe('1');
    expect(wrapper.element.style.getPropertyValue('--example-grid-columns')).toBe('1');

    await wrapper.setProps({ columns: 0 });
    expect(wrapper.attributes('data-columns')).toBe('1');
  });
});
