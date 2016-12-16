const fs = require('fs-extra');
const async = require('async');
const scanSources = require('./utils/scanSources');
const invariant = require('invariant');
const b = require('megadoc-corpus').builders;

const XCompiler = exports;

/**
 * Perform the compilation.
 *
 * @param {Function} done
 *        Callback to invoke when the compilation is complete.
 *
 * @param {String|Error} done.err
 *        If present, the compilation has failed. This parameter provides some
 *        context around the failure.
 *
 * @param  {Object} runOptions
 *         A set of options to control the compilation.
 *
 * @param {Boolean} [runOptions.stats=false]
 *        Turn this on if you want to generate compile-time statistics.
 */
exports.run = function(config, done) {
  const { tmpDir } = config;
  const stats = {};
  const processingStates = config.sources.map(XCompiler.createProcessingList);

  fs.ensureDirSync(tmpDir);

  const compile = async.compose(
    partial(XCompiler.reduceTree, config),
    partial(XCompiler.reduce, config),
    partial(XCompiler.parse, config)
  );

  compile(processingStates, function(err, rawDocumentLists) {
    fs.removeSync(tmpDir);

    console.log(JSON.stringify(rawDocumentLists, null, 4))

    if (err) {
      return done(err);
    }

    done(null, stats);
  });
};

// TODO: extract decorators
XCompiler.createProcessingList = function(source) {
  const files = scanSources(source.pattern, source.include, source.exclude);

  return {
    files,
    processor: inferProcessorMetaData(source.processor),
  };
};

// TODO: apply decorators
XCompiler.parse = function(config, sourceFileLists, done) {
  async.map(sourceFileLists, function(initialState, listCallback) {
    const { processor, files } = initialState;
    const parseOptions = {
      common: config,
      processor: processor.options
    };

    const [ applier, fn ] = processor.parseFnPath ?
      [ parseEach, processor.parseFnPath ] :
      [ parseBulk, processor.parseBulkFnPath ]
    ;

    applier(parseOptions, files, fn, asyncMaybe(function(rawDocuments) {
      return Object.assign({}, initialState, {
        rawDocuments: flattenArray(rawDocuments),
      });
    }, listCallback));
  }, done);
};

XCompiler.reduce = function(config, rawDocumentLists, done) {
  async.map(rawDocumentLists, function(parseState, callback) {
    const { processor, rawDocuments } = parseState;

    const reduceOptions = {
      common: config,
      processor: processor.options
    };

    if (!processor.reduceFnPath) {
      return callback(null, null);
    }

    reduceEach(reduceOptions, rawDocuments, processor.reduceFnPath, asyncMaybe(function(documents) {
      return Object.assign({}, parseState, {
        documents: flattenArray(documents),
      });
    }, callback));
  }, done);
};

XCompiler.reduceTree = function(config, documentLists, reduceTreeDone) {
  async.map(documentLists, function(reduceState, callback) {
    const { documents, processor } = reduceState;

    let treeOperations = [];

    if (processor.reduceTreeFnPath) {
      const fn = require(processor.reduceTreeFnPath);
      const reduceTreeOptions = {
        common: config,
        processor: processor.options
      };

      treeOperations = fn(reduceTreeOptions, documents);
    }

    callback(null, Object.assign({}, reduceState, {
      treeOperations
    }));
  }, reduceTreeDone);
};

function inferProcessorMetaData(processorEntry) {
  const processorSpec = require(processorEntry.name);
  const processorOptions = processorEntry.options || {};
  const hasAtomicParser = typeof processorSpec.parseFnPath === 'string';
  const hasBulkParser = typeof processorSpec.parseBulkFnPath === 'string';

  invariant(hasAtomicParser || hasBulkParser,
    "A processor must define either a parseFn or parseBulkFn parsing routine."
  );

  return {
    options: processorOptions,
    parseFnPath: processorSpec.parseFnPath,
    parseBulkFnPath: processorSpec.parseBulkFnPath,
    reduceFnPath: processorSpec.reduceFnPath,
    reduceTreeFnPath: processorSpec.reduceTreeFnPath,
  };
}

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

// TODO: distribute
function reduceEach(options, files, fnPath, done) {
  invariant(typeof fnPath === 'string',
    "Expected 'reduceFnPath' to point to a file, but it doesn't."
  );

  const fn = partial(require(fnPath), options);

  async.mapLimit(files, 10, fn, done);
}

function flattenArray(list) {
  return list.reduce(function(flatList, x) { return flatList.concat(x); }, []);
}

function asyncMaybe(f, done) {
  return (err, x) => {
    if (err) {
      done(err);
    }
    else {
      done(null, f(x));
    }
  }
}

function partial(fn, x) {
  return fn.bind(null, x);
}