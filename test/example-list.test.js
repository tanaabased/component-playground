import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import ExampleList from '../docs/components/ExampleList.vue';

describe('ExampleList', () => {
  it('renders its empty default state', () => {
    const wrapper = mount(ExampleList);

    expect(wrapper.get('h3').text()).toBe('');
    expect(wrapper.findAll('li')).toHaveLength(0);
    expect(wrapper.attributes('data-columns')).toBe('1');
    expect(wrapper.attributes('data-orientation')).toBe('column');
    expect(wrapper.element.style.getPropertyValue('--example-list-columns')).toBe('1');
  });

  it('renders item fields and applies supported layout props', () => {
    const wrapper = mount(ExampleList, {
      props: {
        columns: '2',
        header: 'Mission crew',
        items: [
          {
            label: 'Naomi Nagata',
            category: 'Engineer',
            detail: 'Keeps the ship flying',
          },
          {
            label: 'James Holden',
            category: 'Captain',
          },
        ],
        orientation: 'row',
      },
    });

    expect(wrapper.get('h3').text()).toBe('Mission crew');
    expect(wrapper.attributes('data-columns')).toBe('2');
    expect(wrapper.attributes('data-orientation')).toBe('row');
    expect(wrapper.element.style.getPropertyValue('--example-list-columns')).toBe('2');
    expect(wrapper.findAll('li')).toHaveLength(2);
    expect(wrapper.findAll('strong').map((node) => node.text())).toEqual([
      'Naomi Nagata',
      'James Holden',
    ]);
    expect(wrapper.findAll('span').map((node) => node.text())).toEqual(['Engineer', 'Captain']);
    expect(wrapper.findAll('small').map((node) => node.text())).toEqual(['Keeps the ship flying']);
  });

  it('falls back to one column when an unsupported value is provided', () => {
    const warnHandler = vi.fn();
    const wrapper = mount(ExampleList, {
      global: {
        config: {
          warnHandler,
        },
      },
      props: {
        columns: '9',
      },
    });

    expect(warnHandler).toHaveBeenCalled();
    expect(wrapper.attributes('data-columns')).toBe('1');
    expect(wrapper.element.style.getPropertyValue('--example-list-columns')).toBe('1');
  });
});
