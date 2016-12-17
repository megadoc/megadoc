const invariant = require('invariant');
const b = require('megadoc-corpus').builders;
const Renderer = require('megadoc/lib/Renderer');
const transformValue = require('./transformValue');
const CompositeValue = require('./CompositeValue');

const markdownRenderer = new Renderer({
  layoutOptions: {},
})

exports.composeTree = function(options, documentList, treeOperations) {
  const documentMap = documentList.reduce(function(map, document) {
    map[document.id] = document;

    return map;
  }, {});

  const documentChildren = {};
  const documentParents = {};

  treeOperations.forEach(function(op) {
    switch (op.type) {
      case 'CHANGE_NODE_PARENT':
        const parent = documentMap[op.data.parentId];
        const child = documentMap[op.data.id];

        invariant(!!parent,
          `Node with the id "${op.data.parentId}" specified as a parent for ` +
          `node "${op.data.id}" could not be found.`
        );

        invariant(!!child,
          `Node with the id "${op.data.id}" specified as a child for ` +
          `node "${op.data.parentId}" could not be found.`
        );

        if (!documentChildren[parent.id]) {
          documentChildren[parent.id] = [];
        }

        documentChildren[parent.id].push(child);
        documentParents[child.id] = parent;

        break;
    }
  });

  const hierarchicalDocuments = documentList.map(function(document) {
    const modifications = {};

    if (documentChildren.hasOwnProperty(document.id)) {
      const childDocuments = documentChildren[document.id].filter(x => x.type === 'Document');

      if (childDocuments.length) {
        modifications.documents = []
          .concat(document.documents || [])
          .concat(childDocuments)
        ;
      }

      const childEntities = documentChildren[document.id].filter(x => x.type === 'DocumentEntity');

      if (childEntities.length) {
        modifications.entities = []
          .concat(document.entities || [])
          .concat(childEntities)
        ;
      }
    }

    if (documentParents.hasOwnProperty(document.id)) {
      modifications.parentNode = documentParents[document.id];
    }

    if (Object.keys(modifications).length > 0) {
      return document.merge(modifications);
    }
    else {
      return document;
    }
  });

  return b.namespace({
    id: options.processor.id,
    name: options.processor.name,
    meta: {},
    documents: hierarchicalDocuments.filter(x => !x.parentNode),
  });
};

exports.composeRenderedTree = function(options, tree, renderOperations) {
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
