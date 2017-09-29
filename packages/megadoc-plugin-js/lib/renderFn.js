const assert = require('assert');
const K = require('jsdoc-parser-extended').Constants;
const { escape: escapeHTML } = require('lodash');
const BUILT_IN_TYPES = [
  'Error',
  'String',
  'Array',
  'Number',
  'RegExp',
  'Object',
  'Boolean',
  'Date',
  'Function',
  'Symbol',
  'Promise',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Buffer',
  'Uint16Array',
  'ArrayBuffer',
  'DataView',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint32Array',
  'Int32Array',
  'Float32Array',
  'Int16Array',
  'Float64Array',
  'Any',
  'Mixed',
  'void'
];

const EXPRESSION_TYPES = ([
  K.TYPE_UNION,
  K.TYPE_ALL_LITERAL,
  K.TYPE_UNKNOWN_LITERAL,
  K.TYPE_UNKNOWN,
  K.TYPE_FUNCTION,
  K.TYPE_OBJECT,
  K.TYPE_OBJECT_PROPERTY
].reduce(function(map, x) { map[x] = true; return map; }, {}));

const TAGS_WITH_STRING = K.TAGS_WITH_STRINGS;
const when = (x, f) => x ? f(x) : x;

module.exports = function renderFn(context, renderer, node) {
  const { markdown, linkify } = renderer;
  const builtInTypes = BUILT_IN_TYPES.concat(context.options.builtInTypes || []).reduce(toIndexMap, {});
  const doc = node.properties;

  return {
    description: when(doc.description, x => markdown(linkify({ text: x, contextNode: node }))),
    mixinTargets: when(doc.mixinTargets, x => x.map(function(typeName) {
      return {
        name: typeName,
        html: renderTypeLink({
          typeName: typeName,
          renderer: renderer,
          builtInTypes: builtInTypes,
          contextNode: node,
        })
      };
    })),

    tags: doc.tags.map(function(tag) {
      const nextTypeInfo = Object.assign({}, tag.typeInfo);
      const nextAttributes = {};

      if (tag.typeInfo.description) {
        nextTypeInfo.description = markdown(linkify({
          text: tag.typeInfo.description,
          contextNode: node,
        }));
      }

      if (TAGS_WITH_STRING.hasOwnProperty(tag.type)) {
        nextAttributes.string = markdown(linkify({
          text: tag.string,
          contextNode: node,
        }));
      }
      else if (tag.type === 'see') {
        nextTypeInfo.name = renderTypeLink({
          contextNode: node,
          typeName: tag.typeInfo.name.trim(),
          builtInTypes: builtInTypes,
          renderer: renderer,
        });
      }

      if (tag.typeInfo.type) {
        nextTypeInfo.type = renderTagType(tag.typeInfo.type);
      }

      return Object.assign({}, tag, nextAttributes, {
        typeInfo: nextTypeInfo,
      });
    }),

    type: doc.type,
  };

  function renderTagType(type) {
    const nextType = Object.assign({}, type);
    const isExpression = EXPRESSION_TYPES.hasOwnProperty(type.name);

    if (type.name && !isExpression) {
      nextType.html = renderTypeLink({
        builtInTypes: builtInTypes,
        contextNode: node,
        renderer: renderer,
        typeName: type.name,
      });
    }

    // UnionType, TypeApplication
    if (type.elements) {
      nextType.elements = type.elements.map(renderTagType);
    }

    // FieldType
    if (type.key) {
      nextType.key = renderTagType(type.key);
    }

    // Also FieldType
    if (type.value) {
      nextType.value = renderTagType(type.value);
    }

    // FunctionType
    if (type.params) {
      nextType.params = type.params.map(renderTagType);
    }

    if (type.returnType) {
      nextType.returnType = renderTagType(type.returnType);
    }

    return nextType;
  }
}

function renderTypeLink(params) {
  const typeName = params.typeName;
  const builtInTypes = params.builtInTypes;
  const renderer = params.renderer;
  const contextNode = params.contextNode;

  const builtInType = builtInTypes[typeName.toLowerCase()];

  if (builtInType) {
    // WTF?
    if (typeof builtInType === 'string') {
      return '<a target="_blank" href="' + encodeURI(builtInType) + '">' + escapeHTML(typeName) + '</a>';
    }

    return typeName;
  }

  return renderer.linkifyFragment({
    format: 'html',
    contextNode: contextNode,
    text: typeName
  });
}


function toIndexMap(map, x) {
  if (typeof x === 'string') {
    map[x.toLowerCase()] = true;
  }
  else if (x && typeof x === 'object') {
    assert(typeof x.name === 'string');
    assert(typeof x.href === 'string');

    map[x.name.toLowerCase()] = x.href;
  }
  else {
    assert(false);
  }

  return map;
}