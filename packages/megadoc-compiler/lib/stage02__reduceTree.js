const mergeObject = require('./utils/mergeObject');

module.exports = function reduceTree(compilation, done) {
  const { refinedDocuments, processor } = compilation;

  let treeOperations = [];

  if (processor.reduceTreeFnPath) {
    const fn = require(processor.reduceTreeFnPath);
    const context = {
      commonOptions: compilation.commonOptions,
      options: compilation.processorOptions,
      state: compilation.processorState,
    };

    treeOperations = fn(context, refinedDocuments);
  }

  done(null, mergeObject(compilation, { treeOperations: treeOperations }));
};