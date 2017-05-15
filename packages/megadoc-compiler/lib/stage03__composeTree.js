const mergeObject = require('./utils/mergeObject');
const TreeComposer = require('./TreeComposer');

module.exports = function composeTree(compilation, done) {
  const { documents, treeOperations } = compilation;
  const context = {
    id: compilation.id,
    commonOptions: compilation.commonOptions,
    options: compilation.processorOptions,
    state: compilation.processorState,
  };

  // console.log("[D] Composing tree of %d nodes", compilation.documents.length);

  done(null, mergeObject(compilation, {
    tree: TreeComposer.composeTree(context, documents, treeOperations)
  }))
};
