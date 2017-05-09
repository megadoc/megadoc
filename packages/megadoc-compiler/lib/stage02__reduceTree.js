const mergeObject = require('./utils/mergeObject');

module.exports = function reduceTree(compilation, done) {
  const { documents, processor } = compilation;

  let treeOperations = [];

  if (processor.reduceTreeFnPath) {
    const fn = require(processor.reduceTreeFnPath);
    const context = {
      commonOptions: compilation.commonOptions,
      options: compilation.processorOptions,
      state: compilation.processorState,
    };

    treeOperations = fn(context, documents);
  }

  done(null, mergeObject(compilation, { treeOperations: treeOperations }));
};