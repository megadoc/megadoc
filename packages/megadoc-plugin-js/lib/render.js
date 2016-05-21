var K = require('./Parser/constants');
var BUILT_IN_TYPES = [
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
  'Float64Array'
];

var EXPRESSION_TYPES = Object.freeze([
  K.TYPE_UNION,
  K.TYPE_ALL_LITERAL,
  K.TYPE_UNKNOWN_LITERAL,
  K.TYPE_UNKNOWN,
  K.TYPE_FUNCTION,
  K.TYPE_OBJECT,
  K.TYPE_OBJECT_PROPERTY
].reduce(function(map, x) { map[x] = true; return map; }, {}));

module.exports = function(compiler, namespaceNode, md, linkify, config) {
  var builtInTypes = BUILT_IN_TYPES.concat(config.builtInTypes || []).reduce(toIndexMap, {});

  namespaceNode.documents.forEach(visitNode);

  function visitNode(node) {
    if (node.properties) {
      renderNode(node);
    }

    if (node.entities) {
      node.entities.forEach(visitNode)
    }

    if (node.documents) {
      node.documents.forEach(visitNode)
    }
  }

  function renderNode(node) {
    var doc = node.properties;

    if (doc.description) {
      doc.description = md(linkify({
        text: doc.description,
        contextNode: node,
      }), { contextNode: node, });
    }

    if (doc.mixinTargets) {
      doc.mixinTargets = doc.mixinTargets.map(function(typeName) {
        var target = compiler.corpus.resolve({
          text: typeName,
          contextNode: node
        });

        if (!target) {
          return { name: typeName };
        }

        return {
          uid: target.uid,
          name: typeName,
          html: renderTypeLink({
            typeName: typeName,
            linkResolver: compiler.linkResolver,
            contextNode: node,
          })
        };
      });
    }

    if (doc.tags) {
      doc.tags.forEach(function(tag) {
        if (tag.typeInfo.description) {
          tag.typeInfo.description = md(linkify({
            text: tag.typeInfo.description,
            contextNode: node,
          }), { contextNode: node, });
        }

        if (tag.type === 'example') {
          tag.string = md(linkify({
            text: tag.string,
            contextNode: node,
          }), { contextNode: node, });
        }

        else if (tag.type === 'see') {
          tag.string = renderTypeLink({
            linkResolver: compiler.linkResolver,
            contextNode: node,
            typeName: tag.string.trim(),
          });
        }

        renderType(tag.typeInfo.type);
      });
    }

    function renderType(type) {
      if (!type) {
        return;
      }

      var isExpression = type.name in EXPRESSION_TYPES;

      if (type.name && !isExpression) {
        type.html = renderTypeLink({
          linkResolver: compiler.linkResolver,
          typeName: type.name,
          contextNode: node,
        });
      }

      // UnionType, TypeApplication
      if (type.elements) {
        type.elements.forEach(renderType);
      }

      // RecordType
      if (type.key) {
        renderType(type.key);
      }
      if (type.value) {
        renderType(type.value);
      }

      // FunctionType
      if (type.params) {
        type.params.forEach(renderType);
      }
      if (type.returnValue) {
        renderType(type.returnValue);
      }
    }
  }

  function renderTypeLink(params) {
    var typeName = params.typeName;
    var strict = !(typeName.toLowerCase() in builtInTypes);

    return params.linkResolver.renderLink({
      strict: strict,
      format: 'html',
      contextNode: params.contextNode,
    }, {
      path: typeName,
      text: typeName,
      source: typeName
    })
  }
};

function toIndexMap(map, x) {
  map[x.toLowerCase()] = true;
  return map;
}