module.exports = function mergeTrees(prevCompilation, nextCompilation) {
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

function objFilter(x, fn) {
  return Object.keys(x).filter(key => {
    return fn(x[key]);
  }).reduce(function(map, key) {
    map[key] = x[key];
    return map;
  }, {})
}