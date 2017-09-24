const R = require('ramda');
const CompositeValue = require('./CompositeValue');
const transformValue = require('./transformValue');
const { extractSummary } = require('megadoc-markdown-utils');

const extractSummaryFromMarkdown = function(markdown) {
  return extractSummary(markdown || '', {
    plainText: true
  })
};

exports.renderTree = function(state, tree, renderOperations) {
  const reducers = {
    CONVERT_MARKDOWN_TO_HTML: function(data, reduce) {
      return reduce(state.markdownRenderer(data));
    },

    LINKIFY_STRING: function(data, reduce) {
      const linkifyData = Object.assign({
        strict: state.compilerConfig.strict,
      }, data);

      return reduce(state.linkResolver.linkify(linkifyData));
    },

    LINKIFY_FRAGMENT: function(data, reduce) {
      return reduce(
        state.linkResolver.renderLink(
          {
            strict: data.hasOwnProperty('strict') ? data.strict : state.compilerConfig.strict,
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

    if (node.summaryFields) {
      const summaryInput = node.summaryFields.reduce(function(value, fieldName) {
        return value || node.properties[fieldName]
      }, null);

      if (summaryInput) {
        nextData.summary = extractSummaryFromMarkdown(summaryInput);
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
