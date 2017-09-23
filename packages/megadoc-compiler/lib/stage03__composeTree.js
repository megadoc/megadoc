const R = require('ramda');
const { builders: b, dumpNodeFilePath } = require('megadoc-corpus');
const isDocumentNode = node => node.type === 'Document'
const isDocumentEntityNode = node => node.type === 'DocumentEntity'
const { assignUID } = require('megadoc-corpus');

module.exports = function composeTree({
  compilerOptions,
  documents,
  id,
  treeOperations,
}) {
  // console.log('[D] Composing tree of %d nodes', documents.length, compilerOptions.strict);

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

  const hierarchize = node => {
    if (!documentChildren.hasOwnProperty(node.uid)) {
      return node;
    }
    else {
      const children = documentChildren[node.uid].map(hierarchize);

      return R.merge(node, {
        documents: children.filter(isDocumentNode),
        entities: children.filter(isDocumentEntityNode),
      })
    }
  }

  treeOperations.forEach(function(op) {
    switch (op.type) {
      case 'CHANGE_NODE_PARENT':
        const parent = documentUidMap[op.data.parentUid];
        const child = documentUidMap[op.data.uid];

        if (!parent) {
          maybeThrowError(
            withSourceMessage(child,
              `Node with UID "${op.data.parentUid}" specified as a parent for ` +
              `node "${op.data.uid}" could not be found.`
            )
          );

          blacklisted[op.data.uid] = true;

          return;
        }
        else if (!child) {
          maybeThrowError(
            withSourceMessage(parent,
              `Node with UID "${op.data.uid}" specified as a child for ` +
              `node "${op.data.parentUid}" could not be found.`
            )
          );

          blacklisted[op.data.uid] = true;

          return;
        }

        if (!documentChildren[parent.uid]) {
          documentChildren[parent.uid] = [];
        }

        documentChildren[parent.uid].push(child);
        documentParents[child.uid] = parent;

        break;
      case 'SET_NAMESPACE_ATTRIBUTES':
        Object.assign(namespaceAttributes, op.data);
        break;
    }
  });

  const withoutBlacklistedDocuments = documents.filter(x => !blacklisted[x.uid]);
  const rootNodes = withoutBlacklistedDocuments
    .filter(x => !documentParents.hasOwnProperty(x.uid))
    .filter(R.complement(isDocumentEntityNode))
  ;

  const hierarchicalNodes = rootNodes.map(hierarchize)

  return assignUID(
    b.namespace({
      id,
      name: namespaceAttributes.name || id,
      title: namespaceAttributes.title || null,
      meta: namespaceAttributes.meta || {},
      config: namespaceAttributes.config || null,
      indexFields: namespaceAttributes.indexFields || null,
      documents: hierarchicalNodes,
    })
  );
};

function withSourceMessage(document, message) {
  return message + ' (Source: ' + dumpNodeFilePath(document) + ')';
}