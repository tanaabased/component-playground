import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExampleBox from '../docs/components/ExampleBox.vue';

describe('ExampleBox', () => {
  it('renders its content in a semantic box', () => {
    const wrapper = mount(ExampleBox, {
      slots: {
        default: '<strong>Navigation</strong>',
      },
    });

    expect(wrapper.element.tagName).toBe('ARTICLE');
    expect(wrapper.classes()).toContain('example-box');
    expect(wrapper.get('strong').text()).toBe('Navigation');
  });
});
