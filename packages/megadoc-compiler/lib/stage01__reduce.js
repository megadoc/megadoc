const async = require('async');
const R = require('ramda');
const invariant = require('invariant');
const partial = require('./utils/partial');
const asyncMaybe = require('./utils/asyncMaybe');
const { assignUID } = require('megadoc-corpus');

module.exports = function reduce(serializer, compilation, done) {
  const { processor, linter, refinedDocuments } = compilation;
  const context = {
    compilerOptions: compilation.compilerOptions,
    options: compilation.processorOptions,
  };

  const normalize = R.pipe(
    createMetaContainer,
    setDefaults,
    relativizeFilePaths,
    assignUID,
    // This routine was part of the tree rendering phase but because of
    // dependencies between the rendering reducers we would have had to do
    // multiple passes over the tree which is very costly.
    //
    // Instead we'll do preemptive per-node mutations in this stage and leave
    // the pure reducers for the tree rendering phase.
    typeof serializer.renderOne === 'function' ?
      serializer.renderOne.bind(serializer) :
      R.identity
  );

  reduceEach(context, refinedDocuments, processor.reduceFnPath, asyncMaybe(function(documents) {
    return R.merge(compilation, {
      documents: R.flatten(documents).map(normalize),
    });
  }, done));

  function createMetaContainer(node) {
    if (!node.meta) {
      node.meta = {};
    }

    return node;
  }

  // this statement may look strange (then again not in the larger scope of
  // things) but there is a very good reason for it (two, in fact):
  //
  // 1) part of it is sensitive data; system file paths should not end up in
  //    the runtime
  // 2) it makes file-path indexing sooooooooooooooo sooo much easier
  //
  // what's not cool about it is that it breaks everything that expects
  // filePath to be absolute, but those places (usually) have access to
  // config.assetRoot anyway and they know about this so, deal with it.
  //
  // don't remove please
  function relativizeFilePaths(node) {
    switch (node.type) {
      case 'Document':
        return Object.assign(node, {
          filePath: linter.getRelativeFilePath(node.filePath),
          documents: node.documents ? node.documents.map(relativizeFilePaths) : node.documents,
          entities: node.entities ? node.entities.map(relativizeFilePaths) : node.entities,
        });

      case 'DocumentEntity':
        return Object.assign(node, {
          filePath: linter.getRelativeFilePath(node.filePath),
        });

      default:
        return node;
    }
  }
};

function setDefaults(node) {
  switch (node.type) {
    case 'Namespace':
      return Object.assign(node, {
        documents: node.documents || [],
      })

    case 'Document':
      return Object.assign(node, {
        documents: node.documents || [],
        entities: node.entities || [],
      })

    default:
      return node
  }
}

// TODO: distribute
function reduceEach(context, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'reduceFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), context);

  async.mapLimit(files, 10, fn, done);
}