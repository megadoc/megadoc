const async = require('async');
const invariant = require('invariant');
const flattenArray = require('./utils/flattenArray');
const partial = require('./utils/partial');
const mergeObject = require('./utils/mergeObject');
const asyncMaybe = require('./utils/asyncMaybe');
const { curry } = require('lodash');

const relativize = curry(function relativize(assetRoot, x) {
  const pattern = `${assetRoot}/`;
  const sz = pattern.length;

  return x.indexOf(pattern) === 0 ? x.slice(sz) : x;
})

module.exports = function reduce(reduceRoutines, compilation, done) {
  const { compilerOptions, processor, refinedDocuments } = compilation;
  const context = {
    compilerOptions: compilation.compilerOptions,
    options: compilation.processorOptions,
  };

  const relativizeThis = relativize(compilerOptions.assetRoot)

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
      documentNode.filePath = relativizeThis(documentNode.filePath)
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