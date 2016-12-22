const async = require('async');
const invariant = require('invariant');
const flattenArray = require('./utils/flattenArray');
const partial = require('./utils/partial');
const mergeObject = require('./utils/mergeObject');
const asyncMaybe = require('./utils/asyncMaybe');

// TODO: apply decorators
module.exports = function parse(compilation, done) {
  const { processor, files } = compilation;

  const applier = processor.parseFnPath ? parseEach : parseBulk;
  const fn = processor.parseFnPath ? processor.parseFnPath : processor.parseBulkFnPath;
  const context = {
    commonOptions: compilation.commonOptions,
    options: compilation.processorOptions,
    state: compilation.processorState,
  };

  applier(context, files, fn, asyncMaybe(function(rawDocuments) {
    return mergeObject(compilation, {
      rawDocuments: flattenArray(rawDocuments),
    });
  }, done));
};

// TODO: distribute
function parseEach(context, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'parseFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), context);

  async.mapLimit(files, 10, fn, done);
}

// TODO: apply in background
function parseBulk(context, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'parseBulkFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), context);

  fn(files, done);
}
