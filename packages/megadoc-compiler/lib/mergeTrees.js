const R = require('ramda');
const relativize = require('./utils/relativize');

module.exports = function mergeTrees(prevCompilation, nextCompilation) {
  const changedFiles = R.indexBy(R.identity)(nextCompilation.files.map(relativize(nextCompilation.compilerOptions.assetRoot)));
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
  return node.merge({ parentNode: null })
}

function prune({ changedFiles, changedDocumentIds }, compilation) {
  return {
    documents: R.map
    (
      nullifyParent,
      R.filter
      (
        document => !changedFiles[document.filePath],
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