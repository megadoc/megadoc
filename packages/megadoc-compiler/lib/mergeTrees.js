const R = require('ramda');

module.exports = function mergeTrees(prevCompilation, nextCompilation) {
  const { linter } = prevCompilation;
  const changedFiles = nextCompilation.files.map(linter.getRelativeFilePath);
  const changedDocumentUIDs = R.indexBy(R.prop('uid'), nextCompilation.documents);

  const {
    documents: withoutChanged,
    renderOperations: renderOpsWithoutChanged,
    treeOperations: treeOpsWithoutChanged
  } = prune({
    changedFiles,
    changedDocumentUIDs
  }, prevCompilation)

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

function prune({ changedFiles, changedDocumentUIDs }, compilation) {
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
      documentId => !changedDocumentUIDs[documentId],
      compilation.renderOperations
    ),

    treeOperations: R.filter
    (
      op => !changedDocumentUIDs[op.data.uid] && !changedDocumentUIDs[op.data.parentUid],
      compilation.treeOperations
    ),
  };
}