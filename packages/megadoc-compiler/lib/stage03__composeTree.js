const mergeObject = require('./utils/mergeObject');
const TreeComposer = require('./TreeComposer');

module.exports = function composeTree(config, compilation, done) {
  const { documents, treeOperations, options } = compilation;

  done(null, mergeObject(compilation, {
    tree: TreeComposer.composeTree(options, documents, treeOperations)
  }))
};
