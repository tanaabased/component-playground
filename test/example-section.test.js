import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExampleSection from '../docs/components/ExampleSection.vue';
import { sectionSchema } from '../docs/example-schemas.js';

describe('ExampleSection', () => {
  it('exposes every section prop, orientation, and slot in the documentation schema', () => {
    expect(Object.keys(sectionSchema.props)).toEqual(['borderTop', 'borderBottom', 'orientation']);
    expect(sectionSchema.props.orientation.options).toEqual(['left', 'right']);
    expect(Object.keys(sectionSchema.slots)).toEqual(['title', 'default']);
  });

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
    const title = wrapper.get('.example-section__title');
    expect(wrapper.attributes('aria-labelledby')).toBe(title.attributes('id'));
    expect(title.text()).toBe('A section with a job');
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
