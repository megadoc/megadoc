const async = require('async');
const invariant = require('invariant');
const flattenArray = require('./utils/flattenArray');
const partial = require('./utils/partial');
const mergeObject = require('./utils/mergeObject');
const asyncMaybe = require('./utils/asyncMaybe');

// TODO: apply decorators
module.exports = function parse(config, compilation, done) {
  const { processor, files, options } = compilation;

  const applier = processor.parseFnPath ? parseEach : parseBulk;
  const fn = processor.parseFnPath ? processor.parseFnPath : processor.parseBulkFnPath;

  applier(options, files, fn, asyncMaybe(function(rawDocuments) {
    return mergeObject(compilation, {
      rawDocuments: flattenArray(rawDocuments),
    });
  }, done));
};

// TODO: distribute
function parseEach(options, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'parseFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), options);

  async.mapLimit(files, 10, fn, done);
}

// TODO: apply in background
function parseBulk(options, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'parseBulkFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), options);

  fn(files, done);
}
