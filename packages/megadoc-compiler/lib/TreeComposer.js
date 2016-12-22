const invariant = require('invariant');
const b = require('megadoc-corpus').builders;
const dumpNodeFilePath = require('megadoc-corpus').dumpNodeFilePath;

exports.composeTree = function(context, documentList, treeOperations) {
  const documentMap = documentList.reduce(function(map, document) {
    map[document.id] = document;

    return map;
  }, {});

  const documentChildren = {};
  const documentParents = {};
  const namespaceAttributes = {};
  const blacklisted = {};
  const maybeThrowError = msg => {
    if (context.commonOptions.strict) {
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

  const withoutBlacklistedDocuments = documentList.filter(x => !blacklisted[x.id]);

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

  return b.namespace({
    id: namespaceAttributes.id || context.options.id,
    name: namespaceAttributes.name || context.options.name,
    title: namespaceAttributes.title || null,
    meta: namespaceAttributes.meta || {},
    config: namespaceAttributes.config || null,
    indexFields: namespaceAttributes.indexFields || null,
    documents: hierarchicalDocuments.filter(x => !x.parentNode),
  });
};

function withSourceMessage(document, message) {
  return message + ' (Source: ' + dumpNodeFilePath(document) + ')';
}