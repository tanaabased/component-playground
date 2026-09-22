function toKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function escapeAttributeValue(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeSlotText(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{{', '&#123;&#123;');
}

function escapeJsStringValue(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n');
}

function escapeBoundJsStringValue(value) {
  return escapeJsStringValue(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function decodeHtmlEntities(value) {
  return String(value ?? '').replace(
    /&(#x[\da-f]+|#\d+|amp|quot|apos|#39|lt|gt);/gi,
    (match, entity) => {
      const normalized = entity.toLowerCase();

      if (normalized.startsWith('#')) {
        const hexadecimal = normalized.startsWith('#x');
        const codePoint = Number.parseInt(
          normalized.slice(hexadecimal ? 2 : 1),
          hexadecimal ? 16 : 10,
        );
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
      }

      const namedEntities = {
        amp: '&',
        quot: '"',
        apos: "'",
        lt: '<',
        gt: '>',
      };

      return namedEntities[normalized] ?? match;
    },
  );
}

function decodeJsStringValue(value) {
  const escapes = { '\\': '\\', "'": "'", n: '\n', r: '\r' };
  return decodeHtmlEntities(value).replace(/\\([\\'nr])/g, (_, character) => escapes[character]);
}

function getSchemaProps(schema) {
  return Object.entries(schema?.props ?? {});
}

function getSchemaSlots(schema) {
  return Object.entries(schema?.slots ?? {});
}

function getSchemaControls(schema) {
  return Object.entries(schema?.controls ?? {});
}

function cloneValue(value) {
  if (value === undefined || value === null) return value;

  return JSON.parse(JSON.stringify(value));
}

function getDefaultValue(definition) {
  if ('default' in definition) return cloneValue(definition.default);
  if (definition.kind === 'boolean') return false;
  if (definition.kind === 'number') return 0;
  if (definition.kind === 'object-array') return [];
  return '';
}

function getObjectArrayPresetItems(definition, state) {
  if (definition?.kind !== 'object-array' || !definition.presets) return null;

  const presetName = definition.presetControl
    ? state.controls?.[definition.presetControl]
    : definition.defaultPreset;
  const presets = definition.presets ?? {};
  const items = Array.isArray(presets[presetName])
    ? presets[presetName]
    : Array.isArray(definition.default)
      ? definition.default
      : [];
  const countValue = definition.countControl
    ? state.controls?.[definition.countControl]
    : definition.defaultCount;
  const count = Number(countValue ?? items.length);
  const resolvedCount = Number.isInteger(count) && count >= 0 ? count : items.length;

  return cloneValue(items.slice(0, Math.min(resolvedCount, items.length)));
}

export function applyControlDerivedProps(schema, state, changedControl, options = {}) {
  const skippedProps = options.skippedProps ?? new Set();

  for (const [name, definition] of getSchemaProps(schema)) {
    if (definition.kind !== 'object-array') continue;
    if (!definition.presets) continue;
    if (skippedProps.has(name)) continue;
    if (
      changedControl &&
      changedControl !== definition.presetControl &&
      changedControl !== definition.countControl
    ) {
      continue;
    }

    const items = getObjectArrayPresetItems(definition, state);
    if (items) state.props[name] = items;
  }
}

export function createPlaygroundState(schema, initialState = {}) {
  const state = {
    controls: {},
    props: {},
    slots: {},
  };
  const initialPropNames = new Set(Object.keys(initialState.props ?? {}));

  for (const [name, definition] of getSchemaControls(schema)) {
    state.controls[name] = cloneValue(initialState.controls?.[name] ?? getDefaultValue(definition));
  }

  for (const [name, definition] of getSchemaProps(schema)) {
    state.props[name] = cloneValue(initialState.props?.[name] ?? getDefaultValue(definition));
  }

  for (const [name, definition] of getSchemaSlots(schema)) {
    state.slots[name] = cloneValue(initialState.slots?.[name] ?? definition.default ?? '');
  }

  applyControlDerivedProps(schema, state, undefined, { skippedProps: initialPropNames });

  return state;
}

function getObjectArrayFields(definition) {
  return Array.isArray(definition.fields) ? definition.fields : [];
}

function getPathParts(path) {
  return String(path ?? '')
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean);
}

function getNestedValue(source, path) {
  return getPathParts(path).reduce((value, part) => value?.[part], source);
}

export function setNestedValue(source, path, value) {
  const parts = getPathParts(path);
  if (parts.length === 0) return source;

  let target = source;

  for (const part of parts.slice(0, -1)) {
    if (!target[part] || typeof target[part] !== 'object' || Array.isArray(target[part])) {
      target[part] = {};
    }

    target = target[part];
  }

  target[parts.at(-1)] = value;

  return source;
}

function isEmptyOptionalValue(value) {
  return value === undefined || value === null || value === '';
}

function shouldRenderObjectArrayField(field, value, options = {}) {
  const { includeEmptyArrayFields = true } = options;

  if (!field.optional) return true;
  if (includeEmptyArrayFields) return true;

  return !isEmptyOptionalValue(value);
}

function appendJsString(code, value) {
  code += "'";
  const start = code.length;
  code += escapeBoundJsStringValue(value);
  const end = code.length;
  code += "'";

  return { code, start, end };
}

function appendObjectArrayFieldValue(code, regions, context, options = {}) {
  const { collectRegions = true } = options;
  const { propName, itemIndex, path, field, value } = context;
  const result = appendJsString(code, value);

  if (collectRegions) {
    regions.push({
      kind: 'array-prop-field',
      prop: propName,
      index: itemIndex,
      path,
      valueKind: field.kind ?? 'string',
      options: field.kind === 'enum' ? field.options : undefined,
      value: field.kind === 'enum' ? (value ?? '') : undefined,
      active: !field.optional || !isEmptyOptionalValue(value),
      from: result.start,
      to: result.end,
    });
  }

  return result.code;
}

function appendObjectArrayProp(code, regions, name, definition, value, options = {}) {
  const { includeEmptyArrayFields = true } = options;
  const items = Array.isArray(value) ? value : [];
  const fields = getObjectArrayFields(definition);
  const attribute = toKebabCase(name);

  code += `:${attribute}="[`;

  items.forEach((item, itemIndex) => {
    const rootFields = fields.filter((field) => !String(field.path ?? '').includes('.'));
    const nestedFields = fields.filter((field) => String(field.path ?? '').includes('.'));
    const nestedGroups = new Map();

    for (const field of nestedFields) {
      const [groupName, ...childParts] = getPathParts(field.path);
      const childPath = childParts.join('.');

      if (!groupName || !childPath) continue;

      const group = nestedGroups.get(groupName) ?? [];
      group.push({ ...field, childPath });
      nestedGroups.set(groupName, group);
    }

    code += '\n    {';

    for (const field of rootFields) {
      const fieldValue = getNestedValue(item, field.path) ?? '';
      if (!shouldRenderObjectArrayField(field, fieldValue, { includeEmptyArrayFields })) continue;

      code += `\n      ${field.path}: `;
      code = appendObjectArrayFieldValue(
        code,
        regions,
        {
          propName: name,
          itemIndex,
          path: field.path,
          field,
          value: fieldValue,
        },
        options,
      );
      code += ',';
    }

    for (const [groupName, groupFields] of nestedGroups) {
      const renderedGroupFields = groupFields
        .map((field) => ({
          field,
          value: getNestedValue(item, field.path) ?? '',
        }))
        .filter(({ field, value: fieldValue }) =>
          shouldRenderObjectArrayField(field, fieldValue, { includeEmptyArrayFields }),
        );

      if (renderedGroupFields.length === 0) continue;

      code += `\n      ${groupName}: { `;

      renderedGroupFields.forEach(({ field, value: fieldValue }, fieldIndex) => {
        if (fieldIndex > 0) code += ', ';
        code += `${field.childPath}: `;
        code = appendObjectArrayFieldValue(
          code,
          regions,
          {
            propName: name,
            itemIndex,
            path: field.path,
            field,
            value: fieldValue,
          },
          options,
        );
      });

      code += ' },';
    }

    code += '\n    },';
  });

  code += '\n  ]"';

  return { code, rendered: true };
}

function appendBooleanProp(code, regions, name, definition, value, options = {}) {
  const { collectRegions = true, includeInactiveBooleans = true } = options;
  const attribute = toKebabCase(name);
  const active = Boolean(value);
  const defaultValue = Boolean(getDefaultValue(definition));

  if (!active && !includeInactiveBooleans && !defaultValue) {
    return { code, rendered: false };
  }

  const start = code.length;
  code += !active && defaultValue ? `:${attribute}="false"` : attribute;

  if (collectRegions) {
    regions.push({
      kind: 'boolean-prop',
      prop: name,
      active,
      from: start,
      to: code.length,
    });
  }

  return { code, rendered: true };
}

function appendProp(code, regions, name, definition, value, options = {}) {
  const attribute = toKebabCase(name);
  const { collectRegions = true } = options;

  if (definition.kind === 'object-array') {
    return appendObjectArrayProp(code, regions, name, definition, value, options);
  }

  if (definition.kind === 'boolean') {
    return appendBooleanProp(code, regions, name, definition, value, options);
  }

  const valueKind = definition.kind === 'number' ? 'number' : definition.kind;
  const formattedValue = escapeAttributeValue(value);
  const prefix = definition.kind === 'number' ? ':' : '';

  code += `${prefix}${attribute}="`;
  const start = code.length;
  code += formattedValue;
  const end = code.length;
  code += '"';

  if (collectRegions) {
    regions.push({
      kind: 'prop-value',
      prop: name,
      valueKind,
      options: definition.kind === 'enum' ? definition.options : undefined,
      from: start,
      to: end,
    });
  }

  return { code, rendered: true };
}

function appendControlComment(code, regions, name, definition, value, options = {}) {
  const { collectRegions = true, prefix = '\n  ' } = options;
  const attribute = toKebabCase(name);
  const formattedValue = escapeAttributeValue(value);

  code += `${prefix}<!-- ${attribute}="`;
  const start = code.length;
  code += formattedValue;
  const end = code.length;
  code += '" -->';

  if (collectRegions) {
    regions.push({
      kind: 'control-value',
      control: name,
      valueKind: definition.kind,
      options: definition.kind === 'enum' ? definition.options : undefined,
      from: start,
      to: end,
    });
  }

  return code;
}

function formatSlotValue(definition, value) {
  return definition.kind === 'html' ? String(value ?? '') : escapeSlotText(value ?? '');
}

function formatChildProps(props = {}) {
  const attributes = [];

  for (const [name, value] of Object.entries(props)) {
    const attribute = toKebabCase(name);

    if (typeof value === 'boolean') {
      attributes.push(value ? attribute : `:${attribute}="false"`);
      continue;
    }

    if (value === undefined || value === null) continue;

    const prefix = typeof value === 'number' ? ':' : '';
    attributes.push(`${prefix}${attribute}="${escapeAttributeValue(value)}"`);
  }

  return attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
}

function resolveRepeatCount(definition, state) {
  const controlName = definition.countControl;
  const controlValue = controlName ? state.controls?.[controlName] : undefined;

  if (controlValue === 'auto') {
    const autoValue = Number(state.props?.[definition.autoCountProp]);
    if (Number.isInteger(autoValue) && autoValue > 0) return autoValue;
  }

  const explicitValue = Number(controlValue);
  if (Number.isInteger(explicitValue) && explicitValue >= 0) return explicitValue;

  const defaultCount = Number(definition.defaultCount);
  if (Number.isInteger(defaultCount) && defaultCount >= 0) return defaultCount;

  return definition.items?.length ?? 0;
}

export function getRepeatSlotItems(definition, state) {
  if (definition?.kind !== 'repeat') return [];

  const items = Array.isArray(definition.items) ? definition.items : [];
  const count = Math.min(resolveRepeatCount(definition, state), items.length);

  return items.slice(0, count).map((item, index) => ({
    key: `${index}-${item}`,
    label: String(item ?? ''),
  }));
}

function appendSlot(code, regions, slotName, slotDefinition, value, options = {}) {
  const { collectRegions = true } = options;

  if (slotDefinition.kind === 'repeat') {
    const childName = slotDefinition.componentName ?? 'Component';
    const childProps = formatChildProps(slotDefinition.props);

    for (const item of getRepeatSlotItems(slotDefinition, options.state)) {
      code += `\n  <${childName}${childProps}>${escapeSlotText(item.label)}</${childName}>`;
    }

    return code;
  }

  const slotStart = code.length;
  code += formatSlotValue(slotDefinition, value);
  const slotEnd = code.length;

  if (collectRegions) {
    regions.push({
      kind: 'slot-text',
      slot: slotName,
      valueKind: slotDefinition.kind ?? 'text',
      from: slotStart,
      to: slotEnd,
    });
  }

  return code;
}

function generateUsageCode(schema, state, options = {}) {
  const name = schema?.name ?? 'Component';
  const regions = [];
  const props = getSchemaProps(schema);
  const slots = getSchemaSlots(schema);
  const controls = getSchemaControls(schema);
  const namedSlots = slots.filter(([slotName]) => slotName !== 'default');
  const defaultSlot = slots.find(([slotName]) => slotName === 'default');
  const {
    collectRegions = true,
    includeControls = true,
    includeInactiveBooleans = true,
    includeEmptyArrayFields = true,
  } = options;
  const hasVisibleControls = includeControls && controls.length > 0;
  const hasPreambleControls = hasVisibleControls && slots.length === 0;

  let code = '';

  if (hasPreambleControls) {
    for (const [controlName, definition] of controls) {
      const value = state.controls?.[controlName] ?? getDefaultValue(definition);
      code = appendControlComment(code, regions, controlName, definition, value, {
        collectRegions,
        prefix: code ? '\n' : '',
      });
    }

    code += '\n';
  }

  code += `<${name}`;
  let renderedPropCount = 0;

  for (const [propName, definition] of props) {
    const value = state.props[propName] ?? getDefaultValue(definition);
    const before = code.length;
    code += '\n  ';
    const result = appendProp(code, regions, propName, definition, value, {
      collectRegions,
      includeEmptyArrayFields,
      includeInactiveBooleans,
      state,
    });
    code = result.code;

    if (!result.rendered) {
      code = code.slice(0, before);
    } else {
      renderedPropCount += 1;
    }
  }

  if (slots.length === 0) {
    code += renderedPropCount > 0 ? '\n/>' : ' />';
    return { code, regions };
  }

  code += '>';

  if (hasVisibleControls) {
    for (const [controlName, definition] of controls) {
      const value = state.controls?.[controlName] ?? getDefaultValue(definition);
      code = appendControlComment(code, regions, controlName, definition, value, {
        collectRegions,
      });
    }
  }

  for (const [slotName, slotDefinition] of namedSlots) {
    code += `\n  <template #${slotName}>\n    `;
    code = appendSlot(code, regions, slotName, slotDefinition, state.slots[slotName], {
      collectRegions,
      state,
    });
    code += '\n  </template>';
  }

  if (defaultSlot) {
    const [slotName, slotDefinition] = defaultSlot;
    if (slotDefinition.kind !== 'repeat') code += '\n  ';
    code = appendSlot(code, regions, slotName, slotDefinition, state.slots[slotName], {
      collectRegions,
      state,
    });
  }

  code += `\n</${name}>`;

  return { code, regions };
}

export function generateComponentUsage(schema, state) {
  const { code, regions } = generateUsageCode(schema, state);
  const { code: copyCode } = generateUsageCode(schema, state, {
    collectRegions: false,
    includeControls: false,
    includeEmptyArrayFields: false,
    includeInactiveBooleans: false,
  });

  return { code, copyCode, regions };
}

export function getPreviewProps(schema, state) {
  const previewProps = {};

  for (const [name, definition] of getSchemaProps(schema)) {
    const value = state.props[name] ?? getDefaultValue(definition);

    if (definition.kind === 'boolean') {
      previewProps[name] = Boolean(value);
      continue;
    }

    if (definition.kind === 'object-array') {
      previewProps[name] = normalizeObjectArrayValue(definition, value);
      continue;
    }

    previewProps[name] = value;
  }

  return previewProps;
}

function normalizeObjectArrayValue(definition, value) {
  const items = Array.isArray(value) ? value : [];
  const fields = getObjectArrayFields(definition);

  return items.map((item) => {
    const normalizedItem = {};

    for (const field of fields) {
      const fieldValue = getNestedValue(item, field.path) ?? '';
      if (field.optional && isEmptyOptionalValue(fieldValue)) continue;

      setNestedValue(normalizedItem, field.path, fieldValue);
    }

    return normalizedItem;
  });
}

export function decodeRegionValue(region, value) {
  if (region?.kind === 'slot-text') {
    return region.valueKind === 'html' ? String(value ?? '') : decodeHtmlEntities(value);
  }

  if (region?.kind === 'prop-value' && region.valueKind !== 'number') {
    return decodeHtmlEntities(value);
  }

  if (region?.kind === 'array-prop-field') {
    return decodeJsStringValue(value);
  }

  return value;
}
