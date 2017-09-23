const async = require('async');
const invariant = require('invariant');
const flattenArray = require('./utils/flattenArray');
const partial = require('./utils/partial');
const mergeObject = require('./utils/mergeObject');
const asyncMaybe = require('./utils/asyncMaybe');
const divisus = require('divisus');

// TODO: apply decorators
module.exports = function parse(cluster, compilation, done) {
  const { files, processor } = compilation;
  const applier = processor.parseFnPath ? parseEach : parseBulk;
  const fn = processor.parseFnPath ? processor.parseFnPath : processor.parseBulkFnPath;
  const context = {
    id: compilation.id,
    compilerOptions: compilation.compilerOptions,
    options: compilation.processorOptions,
  };

  applier(cluster, context, files, fn, asyncMaybe(function(rawDocuments) {
    return mergeObject(compilation, {
      rawDocuments: flattenArray(rawDocuments),
    });
  }, done));
};

// TODO: distribute
function parseEach(cluster, context, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'parseFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(divisus(cluster).fn(fnPath), context);

  async.mapLimit(files, 10, fn, done);
}

// TODO: apply in background
function parseBulk(cluster, context, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'parseBulkFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), context);

  fn(files, done);
}
