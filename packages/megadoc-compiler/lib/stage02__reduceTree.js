const mergeObject = require('./utils/mergeObject');

module.exports = function reduceTree(compilation, done) {
  const { documents, processor } = compilation;
  const fn = require(processor.reduceTreeFnPath);
  const context = {
    compilerOptions: compilation.compilerOptions,
    options: compilation.processorOptions,
  };

  done(null, mergeObject(compilation, {
    treeOperations: fn(context, documents)
  }));
};