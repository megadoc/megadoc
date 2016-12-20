const async = require('async');
const invariant = require('invariant');
const flattenArray = require('./utils/flattenArray');
const partial = require('./utils/partial');
const mergeObject = require('./utils/mergeObject');
const asyncMaybe = require('./utils/asyncMaybe');

module.exports = function reduce(config, compilation, done) {
  const { processor, rawDocuments, options } = compilation;

  reduceEach(options, rawDocuments, processor.reduceFnPath, asyncMaybe(function(documents) {
    return mergeObject(compilation, {
      documents: flattenArray(documents),
    });
  }, done));
};

// TODO: distribute
function reduceEach(options, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'reduceFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), options);

  async.mapLimit(files, 10, fn, done);
}
