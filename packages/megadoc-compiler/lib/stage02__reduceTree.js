const mergeObject = require('./utils/mergeObject');

module.exports = function reduceTree(config, compilation, done) {
  const { documents, processor, options } = compilation;

  let treeOperations = [];

  if (processor.reduceTreeFnPath) {
    const fn = require(processor.reduceTreeFnPath);

    treeOperations = fn(options, documents);
  }

  done(null, mergeObject(compilation, { treeOperations: treeOperations }));
};