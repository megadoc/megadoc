const async = require('async');
const invariant = require('invariant');
const flattenArray = require('./utils/flattenArray');
const partial = require('./utils/partial');
const mergeObject = require('./utils/mergeObject');
const asyncMaybe = require('./utils/asyncMaybe');

module.exports = function reduce(reduceRoutines, compilation, done) {
  const { processor, refinedDocuments } = compilation;
  const context = {
    commonOptions: compilation.commonOptions,
    options: compilation.processorOptions,
    state: compilation.processorState
  };

  reduceEach(reduceRoutines, context, refinedDocuments, processor.reduceFnPath, asyncMaybe(function(documents) {
    return mergeObject(compilation, {
      documents: flattenArray(documents).map(ensureHasDefaultAttributes),
    });
  }, done));
};

// TODO: distribute
function reduceEach(reduceRoutines, context, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'reduceFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), context, reduceRoutines);

  async.mapLimit(files, 10, fn, done);
}

function ensureHasDefaultAttributes(documentNode) {
  if (!documentNode.meta) {
    documentNode.meta = {};
  }

  return documentNode;
}