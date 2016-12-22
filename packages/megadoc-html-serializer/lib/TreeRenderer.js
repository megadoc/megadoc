const CompositeValue = require('./CompositeValue');
const transformValue = require('./transformValue');

exports.renderTree = function(state, tree, renderOperations) {
  const reducers = {
    CONVER_MARKDOWN_TO_HTML: function(data, reduce) {
      return reduce(state.markdownRenderer(data));
    },

    LINKIFY_STRING: function(data, reduce) {
      const linkifyData = Object.assign({
        strict: state.commonOptions.strict,
      }, data);

      return reduce(state.linkResolver.linkify(linkifyData));
    },

    LINKIFY_FRAGMENT: function(data, reduce) {
      return reduce(
        state.linkResolver.renderLink(
          {
            strict: data.hasOwnProperty('strict') ? data.strict : state.commonOptions.strict,
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

    if (node.entities) {
      const nextEntities = node.entities.map(visitNode);

      if (nextEntities.some((x, i) => x !== node.entities[i])) {
        nextData.entities = nextEntities;
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
