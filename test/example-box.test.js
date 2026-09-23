import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExampleBox from '../docs/components/ExampleBox.vue';
import { boxSchema } from '../docs/example-schemas.js';

describe('ExampleBox', () => {
  it('exposes every box prop and type in the documentation schema', () => {
    expect(Object.keys(boxSchema.props)).toEqual(['link', 'type']);
    expect(boxSchema.props.type.options).toEqual(['content', 'title']);
    expect(Object.keys(boxSchema.slots)).toEqual(['default']);
  });

  it('renders content in an unlinked content box by default', () => {
    const wrapper = mount(ExampleBox, {
      slots: {
        default: '<strong>Navigation</strong>',
      },
    });

    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.classes()).toContain('example-box');
    expect(wrapper.attributes('data-linked')).toBe('false');
    expect(wrapper.attributes('data-type')).toBe('content');
    expect(wrapper.get('strong').text()).toBe('Navigation');
  });

  it('renders linked title boxes and trims the destination', () => {
    const wrapper = mount(ExampleBox, {
      props: {
        link: ' /guide/ ',
        type: 'title',
      },
      slots: {
        default: 'Guide',
      },
    });

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('href')).toBe('/guide/');
    expect(wrapper.attributes('data-linked')).toBe('true');
    expect(wrapper.attributes('data-type')).toBe('title');
  });
});
