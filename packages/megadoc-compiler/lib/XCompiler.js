const fs = require('fs-extra');
const async = require('async');
const scanSources = require('./utils/scanSources');
const invariant = require('invariant');
const TreeComposer = require('./TreeComposer');
const renderRoutines = require('./renderRoutines');
const flattenArray = require('./utils/flattenArray');
const partial = require('./utils/partial');
const util = require('util');

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
XCompiler.run = function(config, done) {
  const tmpDir = config.tmpDir;
  const commonOptions = config; // TODO
  const compilations = config.sources.map(partial(XCompiler.createCompilation, commonOptions));

  fs.ensureDirSync(tmpDir);

  const compile = async.compose(
    partial(XCompiler.composeTree, config),
    partial(XCompiler.render, config),
    partial(XCompiler.reduceTree, config),
    partial(XCompiler.reduce, config),
    partial(XCompiler.parse, config)
  );

  const renderTrees = (x,y) => {
    async.map(x, partial(XCompiler.renderTree, config), y);
  };

  const cleanUpAndEmitDone = function(err, finishedCompilations) {
    fs.removeSync(tmpDir);

    // console.log(JSON.stringify(rawDocumentLists, null, 4))
    console.log(util.inspect(finishedCompilations, { showHidden: true, depth: null }))

    if (err) {
      return done(err);
    }
    else {
      done(null, finishedCompilations);
    }
  };

  async.map(compilations, compile, function(err, trees) {
    if (err) {
      cleanUpAndEmitDone(err);
    }
    else {
      renderTrees(trees, cleanUpAndEmitDone);
    }
  });
};

// TODO: extract decorators
XCompiler.createCompilation = function(commonOptions, source) {
  const files = scanSources(source.pattern, source.include, source.exclude);

  return {
    documents: null,
    files,
    options: {
      common: commonOptions,
      processor: source.processor.options || {},
    },
    processor: extractProcessingFunctionPaths(source.processor),
    rawDocuments: null,
    renderOperations: null,
    renderedTree: null,
    stats: {},
    tree: null,
    treeOperations: null,
  };
};

// TODO: apply decorators
XCompiler.parse = function(config, compilation, done) {
  const { processor, files, options } = compilation;

  const applier = processor.parseFnPath ? parseEach : parseBulk;
  const fn = processor.parseFnPath ? processor.parseFnPath : processor.parseBulkFnPath;

  applier(options, files, fn, asyncMaybe(function(rawDocuments) {
    return mergeObject(compilation, {
      rawDocuments: flattenArray(rawDocuments),
    });
  }, done));
};

XCompiler.reduce = function(config, compilation, done) {
  const { processor, rawDocuments, options } = compilation;

  reduceEach(options, rawDocuments, processor.reduceFnPath, asyncMaybe(function(documents) {
    return mergeObject(compilation, {
      documents: flattenArray(documents),
    });
  }, done));
};

XCompiler.reduceTree = function(config, compilation, done) {
  const { documents, processor, options } = compilation;

  let treeOperations = [];

  if (processor.reduceTreeFnPath) {
    const fn = require(processor.reduceTreeFnPath);

    treeOperations = fn(options, documents);
  }

  done(null, mergeObject(compilation, { treeOperations: treeOperations }));
};

XCompiler.render = function(config, compilation, done) {
  const { documents, processor, options } = compilation;

  let renderOperations = {};

  if (processor.renderFnPath) {
    const fn = require(processor.renderFnPath);

    renderOperations = documents.reduce(function(map, document) {
      const documentRenderingDescriptor = fn(options, renderRoutines, document);

      if (documentRenderingDescriptor) {
        map[document.id] = documentRenderingDescriptor;
      }

      return map;
    }, {})
  }

  done(null, mergeObject(compilation, { renderOperations: renderOperations }));
};

XCompiler.composeTree = function(config, compilation, done) {
  const { documents, treeOperations, options } = compilation;

  done(null, mergeObject(compilation, {
    tree: TreeComposer.composeTree(options, documents, treeOperations)
  }))
};

XCompiler.renderTree = function(config, compilation, done) {
  const { options, tree, renderOperations } = compilation;

  done(null, mergeObject(compilation, {
    renderedTree: TreeComposer.composeRenderedTree(options, tree, renderOperations)
  }))
};

function extractProcessingFunctionPaths(processorEntry) {
  const spec = require(processorEntry.name);
  const hasAtomicParser = typeof spec.parseFnPath === 'string';
  const hasBulkParser = typeof spec.parseBulkFnPath === 'string';

  invariant(hasAtomicParser || hasBulkParser,
    "A processor must define either a parseFn or parseBulkFn parsing routine."
  );

  invariant(typeof spec.reduceFnPath === 'string',
    "A processor must define a reducing routine found in 'reduceFnPath'."
  );

  return {
    parseFnPath: spec.parseFnPath,
    parseBulkFnPath: spec.parseBulkFnPath,
    reduceFnPath: spec.reduceFnPath,
    reduceTreeFnPath: spec.reduceTreeFnPath,
    renderFnPath: spec.renderFnPath,
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

function mergeObject(object, nextAttributes) {
  return Object.assign({}, object, nextAttributes);
}