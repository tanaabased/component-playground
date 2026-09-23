import { markRaw } from 'vue';

import ExampleBox from './components/ExampleBox.vue';

export const sectionSchema = {
  name: 'ExampleSection',
  props: {
    borderTop: { kind: 'boolean', default: true },
    borderBottom: { kind: 'boolean', default: false },
    orientation: { kind: 'enum', options: ['left', 'right'], default: 'left' },
  },
  slots: {
    title: { kind: 'text', default: 'A section with a job' },
    default: {
      kind: 'html',
      default:
        '<p>Its controls change <strong>visible structure</strong>, not decorative trivia.</p>',
    },
  },
};

export const boxSchema = {
  name: 'ExampleBox',
  props: {
    link: { kind: 'string', default: '/guide/' },
    type: { kind: 'enum', options: ['content', 'title'], default: 'title' },
  },
  slots: {
    default: { kind: 'text', default: 'Navigation' },
  },
};

export const gridSchema = {
  name: 'ExampleGrid',
  controls: {
    boxCount: {
      kind: 'enum',
      options: ['1', '2', '3', '4', '5', '6', 'auto'],
      default: '3',
    },
  },
  props: {
    columns: { kind: 'number', default: 3 },
  },
  slots: {
    default: {
      kind: 'repeat',
      component: markRaw(ExampleBox),
      componentName: 'ExampleBox',
      props: { type: 'title' },
      items: ['Navigation', 'Search', 'Releases', 'Support', 'Brand', 'About'],
      countControl: 'boxCount',
      autoCountProp: 'columns',
      defaultCount: 3,
    },
  },
};

export const listSchema = {
  name: 'ExampleList',
  controls: {
    contentPreset: {
      kind: 'enum',
      options: ['plain', 'linked'],
      default: 'linked',
    },
    itemCount: {
      kind: 'enum',
      options: ['1', '2', '3', '4', '5', '6'],
      default: '4',
    },
  },
  props: {
    header: { kind: 'string', default: 'Explore Tanaab' },
    headerLink: { kind: 'string', default: '/guide/' },
    columns: { kind: 'enum', options: ['none', '2', '3'], default: '2' },
    orientation: { kind: 'enum', options: ['column', 'row'], default: 'column' },
    items: {
      kind: 'object-array',
      presetControl: 'contentPreset',
      countControl: 'itemCount',
      defaultPreset: 'linked',
      defaultCount: 4,
      presets: {
        plain: [
          { label: 'Navigation' },
          { label: 'Search' },
          { label: 'Releases' },
          { label: 'Support' },
          { label: 'Brand' },
          { label: 'About' },
        ],
        linked: [
          { label: 'Navigation', link: '/guide/', attrs: { title: 'Open the guide' } },
          { label: 'Search', link: '/reference/', attrs: { title: 'Open the reference' } },
          {
            label: 'GitHub',
            link: 'https://github.com/tanaabased',
            attrs: { target: '_blank', rel: 'noreferrer', title: 'Open Tanaab on GitHub' },
          },
          { label: 'Support', link: '/examples/', attrs: { title: 'Review examples' } },
          { label: 'Brand', link: '/styling/', attrs: { title: 'Review styling' } },
          { label: 'About', link: '/', attrs: { title: 'Return home' } },
        ],
      },
      fields: [
        { path: 'label', kind: 'string' },
        { path: 'link', kind: 'string', optional: true },
        { path: 'attrs.target', kind: 'enum', options: ['', '_blank'], optional: true },
        { path: 'attrs.rel', kind: 'string', optional: true },
        { path: 'attrs.title', kind: 'string', optional: true },
      ],
    },
  },
};

export const logoSchema = {
  name: 'ExampleLogo',
  props: {
    type: {
      kind: 'enum',
      options: ['left', 'right', 'centered', 'mark'],
      default: 'centered',
    },
    link: { kind: 'string', default: '/' },
    color: { kind: 'string', default: 'var(--vp-c-text-1)' },
    background: { kind: 'string', default: 'none' },
  },
};
