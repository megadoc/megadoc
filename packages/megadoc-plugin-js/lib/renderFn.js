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

const EXPRESSION_TYPES = Object.freeze([
  K.TYPE_UNION,
  K.TYPE_ALL_LITERAL,
  K.TYPE_UNKNOWN_LITERAL,
  K.TYPE_UNKNOWN,
  K.TYPE_FUNCTION,
  K.TYPE_OBJECT,
  K.TYPE_OBJECT_PROPERTY
].reduce(function(map, x) { map[x] = true; return map; }, {}));

const TAGS_WITH_STRING = K.TAGS_WITH_STRINGS;

module.exports = function renderNode(context, renderer, node) {
  const md = renderer.markdown;
  const linkify = renderer.linkify;
  const builtInTypes = BUILT_IN_TYPES.concat(context.options.builtInTypes || []).reduce(toIndexMap, {});

  const doc = node.properties;
  const mixinTargets = doc.mixinTargets || [];
  const tags = doc.tags || [];

  return {
    aliases: doc.aliases,
    description: doc.description ? md(linkify({ text: doc.description, contextNode: node })) : null,
    filePath: doc.filePath,
    id: doc.id,
    isModule: doc.isModule,
    loc: doc.loc,
    line: doc.line,

    mixinTargets: mixinTargets.map(function(typeName) {
      // var target = compiler.corpus.resolve({
      //   text: typeName,
      //   contextNode: node
      // });

      // if (!target) {
      //   return { name: typeName };
      // }

      return {
        // TODO: ... ?
        // uid: target.uid,
        name: typeName,
        html: renderTypeLink({
          typeName: typeName,
          renderer: renderer,
          builtInTypes: builtInTypes,
          // linkResolver: compiler.linkResolver,
          contextNode: node,
        })
      };
    }),

    name: doc.name,
    namespace: doc.namespace,
    nodeInfo: doc.nodeInfo,
    receiver: doc.receiver,
    symbol: doc.symbol,
    tags: tags.map(function(tag) {
      const nextTypeInfo = Object.assign({}, tag.typeInfo);
      const nextAttributes = {};

      if (tag.typeInfo.description) {
        nextTypeInfo.description = md(linkify({
          text: tag.typeInfo.description,
          contextNode: node,
        }));
      }

      if (TAGS_WITH_STRING.hasOwnProperty(tag.type)) {
        nextAttributes.string = md(linkify({
          text: tag.string,
          contextNode: node,
        }));
      }
      else if (tag.type === 'see') {
        nextTypeInfo.name = renderTypeLink({
          // linkResolver: compiler.linkResolver,
          contextNode: node,
          typeName: tag.typeInfo.name.trim(),
          builtInTypes: builtInTypes,
          renderer: renderer,
        });
      }

      nextTypeInfo.type = renderTagType(tag.typeInfo.type);

      return Object.assign({}, tag, nextAttributes, {
        typeInfo: nextTypeInfo,
      });
    }),

    type: doc.type,
  };

  function renderTagType(type) {
    if (!type) {
      return null;
    }

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
    strict: true,
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