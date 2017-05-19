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
    if (context.compilerOptions.strict) {
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

  const id = context.id;
  const name = namespaceAttributes.name || id;

  return b.namespace({
    id,
    name,
    title: namespaceAttributes.title || null,
    meta: namespaceAttributes.meta || {},
    config: namespaceAttributes.config || null,
    indexFields: namespaceAttributes.indexFields || null,
    documents: hierarchicalDocuments.filter(x => !x.parentNode),
  });
};

exports.mergeTrees = function(prevCompilation, nextCompilation) {
  const { verbose } = prevCompilation.compilerOptions;
  const changedFiles = nextCompilation.documents.reduce(function(map, document) {
    map[document.filePath] = 1;

    return map;
  }, {})

  const changedDocumentIds = nextCompilation.documents.reduce(function(map, document) {
    map[document.id] = 1;

    return map;
  }, {});

  if (verbose) {
    console.log('[D] Previous tree size =', prevCompilation.documents.length)
    console.log('[D] Merging tree with new sources coming from:', changedFiles)
  }

  const withoutChanged = prevCompilation.documents.filter(document => {
    return changedFiles[document.filePath] !== 1;
  }).map(document => {
    return document.merge({ parentNode: null });
  });

  const renderOpsWithoutChanged = objFilter(prevCompilation.renderOperations, documentId => {
    return changedDocumentIds[documentId] !== 1;
  });

  const treeOpsWithoutChanged = prevCompilation.treeOperations.filter(op => {
    return changedDocumentIds[op.data.id] !== 1 && changedDocumentIds[op.data.parentId] !== 1;
  });

  if (verbose) {
    console.log('[D] %d document(s) are no longer valid', withoutChanged.length);
  }

  const withPartials = withoutChanged.concat(nextCompilation.documents);
  const renderOpsWithPartials = Object.assign(renderOpsWithoutChanged, nextCompilation.renderOperations);
  const treeOpsWithPartials = treeOpsWithoutChanged.concat(nextCompilation.treeOperations);

  if (verbose) {
    console.log('[D] %d document(s) are now in the tree.', withPartials.length)
  }

  return {
    documents: withPartials,
    renderOperations: renderOpsWithPartials,
    treeOperations: treeOpsWithPartials,
  };
};

function withSourceMessage(document, message) {
  return message + ' (Source: ' + dumpNodeFilePath(document) + ')';
}

function objFilter(x, fn) {
  return Object.keys(x).filter(key => {
    return fn(x[key]);
  }).reduce(function(map, key) {
    map[key] = x[key];
    return map;
  }, {})
}