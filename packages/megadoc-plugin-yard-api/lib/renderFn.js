const YARDLinkInjector = require('./YARDLinkInjector');
const isAPIObject = require('./utils').isAPIObject;
const isAPIEndpoint = require('./utils').isAPIEndpoint;
const CODE_TAGS = [ 'example_request', 'example_response' ];

const bind = (node, descriptor) => ([ node.uid, descriptor ])
const isInternalLink = x => x[0] === '{' && x[x.length-1] === '}'

module.exports = function renderFn({ options }, defaultOperations, documentNode) {
  const operations = {
    markdown: defaultOperations.markdown,

    linkify: params => defaultOperations.linkify(Object.assign(params, {
      injectors: [ YARDLinkInjector ]
    })),

    linkifyFragment: defaultOperations.linkifyFragment,
  }

  const { markdown, linkify } = operations;
  const doc = documentNode.properties;

  return [
    bind(doc, {
      text: markdown({
        contextNode: documentNode,
        text: linkify({ text: doc.text, contextNode: documentNode }),
      }),
    }),
  ].concat(
    documentNode.entities.filter(isAPIObject).map(function(childNode) {
      return bind(childNode, renderObject(options, operations, childNode, documentNode))
    })
  ).concat(
    documentNode.entities.filter(isAPIEndpoint).map(function(childNode) {
      return bind(childNode, renderEndpoint(options, operations, childNode, documentNode))
    })
  );
};


function renderObject(options, operations, node, contextNode) {
  const { markdown, linkify } = operations;

  return {
    text: markdown({
      contextNode,
      text: linkify({
        text: node.properties.text,
        contextNode
      })
    }),

    schema: node.properties.schema.map(field => {
      return renderAPIObjectSchemaField(options, operations, field, contextNode);
    })
  }
}

function renderAPIObjectSchemaField(options, operations, field, contextNode) {
  return {
    types: field.types.map(type => {
      return linkType(options, operations, TypeInfo(type), contextNode)
    })
  }
}

function renderEndpoint(options, operations, node) {
  const { markdown, linkify } = operations

  return {
    text: markdown({
      contextNode: node,
      text: linkify({ text: node.properties.text, contextNode: node }),
    }),

    tags: node.properties.tags.map(tag => {
      return renderEndpointTag(options, operations, tag, node);
    })
  }
}

const TagRenderers = [
  {
    types: CODE_TAGS,
    render: (options, operations, tag, contextNode) => {
      const { markdown, linkify } = operations
      const linkifiedCodeBlock = linkify({
        contextNode,
        format: 'html',
        text: '```json\n' + tag.text + '\n```',
      });

      return {
        text: markdown({
          contextNode,
          sanitize: false,
          trimHTML: false,
          text: linkifiedCodeBlock,
        })
      }
    },
  },

  {
    types: 'argument',
    render: (options, operations, tag, contextNode) => {
      const { markdown, linkify } = operations

      return {
        text: markdown({
          contextNode,
          text: linkify({
            text: tag.text,
            contextNode
          })
        }),

        types: tag.types.map(function(type) {
          return linkType(options, operations, TypeInfo(type), contextNode);
        }),
      }

    }
  },

  {
    types: 'returns',
    render: (options, operations, tag, contextNode) => {
      const { markdown, linkify } = operations

      if (tag.text.split('\n').length > 1) {
        return {
          codeBlock: true,
          text: markdown({
            contextNode,
            text: linkify({
              text: tag.text,
              contextNode
            }),
            trimHTML: true,
          }),
        }
      }
      else if (isInternalLink(tag.text)) {
        return {
          text: linkType(options, operations, TypeInfo(tag.text), contextNode)
        }
      }
    },
  },
]

const TagRendererIndex = TagRenderers.reduce(function(map, { types, render }) {
  listOf(types).forEach(type => {
    map[type] = render
  })

  return map
}, {})

function renderEndpointTag(options, operations, tag, contextNode) {
  const renderer = TagRendererIndex[tag.tag_name]

  if (renderer) {
    return renderer(options, operations, tag, contextNode)
  }
  else {
    return {}
  }
}

function linkType(options, { markdown, linkifyFragment }, typeInfo, contextNode) {
  const builtInTypes = options.builtInTypes || []
  let link = typeInfo.name;

  if (builtInTypes.indexOf(typeInfo.name) === -1) {
    link = markdown({
      contextNode,
      text: linkifyFragment({
        text: typeInfo.name,
        contextNode,
      }),
      trimHTML: true
    });
  }

  if (typeInfo.isArray) {
    return 'Array.&lt;' + link + '&gt;';
  }
  else {
    return link;
  }
}

function TypeInfo(docstring) {
  var isArray;
  var typeStr = docstring;

  if (docstring.match(/^Array\<(.*)\>$|^(.*)\[\]$/)) {
    typeStr = RegExp.$1 || RegExp.$2;
    isArray = true;
  }

  if (isInternalLink(typeStr)) {
    typeStr = typeStr.slice(1, -1)
  }

  return {
    name: typeStr,
    isArray: isArray
  };
}

function listOf(x) {
  if (Array.isArray(x)) {
    return x
  }
  else {
    return [ x ]
  }
}