const { builders: b, dumpNodeFilePath } = require('megadoc-corpus');
const R = require('ramda');

module.exports = function composeTree({
  compilerOptions,
  documents,
  id,
  treeOperations,
}) {
  // console.log('[D] Composing tree of %d nodes', documents.length, compilerOptions.strict);

  const documentMap = R.indexBy(R.prop('id'), documents);
  const documentUidMap = R.indexBy(R.prop('uid'), documents);
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

  const getByIdentifiers = (docId, docUid) => {
    if (typeof docUid !== 'undefined') {
      return documentUidMap[docUid];
    }
    else {
      return documentMap[docId]
    }
  }

  treeOperations.forEach(function(op) {
    switch (op.type) {
      case 'CHANGE_NODE_PARENT':
        const parent = getByIdentifiers(op.data.parentId, op.data.parentUid);
        const child = getByIdentifiers(op.data.id, op.data.uid);

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
  const rootNodes = withoutBlacklistedDocuments.filter(x => !documentParents.hasOwnProperty(x.id));

  const isDocumentNode = node => node.type === 'Document'
  const isDocumentEntityNode = node => node.type === 'DocumentEntity'

  const hierarchize = node => {
    if (!documentChildren.hasOwnProperty(node.id)) {
      return node;
    }
    else {
      const children = documentChildren[node.id].map(hierarchize);

      return node.merge({
        documents: children.filter(isDocumentNode),
        entities: children.filter(isDocumentEntityNode),
      })
    }
  }

  const hierarchicalNodes = rootNodes.map(hierarchize)

  const tree = b.namespace({
    id,
    name: namespaceAttributes.name || id,
    title: namespaceAttributes.title || null,
    meta: namespaceAttributes.meta || {},
    config: namespaceAttributes.config || null,
    indexFields: namespaceAttributes.indexFields || null,
    documents: hierarchicalNodes,
  });


  return tree;
};

function withSourceMessage(document, message) {
  return message + ' (Source: ' + dumpNodeFilePath(document) + ')';
}