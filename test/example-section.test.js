import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExampleSection from '../docs/components/ExampleSection.vue';

describe('ExampleSection', () => {
  it('renders its slots with the default structural state', () => {
    const wrapper = mount(ExampleSection, {
      slots: {
        default: '<p>Visible structure.</p>',
        title: 'A section with a job',
      },
    });

    expect(wrapper.element.tagName).toBe('SECTION');
    expect(wrapper.attributes('data-border-bottom')).toBe('false');
    expect(wrapper.attributes('data-border-top')).toBe('false');
    expect(wrapper.attributes('data-orientation')).toBe('left');
    expect(wrapper.get('.example-section__title').text()).toBe('A section with a job');
    expect(wrapper.get('.example-section__content p').text()).toBe('Visible structure.');
  });

  it('reflects border and orientation props in its public state', () => {
    const wrapper = mount(ExampleSection, {
      props: {
        borderBottom: true,
        borderTop: true,
        orientation: 'right',
      },
    });

    expect(wrapper.attributes('data-border-bottom')).toBe('true');
    expect(wrapper.attributes('data-border-top')).toBe('true');
    expect(wrapper.attributes('data-orientation')).toBe('right');
  });
});
