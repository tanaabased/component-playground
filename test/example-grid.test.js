import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExampleGrid from '../docs/components/ExampleGrid.vue';
import { gridSchema } from '../docs/example-schemas.js';

describe('ExampleGrid', () => {
  it('exposes all six column counts in the documentation schema', () => {
    expect(Object.keys(gridSchema.props)).toEqual(['columns']);
    expect(gridSchema.controls.boxCount.options).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      'auto',
    ]);
    expect(gridSchema.slots.default.items).toHaveLength(12);
    expect(gridSchema.slots.default.items.every((item) => item.props.style)).toBe(true);
    expect(Object.keys(gridSchema.slots)).toEqual(['default']);
  });

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

  it('accepts numeric and numeric-string columns through six and falls back for invalid values', async () => {
    const wrapper = mount(ExampleGrid, {
      props: {
        columns: 6,
      },
    });

    expect(wrapper.attributes('data-columns')).toBe('6');
    expect(wrapper.element.style.getPropertyValue('--example-grid-columns')).toBe('6');

    await wrapper.setProps({ columns: '5' });
    expect(wrapper.attributes('data-columns')).toBe('5');
    expect(wrapper.element.style.getPropertyValue('--example-grid-columns')).toBe('5');

    await wrapper.setProps({ columns: 2.5 });
    expect(wrapper.attributes('data-columns')).toBe('1');
    expect(wrapper.element.style.getPropertyValue('--example-grid-columns')).toBe('1');

    await wrapper.setProps({ columns: 0 });
    expect(wrapper.attributes('data-columns')).toBe('1');
  });
});
