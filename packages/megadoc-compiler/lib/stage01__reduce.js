const async = require('async');
const invariant = require('invariant');
const flattenArray = require('./utils/flattenArray');
const partial = require('./utils/partial');
const mergeObject = require('./utils/mergeObject');
const asyncMaybe = require('./utils/asyncMaybe');

module.exports = function reduce(reduceRoutines, compilation, done) {
  const { compilerOptions, processor, refinedDocuments } = compilation;
  const context = {
    compilerOptions: compilation.compilerOptions,
    options: compilation.processorOptions,
    state: compilation.processorState
  };

  reduceEach(reduceRoutines, context, refinedDocuments, processor.reduceFnPath, asyncMaybe(function(documents) {
    return mergeObject(compilation, {
      documents: flattenArray(documents).map(normalize),
    });
  }, done));

  function normalize(documentNode) {
    if (!documentNode.meta) {
      documentNode.meta = {};
    }

    if (documentNode.filePath) {
      documentNode.filePath = documentNode.filePath.replace(compilerOptions.assetRoot)
    }

    return documentNode;
  }
};

// TODO: distribute
function reduceEach(reduceRoutines, context, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'reduceFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), context, reduceRoutines);

  async.mapLimit(files, 10, fn, done);
}