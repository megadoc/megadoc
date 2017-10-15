const R = require('ramda');
const async = require('async');
const invariant = require('invariant');
const asyncMaybe = require('./utils/asyncMaybe');
const asyncNoop = (x, y, callback) => callback();

const divisus = require('divisus');

// TODO: apply decorators
module.exports = function parse(cluster, concurrency, compilation, done) {
  const { files, decorators, processor } = compilation;
  const applier = processor.parseFnPath ? parseEach : parseBulk;
  const fnPath = processor.parseFnPath ? processor.parseFnPath : processor.parseBulkFnPath;
  const context = {
    id: compilation.id,
    compilerOptions: compilation.compilerOptions,
    options: compilation.processorOptions,
  };

  applier(cluster, concurrency, context, files, fnPath, decorators, asyncMaybe(function([ rawDocuments, decorations = [] ]) {
    return R.merge(compilation, {
      decorations: decorations.reduce((map, fileDecorations, fileIndex) => {
        const file = files[fileIndex];

        fileDecorations.forEach((d, decoratorIndex) => {
          const decorator = decorators[decoratorIndex];

          if (d) {
            if (!map[file]) {
              map[file] = {};
            }

            map[file][decorator.metaKey] = d;
          }
        })

        return map;
      }, {}),
      rawDocuments: R.flatten(rawDocuments),
    });
  }, done));
};

function parseEach(cluster, concurrency, context, files, fnPath, decorators, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'parseFnPath' to point to a file, but it doesn't."
  );

  const injectContext = f => R.partial(f, [ context ])
  const fn = divisus(cluster).fn(fnPath);
  const metaParsers = decorators.map(decorator => {
    if (decorator.parseFnPath) {
      return divisus(cluster).fn(decorator.parseFnPath);
    }
    else {
      return asyncNoop;
    }
  })

  if (metaParsers.length) {
    async.parallel([
      R.partial(async.mapLimit, [files, concurrency, injectContext(fn) ]),
      R.partial(async.mapLimit, [
        files, concurrency, R.partial(async.applyEach, [
          metaParsers.map(injectContext).map(f => (file, callback) =>{
            f(file, function(err, decoration) {
              if (err) {
                callback(err)
              }
              else {
                callback(null, decoration)
              }
            })
          })
        ])
      ]),
    ], done)
  }
  else {
    async.mapLimit(files, 5, injectContext(fn), function(err, rawDocuments) {
      if (err) {
        done(err);
      }
      else {
        done(null, [ rawDocuments, [] ])
      }
    })
  }
}

// TODO: apply in background
// TODO: apply decorators
function parseBulk(cluster, concurrency, context, files, fnPath, decorators, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'parseBulkFnPath' to point to a file, but it doesn't."
  );

  const fn = R.partial(require(fnPath), [ context ]);

  fn(files, (err, docs) => done(err, [docs]));
}
