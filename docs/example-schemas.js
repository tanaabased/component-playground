import { markRaw } from 'vue';

import ExampleBox from './components/ExampleBox.vue';

const gridBoxStyles = {
  brand:
    '--example-box-background: var(--vp-c-brand-soft); --example-box-color: var(--vp-c-brand-1)',
  danger:
    '--example-box-background: var(--vp-c-danger-soft); --example-box-color: var(--vp-c-danger-1)',
  tip: '--example-box-background: var(--vp-c-tip-soft); --example-box-color: var(--vp-c-tip-1)',
  warning:
    '--example-box-background: var(--vp-c-warning-soft); --example-box-color: var(--vp-c-warning-1)',
};

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
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'auto'],
      default: '8',
    },
  },
  props: {
    columns: { kind: 'number', default: 4 },
  },
  slots: {
    default: {
      kind: 'repeat',
      component: markRaw(ExampleBox),
      componentName: 'ExampleBox',
      props: { type: 'title' },
      items: [
        { label: '1', props: { link: '/guide/', style: gridBoxStyles.brand } },
        { label: '2', props: { link: '/reference/', style: gridBoxStyles.tip } },
        { label: '3', props: { link: '/examples/', style: gridBoxStyles.warning } },
        {
          label: '4',
          props: { link: '/guide/#component-api', style: gridBoxStyles.danger },
        },
        {
          label: '5',
          props: {
            link: 'https://github.com/tanaabased/component-playground/releases',
            style: gridBoxStyles.tip,
          },
        },
        {
          label: '6',
          props: {
            link: 'https://github.com/tanaabased/component-playground',
            style: gridBoxStyles.brand,
          },
        },
        {
          label: '7',
          props: {
            link: 'https://github.com/tanaabased/component-playground/issues',
            style: gridBoxStyles.warning,
          },
        },
        {
          label: '8',
          props: { link: 'https://github.com/tanaabased/theme', style: gridBoxStyles.danger },
        },
        { label: '9', props: { link: '/installation', style: gridBoxStyles.brand } },
        {
          label: '10',
          props: { type: 'content', style: gridBoxStyles.tip },
        },
        {
          label: '11',
          props: { type: 'content', style: gridBoxStyles.warning },
        },
        { label: '12', props: { type: 'content', style: gridBoxStyles.danger } },
      ],
      countControl: 'boxCount',
      autoCountProp: 'columns',
      defaultCount: 8,
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
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      default: '8',
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
      defaultCount: 8,
      presets: {
        plain: [
          { label: 'Navigation' },
          { label: 'Reference' },
          { label: 'Examples' },
          { label: 'Components' },
          { label: 'Releases' },
          { label: 'Source' },
          { label: 'Support' },
          { label: 'Brand' },
          { label: 'About' },
          { label: 'Install' },
          { label: 'Changelog' },
          { label: 'Contact' },
        ],
        linked: [
          { label: 'Navigation', link: '/guide/', attrs: { title: 'Open the guide' } },
          { label: 'Reference', link: '/reference/', attrs: { title: 'Open the reference' } },
          { label: 'Examples', link: '/examples/', attrs: { title: 'Review examples' } },
          {
            label: 'Components',
            link: '/guide/#component-api',
            attrs: { title: 'Review the component API' },
          },
          {
            label: 'Releases',
            link: 'https://github.com/tanaabased/component-playground/releases',
            attrs: { target: '_blank', rel: 'noreferrer', title: 'Review releases on GitHub' },
          },
          {
            label: 'Source',
            link: 'https://github.com/tanaabased/component-playground',
            attrs: { target: '_blank', rel: 'noreferrer', title: 'Open the source on GitHub' },
          },
          {
            label: 'Support',
            link: 'https://github.com/tanaabased/component-playground/issues',
            attrs: { target: '_blank', rel: 'noreferrer', title: 'Open the issue tracker' },
          },
          {
            label: 'Brand',
            link: 'https://github.com/tanaabased/theme',
            attrs: { target: '_blank', rel: 'noreferrer', title: 'Open the Tanaab theme' },
          },
          { label: 'About', link: '/', attrs: { title: 'Return home' } },
          { label: 'Install', link: '/installation' },
          {
            label: 'Download example',
            link: '/reference.html',
            attrs: {
              download: 'component-playground-reference.html',
              title: 'Download the rendered reference',
            },
          },
          { label: 'Contact', link: 'mailto:crew@example.com', attrs: { title: 'Email the crew' } },
        ],
      },
      fields: [
        { path: 'label', kind: 'string' },
        { path: 'link', kind: 'string', optional: true },
        { path: 'attrs.target', kind: 'enum', options: ['', '_blank'], optional: true },
        { path: 'attrs.rel', kind: 'string', optional: true },
        { path: 'attrs.download', kind: 'string', optional: true },
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
