const R = require('ramda');
const CompositeValue = require('./CompositeValue');
const transformValue = require('./transformValue');
const { escapeHTML } =  require('megadoc-markdown-utils')

exports.renderTree = function(state, tree, { decorators = [], linter, renderOperations }) {
  const codeBlockRendererInjections = {
    linkify: state.linkResolver.linkify.bind(state.linkResolver),
    linter,
  };

  const codeBlockRenderers = R.reduce(function(acc, decorator) {
    R.forEach(({ lang, renderFn }) => {
      acc[lang] = R.partial(renderFn, [ codeBlockRendererInjections, decorator.options, ])
    }, R.path([ 'serializerOptions', 'html', 'codeBlockRenderers' ], decorator.spec) || [])

    return acc;
  }, {}, decorators)

  const sealState = {
    edgeGraph: state.edgeGraph
  }

  const sealDecorations = decorators.filter(x => x.sealFnPath).map(decorator => {
    return {
      seal: require(decorator.sealFnPath),
      metaKey: decorator.metaKey
    }
  })

  const reducers = {
    CONVERT_MARKDOWN_TO_HTML: function(data, reduce) {
      const text = reduce(data.text);
      return reduce(state.markdownRenderer(Object.assign({}, data, { text, codeBlockRenderers })));
    },

    WRAP_AS_MARKDOWN_CODE_BLOCK: function(data, reduce) {
      const wrapper = '```'
      return reduce(`${wrapper}${data.syntax}\n${reduce(data.text)}\n${wrapper}`);
    },

    LINKIFY_STRING: function(data, reduce) {
      const text = reduce(data.text);
      return reduce(state.linkResolver.linkify(Object.assign({}, data, { text })));
    },

    LINKIFY_FRAGMENT: function(data, reduce) {
      return reduce(
        state.linkResolver.renderLink(
          {
            format: data.format,
            contextNode: data.contextNode,
          },
          {
            path: data.path || data.text,
            text: data.text,
            source: data.source || data.text,
          }
        )
      );
    },

    RESOLVE_UID: function(data, reduce) {
      const index = state.corpus.resolve({
        text: data.text,
        contextNode: data.contextNode
      })

      return reduce(index ? index.node.uid : undefined)
    },

    ESCAPE_HTML: function(data, reduce) {
      return reduce(escapeHTML(data.text))
    }
  };

  function visitNode(node) {
    const nextData = {};

    if (renderOperations[node.uid]) {
      const nextProperties = renderNodeProperties(reducers, node.properties, renderOperations[node.uid]);

      if (nextProperties) {
        nextData.properties = nextProperties;
      }
    }

    if (node.documents) {
      nextData.documents = node.documents.map(visitNode);
    }

    if (node.entities) {
      nextData.entities = node.entities.map(visitNode);
    }

    if (sealDecorations.length) {
      nextData.meta = applySealDecorations(node)
    }

    return R.merge(node, nextData);
  }

  function applySealDecorations(node) {
    return sealDecorations.reduce(function(nextMeta, decorator) {
      const decoration = decorator.seal(sealState, node)

      if (decoration) {
        return Object.assign(nextMeta, {
          [decorator.metaKey]: decoration
        })
      }
      else {
        return nextMeta
      }
    }, node.meta)
  }

  return visitNode(tree);
};

function renderNodeProperties(reducers, properties, renderedPropertySpec) {
  return transformValue(
    properties,
    renderedPropertySpec,
    function(thisValue, possiblyCompositeValue) {
      return CompositeValue.compute(reducers, possiblyCompositeValue);
    }
  );
}
