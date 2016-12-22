const mergeObject = require('./utils/mergeObject');
const TreeComposer = require('./TreeComposer');

module.exports = function composeTree(compilation, done) {
  const { documents, treeOperations } = compilation;
  const context = {
    commonOptions: compilation.commonOptions,
    options: compilation.processorOptions,
    state: compilation.processorState,
  };

  done(null, mergeObject(compilation, {
    tree: TreeComposer.composeTree(context, documents, treeOperations)
  }))
};
