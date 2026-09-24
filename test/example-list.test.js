import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import ExampleList from '../docs/components/ExampleList.vue';
import { listSchema } from '../docs/example-schemas.js';

describe('ExampleList', () => {
  it('exposes every list prop and layout option in the documentation schema', () => {
    expect(Object.keys(listSchema.props)).toEqual([
      'header',
      'headerLink',
      'columns',
      'orientation',
      'items',
    ]);
    expect(listSchema.props.columns.options).toEqual(['none', '2', '3']);
    expect(listSchema.props.orientation.options).toEqual(['column', 'row']);
    expect(listSchema.controls.itemCount.options).toEqual([
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
    ]);
    expect(listSchema.props.items.presets.plain).toHaveLength(12);
    expect(listSchema.props.items.presets.linked).toHaveLength(12);
    expect(listSchema.props.items.fields.map((field) => field.path)).toEqual([
      'label',
      'link',
      'attrs.target',
      'attrs.rel',
      'attrs.download',
      'attrs.title',
    ]);
  });

  it('renders its empty default state without an accessible header relationship', () => {
    const wrapper = mount(ExampleList);

    expect(wrapper.find('.example-list__header').exists()).toBe(false);
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined();
    expect(wrapper.findAll('li')).toHaveLength(0);
    expect(wrapper.attributes('data-columns')).toBe('none');
    expect(wrapper.attributes('data-orientation')).toBe('column');
  });

  it('renders linked headers and sanitized linked or plain items', () => {
    const wrapper = mount(ExampleList, {
      props: {
        columns: 2,
        header: ' Explore Tanaab ',
        headerLink: ' /guide/ ',
        items: [
          {
            label: ' GitHub ',
            link: ' https://github.com/tanaabased ',
            attrs: {
              'aria-label': 'Tanaab on GitHub',
              onclick: 'nope',
              target: '_blank',
              title: 'Open source',
            },
          },
          { label: 'Plain item', attrs: { title: 'Ignored without a link' } },
          { label: '   ', link: '/hidden/' },
        ],
        orientation: 'row',
      },
    });

    const header = wrapper.get('.example-list__header');
    const headerLink = header.get('a');
    expect(wrapper.attributes('aria-labelledby')).toBe(header.attributes('id'));
    expect(headerLink.text()).toBe('Explore Tanaab');
    expect(headerLink.attributes('href')).toBe('/guide/');
    expect(wrapper.attributes('data-columns')).toBe('2');
    expect(wrapper.attributes('data-orientation')).toBe('row');
    expect(wrapper.findAll('li')).toHaveLength(2);

    const linkedItem = wrapper.get('.example-list__item a');
    expect(linkedItem.text()).toBe('GitHub');
    expect(linkedItem.attributes('href')).toBe('https://github.com/tanaabased');
    expect(linkedItem.attributes('target')).toBe('_blank');
    expect(linkedItem.attributes('rel')).toBe('noreferrer');
    expect(linkedItem.attributes('title')).toBe('Open source');
    expect(linkedItem.attributes('aria-label')).toBe('Tanaab on GitHub');
    expect(linkedItem.attributes('onclick')).toBeUndefined();
    expect(wrapper.get('.example-list__item span').text()).toBe('Plain item');
  });

  it('prefers default slot items over the items prop', () => {
    const wrapper = mount(ExampleList, {
      props: {
        items: [{ label: 'Prop item' }],
      },
      slots: {
        default: '<li><a href="/slot/">Slot item</a></li>',
      },
    });

    expect(wrapper.findAll('li')).toHaveLength(1);
    expect(wrapper.get('li').text()).toBe('Slot item');
    expect(wrapper.text()).not.toContain('Prop item');
  });

  it('falls back from unsupported columns and orientation values', () => {
    const warnHandler = vi.fn();
    const wrapper = mount(ExampleList, {
      global: {
        config: {
          warnHandler,
        },
      },
      props: {
        columns: '9',
        orientation: 'diagonal',
      },
    });

    expect(warnHandler).toHaveBeenCalled();
    expect(wrapper.attributes('data-columns')).toBe('none');
    expect(wrapper.attributes('data-orientation')).toBe('column');
  });
});
