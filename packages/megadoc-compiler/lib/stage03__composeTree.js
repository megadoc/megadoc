const { builders: b, dumpNodeFilePath } = require('megadoc-corpus');
const R = require('ramda');

module.exports = function composeTree({
  compilerOptions,
  documents,
  id,
  treeOperations,
}) {
  // console.log("[D] Composing tree of %d nodes", compilation.documents.length);

  const documentMap = R.indexBy(R.prop('id'), documents);
  const documentChildren = {};
  const documentParents = {};
  const namespaceAttributes = {};
  const blacklisted = {};
  const maybeThrowError = msg => {
    if (compilerOptions.strict) {
      throw new Error(msg);
    }
    else {
      console.error(msg);
    }
  };

  treeOperations.forEach(function(op) {
    switch (op.type) {
      case 'CHANGE_NODE_PARENT':
        const parent = documentMap[op.data.parentId];
        const child = documentMap[op.data.id];

        if (!parent) {
          maybeThrowError(
            withSourceMessage(child,
              `Node with the id "${op.data.parentId}" specified as a parent for ` +
              `node "${op.data.id}" could not be found.`
            )
          );

          blacklisted[op.data.id] = true;

          return;
        }
        else if (!child) {
          maybeThrowError(
            withSourceMessage(parent,
              `Node with the id "${op.data.id}" specified as a child for ` +
              `node "${op.data.parentId}" could not be found.`
            )
          );

          blacklisted[op.data.id] = true;

          return;
        }

        if (!documentChildren[parent.id]) {
          documentChildren[parent.id] = [];
        }

        documentChildren[parent.id].push(child);
        documentParents[child.id] = parent;

        break;
      case 'SET_NAMESPACE_ATTRIBUTES':
        Object.assign(namespaceAttributes, op.data);
        break;
    }
  });

  const withoutBlacklistedDocuments = documents.filter(x => !blacklisted[x.id]);

  const hierarchicalDocuments = withoutBlacklistedDocuments.map(function(document) {
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

  const tree = b.namespace({
    id,
    name: namespaceAttributes.name || id,
    title: namespaceAttributes.title || null,
    meta: namespaceAttributes.meta || {},
    config: namespaceAttributes.config || null,
    indexFields: namespaceAttributes.indexFields || null,
    documents: hierarchicalDocuments.filter(x => !x.parentNode),
  });


  return tree;
};

function withSourceMessage(document, message) {
  return message + ' (Source: ' + dumpNodeFilePath(document) + ')';
}