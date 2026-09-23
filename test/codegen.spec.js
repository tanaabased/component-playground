import assert from 'node:assert/strict';

import { compile } from '@vue/compiler-dom';
import * as Vue from 'vue';
import { renderToString } from 'vue/server-renderer';

import {
  createPlaygroundState,
  decodeRegionValue,
  generateComponentUsage,
  getPreviewProps,
  getRepeatSlotItems,
  setNestedValue,
} from '../utils/codegen.js';

describe('utils/codegen', () => {
  for (const slotKind of ['default', 'named', 'repeat']) {
    it(`should preserve literal slot text in copied ${slotKind} slots`, async () => {
      const text = '{{ 1 + 1 }} {{ missing }} <b> & &#123;';
      const schema = {
        name: 'ExampleText',
        slots:
          slotKind === 'repeat'
            ? {
                default: {
                  kind: 'repeat',
                  componentName: 'span',
                  items: [text],
                  defaultCount: 1,
                },
              }
            : { [slotKind === 'named' ? 'title' : 'default']: { kind: 'text', default: text } },
      };
      const generated = generateComponentUsage(schema, createPlaygroundState(schema));
      const render = new Function('Vue', compile(generated.copyCode).code)(Vue);
      const ExampleText = {
        setup:
          (_, { slots }) =>
          () =>
            Vue.h('p', slots.title?.() ?? slots.default?.()),
      };
      const actual = await renderToString(
        Vue.createSSRApp({ components: { ExampleText }, render }),
      );
      const expected = await renderToString(
        slotKind === 'repeat' ? Vue.h('span', text) : Vue.createTextVNode(text),
      );
      assert.equal(actual.slice('<p>'.length, -'</p>'.length).trim(), expected);
      const region = generated.regions.find((candidate) => candidate.kind === 'slot-text');
      if (region) {
        assert.equal(decodeRegionValue(region, generated.code.slice(region.from, region.to)), text);
      }
    });
  }

  it('should preserve multiline object-array strings through copy and editing', () => {
    const label = 'First\r\nSecond\nLiteral \\n and \\r, \'quotes\' and "double quotes"';
    const schema = {
      name: 'ExampleList',
      props: {
        items: {
          kind: 'object-array',
          default: [{ label }],
          fields: [{ path: 'label', kind: 'string' }],
        },
      },
    };
    const state = createPlaygroundState(schema);
    const generated = generateComponentUsage(schema, state);
    const { ast } = compile(generated.copyCode);
    const expression = ast.children[0].props.find((prop) => prop.arg?.content === 'items').exp
      .content;
    assert.deepEqual(
      new Function(`return (${expression})`)(),
      getPreviewProps(schema, state).items,
    );
    const region = generated.regions.find((candidate) => candidate.kind === 'array-prop-field');
    assert.equal(decodeRegionValue(region, generated.code.slice(region.from, region.to)), label);
  });

  it('should explicitly bind false props on repeated children', () => {
    const schema = {
      name: 'ExampleList',
      slots: {
        default: {
          kind: 'repeat',
          componentName: 'ExampleChild',
          props: { enabled: false, quiet: true },
          items: ['One'],
          defaultCount: 1,
        },
      },
    };
    const { copyCode } = generateComponentUsage(schema, createPlaygroundState(schema));
    const { ast } = compile(copyCode);
    const child = ast.children[0].children.find((node) => node.tag === 'ExampleChild');
    const enabled = child.props.find((prop) => prop.arg?.content === 'enabled');
    assert.equal(enabled.exp.content, 'false');
    assert(child.props.some((prop) => prop.name === 'quiet'));
  });

  it('should preserve out-of-range numeric entities without interrupting editing', () => {
    const region = { kind: 'prop-value', valueKind: 'string' };
    assert.equal(decodeRegionValue(region, '&#99999999; &#x110000;'), '&#99999999; &#x110000;');
    assert.equal(decodeRegionValue(region, '&#128512; &#x1f600; &amp;'), '😀 😀 &');
  });

  it('should create state from schema defaults and authored initial state', () => {
    const schema = {
      controls: {
        itemsPreset: {
          kind: 'enum',
          options: ['balanced', 'short'],
          default: 'short',
        },
        itemsCount: {
          kind: 'enum',
          options: ['1', '2'],
          default: '2',
        },
      },
      props: {
        label: {
          kind: 'string',
          default: 'Default label',
        },
        active: {
          kind: 'boolean',
        },
        items: {
          kind: 'object-array',
          default: [{ label: 'Fallback' }],
          presets: {
            short: [{ label: 'One' }, { label: 'Two' }],
          },
          presetControl: 'itemsPreset',
          countControl: 'itemsCount',
          fields: [{ path: 'label', kind: 'string' }],
        },
      },
      slots: {
        default: {
          kind: 'html',
          default: '<p>Default slot</p>',
        },
      },
    };

    assert.deepEqual(createPlaygroundState(schema), {
      controls: {
        itemsPreset: 'short',
        itemsCount: '2',
      },
      props: {
        label: 'Default label',
        active: false,
        items: [{ label: 'One' }, { label: 'Two' }],
      },
      slots: {
        default: '<p>Default slot</p>',
      },
    });

    assert.deepEqual(
      createPlaygroundState(schema, {
        props: {
          items: [{ label: 'Authored' }],
        },
      }).props.items,
      [{ label: 'Authored' }],
    );
  });

  it('should generate editable code and clean copy code for boolean and named slots', () => {
    const schema = {
      name: 'ExampleHero',
      props: {
        borderTop: {
          kind: 'boolean',
          default: false,
        },
        borderBottom: {
          kind: 'boolean',
          default: false,
        },
      },
      slots: {
        title: {
          kind: 'html',
          default: 'Start <strong>big</strong>',
        },
        default: {
          kind: 'html',
          default: '<p>Useful copy.</p>',
        },
      },
    };
    const state = createPlaygroundState(schema, {
      props: {
        borderTop: true,
      },
    });
    const generated = generateComponentUsage(schema, state);

    assert.match(generated.code, /<ExampleHero\n[ ]{2}border-top\n[ ]{2}border-bottom>/);
    assert.match(generated.code, /<template #title>/);
    assert.match(generated.code, /Start <strong>big<\/strong>/);
    assert.match(generated.copyCode, /<ExampleHero\n[ ]{2}border-top>/);
    assert.doesNotMatch(generated.copyCode, /border-bottom/);

    const inactiveRegion = generated.regions.find(
      (region) => region.kind === 'boolean-prop' && region.prop === 'borderBottom',
    );
    assert.equal(inactiveRegion.active, false);
  });

  it('should keep default-true boolean toggles bare while copying an explicit false binding', () => {
    const schema = {
      name: 'ExampleToggle',
      props: {
        enabled: {
          kind: 'boolean',
          default: true,
        },
      },
    };
    const state = createPlaygroundState(schema, {
      props: {
        enabled: false,
      },
    });
    const generated = generateComponentUsage(schema, state);
    const inactiveRegion = generated.regions.find(
      (region) => region.kind === 'boolean-prop' && region.prop === 'enabled',
    );

    assert.match(generated.code, /\n  enabled\n\/>/);
    assert.match(generated.copyCode, /:enabled="false"/);
    assert.equal(inactiveRegion.active, false);
    assert.equal(getPreviewProps(schema, state).enabled, false);
    assert.doesNotThrow(() => compile(generated.copyCode));

    state.props.enabled = true;
    const enabled = generateComponentUsage(schema, state);

    assert.match(enabled.code, /\n  enabled\n\/>/);
    assert.match(enabled.copyCode, /\n  enabled\n\/>/);
    assert.equal(getPreviewProps(schema, state).enabled, true);
  });

  it('should keep default-false boolean toggles bare while omitting inactive copy output', () => {
    const schema = {
      name: 'ExampleToggle',
      props: {
        enabled: {
          kind: 'boolean',
          default: false,
        },
      },
    };
    const state = createPlaygroundState(schema);
    const generated = generateComponentUsage(schema, state);
    const inactiveRegion = generated.regions.find(
      (region) => region.kind === 'boolean-prop' && region.prop === 'enabled',
    );

    assert.match(generated.code, /\n  enabled\n\/>/);
    assert.doesNotMatch(generated.copyCode, /enabled/);
    assert.equal(inactiveRegion.active, false);
    assert.equal(getPreviewProps(schema, state).enabled, false);
    assert.doesNotThrow(() => compile(generated.copyCode));
  });

  it('should preserve numeric values as bound props in copy and preview', () => {
    const schema = {
      name: 'ExampleCounter',
      props: {
        count: {
          kind: 'number',
          default: 3,
        },
      },
    };
    const state = createPlaygroundState(schema);
    const generated = generateComponentUsage(schema, state);

    assert.match(generated.copyCode, /:count="3"/);
    assert.equal(getPreviewProps(schema, state).count, 3);
    assert.doesNotThrow(() => compile(generated.copyCode));
  });

  it('should generate repeat slot children from auto and explicit counts', () => {
    const schema = {
      name: 'ExampleGrid',
      controls: {
        cardCount: {
          kind: 'enum',
          options: ['auto', '1', '2', '3', '4'],
          default: 'auto',
        },
      },
      props: {
        columns: {
          kind: 'enum',
          options: ['1', '2', '3'],
          default: '3',
        },
      },
      slots: {
        default: {
          kind: 'repeat',
          componentName: 'ExampleCard',
          props: {
            type: 'title',
          },
          items: ['One', 'Two', 'Three', 'Four'],
          countControl: 'cardCount',
          autoCountProp: 'columns',
        },
      },
    };
    const state = createPlaygroundState(schema);

    assert.deepEqual(
      getRepeatSlotItems(schema.slots.default, state).map((item) => item.label),
      ['One', 'Two', 'Three'],
    );

    state.controls.cardCount = '4';
    const generated = generateComponentUsage(schema, state);

    assert.equal(generated.code.match(/<ExampleCard/g).length, 4);
    assert.match(generated.code, /<!-- card-count="4" -->/);
    assert.doesNotMatch(generated.copyCode, /card-count/);
  });

  it('should generate object-array props while omitting empty optional fields from copy', () => {
    const schema = {
      name: 'ExampleList',
      props: {
        items: {
          kind: 'object-array',
          default: [
            { label: 'Internal', link: '/guide' },
            { label: 'External', link: 'https://example.com', attrs: { target: '_blank' } },
            { label: 'Plain', link: '', attrs: { target: '' } },
          ],
          fields: [
            { path: 'label', kind: 'string' },
            { path: 'link', kind: 'string', optional: true },
            { path: 'attrs.target', kind: 'enum', options: ['', '_blank'], optional: true },
          ],
        },
      },
    };
    const state = createPlaygroundState(schema);
    const generated = generateComponentUsage(schema, state);

    assert.match(generated.code, /:items="\[/);
    assert.match(generated.code, /target: '_blank'/);
    assert.match(generated.code, /link: '',/);
    assert.match(generated.copyCode, /attrs: { target: '_blank' }/);
    assert.doesNotMatch(generated.copyCode, /link: '',/);
    assert.deepEqual(getPreviewProps(schema, state).items[2], { label: 'Plain' });
  });

  it('should escape quotes in object-array strings as valid Vue markup', () => {
    const schema = {
      name: 'ExampleList',
      props: {
        items: {
          kind: 'object-array',
          default: [{ label: `The "captain's" path \\ home` }],
          fields: [{ path: 'label', kind: 'string' }],
        },
      },
    };
    const state = createPlaygroundState(schema);
    const generated = generateComponentUsage(schema, state);

    assert.match(generated.copyCode, /&quot;captain\\'s&quot;/);
    assert.doesNotThrow(() => compile(generated.copyCode));

    const region = generated.regions.find((candidate) => candidate.kind === 'array-prop-field');
    assert.equal(
      decodeRegionValue(region, "The &quot;captain\\'s&quot; path \\\\ home"),
      `The "captain's" path \\ home`,
    );
  });

  it('should decode editable region values according to region kind', () => {
    assert.equal(
      decodeRegionValue({ kind: 'prop-value', valueKind: 'string' }, 'A &amp; B'),
      'A & B',
    );
    assert.equal(
      decodeRegionValue(
        { kind: 'slot-text', valueKind: 'html' },
        '<strong>Safe example HTML</strong>',
      ),
      '<strong>Safe example HTML</strong>',
    );
    assert.equal(
      decodeRegionValue({ kind: 'slot-text', valueKind: 'text' }, '&lt;literal&gt;'),
      '<literal>',
    );
    assert.equal(decodeRegionValue({ kind: 'array-prop-field' }, '42'), '42');
  });

  it('should set nested values without mutating sibling fields', () => {
    const source = { attrs: { rel: 'noreferrer' } };

    assert.equal(setNestedValue(source, 'attrs.target', '_blank'), source);
    assert.deepEqual(source, {
      attrs: {
        rel: 'noreferrer',
        target: '_blank',
      },
    });
  });
});
