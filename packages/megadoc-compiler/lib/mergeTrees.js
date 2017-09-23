const R = require('ramda');

module.exports = function mergeTrees(prevCompilation, nextCompilation) {
  const { linter } = prevCompilation;
  const changedFiles = nextCompilation.files.map(linter.getRelativeFilePath);
  const changedDocumentIds = R.indexBy(R.prop('id'), nextCompilation.documents);

  const {
    documents: withoutChanged,
    renderOperations: renderOpsWithoutChanged,
    treeOperations: treeOpsWithoutChanged
  } = prune({ changedFiles, changedDocumentIds }, prevCompilation)

  const withPartials = R.concat(withoutChanged, nextCompilation.documents);
  const renderOpsWithPartials = Object.assign(renderOpsWithoutChanged, nextCompilation.renderOperations);
  const treeOpsWithPartials = R.concat(treeOpsWithoutChanged, nextCompilation.treeOperations);

  return {
    documents: withPartials,
    renderOperations: renderOpsWithPartials,
    treeOperations: treeOpsWithPartials,
  };
};

function nullifyParent(node) {
  return R.merge(node, { parentNode: null })
}

function prune({ changedFiles, changedDocumentIds }, compilation) {
  return {
    documents: R.map
    (
      nullifyParent,
      R.filter
      (
        document => changedFiles.indexOf(document.filePath) === -1,
        compilation.documents
      )
    ),

    renderOperations: R.filter
    (
      documentId => !changedDocumentIds[documentId],
      compilation.renderOperations
    ),

    treeOperations: R.filter
    (
      op => !changedDocumentIds[op.data.id] && !changedDocumentIds[op.data.parentId],
      compilation.treeOperations
    ),
  };
}