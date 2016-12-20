const Renderer = require('megadoc/lib/Renderer');
const CompositeValue = require('../CompositeValue');
const transformValue = require('./transformValue');

// TODO: take from compilation config
const markdownRenderer = new Renderer({
  layoutOptions: {},
})

exports.renderTree = function(options, tree, renderOperations) {
  const reducers = {
    CONVER_MARKDOWN_TO_HTML: function(x) {
      return markdownRenderer(x);
    },

    LINKIFY_STRING: function(x, reduce) { // TODO
      return reduce(x.text);
    }
  };

  function visitNode(node) {
    const nextData = {};

    if (renderOperations[node.id]) {
      const nextProperties = renderNodeProperties(reducers, node.properties, renderOperations[node.id]);

      if (nextProperties) {
        nextData.properties = nextProperties;
      }
    }

    if (node.documents) {
      const nextDocuments = node.documents.map(visitNode);

      if (nextDocuments.some((x, i) => x !== node.documents[i])) {
        nextData.documents = nextDocuments;
      }
    }

    if (Object.keys(nextData).length > 0) {
      return node.merge(nextData);
    }
    else {
      return node;
    }
  }

  return visitNode(tree);
};

function renderNodeProperties(reducers, properties, renderedPropertySpec) {
  let hasChanged = false;

  const nextProperties = transformValue(
    properties,
    renderedPropertySpec,
    function(thisValue, possiblyCompositeValue) {
      const nextValue = CompositeValue.compute(reducers, possiblyCompositeValue);

      if (nextValue !== thisValue) {
        hasChanged = true;
      }

      return nextValue;
    }
  );

  if (!hasChanged) {
    return null;
  }
  else {
    return nextProperties;
  }
}
