const R = require('ramda');
const CompositeValue = require('./CompositeValue');
const transformValue = require('./transformValue');

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

  const reducers = {
    CONVERT_MARKDOWN_TO_HTML: function(data, reduce) {
      const text = reduce(data.text);
      return reduce(state.markdownRenderer(Object.assign({}, data, { text, codeBlockRenderers })));
    },

    LINKIFY_STRING: function(data, reduce) {
      return reduce(state.linkResolver.linkify(data));
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

    return R.merge(node, nextData);
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
