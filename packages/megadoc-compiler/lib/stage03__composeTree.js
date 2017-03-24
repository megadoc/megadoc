const mergeObject = require('./utils/mergeObject');
const TreeComposer = require('./TreeComposer');

module.exports = function composeTree(compilation, done) {
  const { refinedDocuments, treeOperations } = compilation;
  const context = {
    commonOptions: compilation.commonOptions,
    options: compilation.processorOptions,
    state: compilation.processorState,
  };

  console.log('[D] Composing tree of %d nodes', compilation.refinedDocuments.length);

  done(null, mergeObject(compilation, {
    tree: TreeComposer.composeTree(context, refinedDocuments, treeOperations)
  }))
};
