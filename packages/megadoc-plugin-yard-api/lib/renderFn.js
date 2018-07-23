const YARDLinkInjector = require('./YARDLinkInjector');
const isAPIObject = require('./utils').isAPIObject;
const isAPIEndpoint = require('./utils').isAPIEndpoint;
const {
  MediaWikiLinkStrategy,
  MegadocLinkStrategy
} = require('megadoc-html-serializer')

const injectors = [ YARDLinkInjector, MegadocLinkStrategy, MediaWikiLinkStrategy ]

const bind = (node, descriptor) => ([ node.uid, descriptor ])
const isInternalLink = x => x[0] === '{' && x[x.length-1] === '}'

module.exports = function renderFn({ options }, operations, documentNode) {
  const { markdown, linkify } = operations;
  const doc = documentNode.properties;

  return [
    bind(documentNode, {
      text: markdown({
        contextNode: documentNode,
        text: linkify({
          text: extractDescriptionString(doc.text),
          injectors,
          contextNode: documentNode
        }),
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
        text: extractDescriptionString(node.properties.text),
        injectors,
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
      return linkType(options, operations, type, contextNode)
    })
  }
}

function renderEndpoint(options, operations, node) {
  const { markdown, linkify } = operations

  return {
    text: markdown({
      contextNode: node,
      text: linkify({
        text: extractDescriptionString(node.properties.text),
        injectors,
        contextNode: node
      }),
    }),

    tags: node.properties.tags.map(tag => {
      return renderEndpointTag(options, operations, tag, node);
    })
  }
}

const TagRenderers = [
  {
    types: [ 'example_request', 'example_response' ],
    render: (options, operations, tag, contextNode) => {
      const { codeBlock, markdown, linkify } = operations

      return {
        text: markdown({
          sanitize: false,
          contextNode,
          text: linkify({
            contextNode,
            format: 'html',
            injectors,
            text: markdown({
              contextNode,
              sanitize: true,
              trimHTML: false,
              text: codeBlock({
                syntax: 'json',
                text: tag.text
              })
            })
          })
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
            injectors,
            contextNode
          })
        }),

        types: tag.types.map(function(type) {
          return linkType(options, operations, type, contextNode);
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
              injectors,
              contextNode
            }),
            trimHTML: true,
          }),
        }
      }
      else if (isInternalLink(tag.text)) {
        return {
          text: linkType(options, operations, tag.text, contextNode)
        }
      }
      else {
        return { text: tag.text }
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

function linkType(options, { escapeHTML, markdown, linkify }, docstring, contextNode) {
  const typeInfo = getTypeInfo(docstring)

  if (options.builtInTypes && options.builtInTypes.indexOf(typeInfo.name) > -1) {
    return typeInfo.name;
  }

  const { arrayTypeStartSymbol = '', arrayTypeEndSymbol = '' } = options
  const link = `[${typeInfo.name}]()`;
  const typedLink = typeInfo.isArray ? `${arrayTypeStartSymbol}${link}${arrayTypeEndSymbol}` : link;

  return markdown({
    contextNode,
    text: linkify({
      contextNode,
      text: escapeHTML({
        text: typedLink
      }),
    }),
    sanitize: true,
    trimHTML: true,
  });
}

function getTypeInfo(docstring) {
  if (docstring.match(/^Array\<(.+?)\>$|^(.+?)\[\]$/)) {
    return Object.assign(getTypeInfo(RegExp.$1 || RegExp.$2), { isArray: true })
  }
  else if (isInternalLink(docstring)) {
    return getTypeInfo(docstring.slice(1, -1))
  }
  else {
    return { name: docstring, isArray: false }
  }
}

function listOf(x) {
  if (Array.isArray(x)) {
    return x
  }
  else {
    return [ x ]
  }
}

function extractDescriptionString(text) {
  if (typeof text === 'string') {
    return text
  }
  else if (text && typeof text.description === 'string') {
    return text.description
  }
  else {
    return null
  }
}