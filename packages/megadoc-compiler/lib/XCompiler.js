const fs = require('fs-extra');
const async = require('async');
const invariant = require('invariant');
const TreeComposer = require('./TreeComposer');
const TreeRenderer = require('./TreeRenderer');
const flattenArray = require('./utils/flattenArray');
const partial = require('./utils/partial');
const renderRoutines = require('./renderRoutines');
const scanSources = require('./utils/scanSources');
const ConfigUtils = require('megadoc-config-utils');

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
  const serializerSpec = ConfigUtils.getConfigurablePair(config.serializer) || { name: 'megadoc-html-serializer' };
  const Serializer = require(serializerSpec.name);
  const serializer = new Serializer(config, serializerSpec.options);

  /**
   * @property {Assets}
   *
   * The asset registry.
   */
  // const assets = new Assets();
  const compilations = config.sources.map(partial(XCompiler.createCompilation, commonOptions));

  /**
   * @property {LinkResolver}
   *
   * The link resolver for this compilation and corpus.
   */
  const linkResolver = new LinkResolver(this.corpus, {
    relativeLinks: !this.inSinglePageMode(),
    ignore: config.linkResolver.ignore
  });

  /**
   * @property {Renderer}
   *
   * The renderer instance configured for this compilation.
   */
  const renderer = new Renderer(config);

  async.series([
    function startSerializer(callback) {
      serializer.start(compilations, callback);
    },

    function doCompile(callback) {
      fs.ensureDirSync(tmpDir);

      const compile = async.compose(
        partial(XCompiler.composeTree, config),
        partial(XCompiler.render, config),
        partial(XCompiler.reduceTree, config),
        partial(XCompiler.reduce, config),
        partial(XCompiler.parse, config)
      );

      const cleanUpAndEmitDone = function(finishedCompilations) {
        fs.removeSync(tmpDir);

        // console.log(JSON.stringify(rawDocumentLists, null, 4))
        // console.log(util.inspect(finishedCompilations, { showHidden: true, depth: null }))

        callback(null, finishedCompilations);
      };

      const emitAssets = withRenderedTrees => {
        serializer.emitCorpusDocuments(withRenderedTrees, function(err) {
          if (err) {
            cleanUpAndEmitDone(err);
          }
          else {
            cleanUpAndEmitDone(null, withRenderedTrees);
          }
        });
      };

      const renderTrees = withTrees => {
        async.map(withTrees, partial(XCompiler.renderTree, config), function(err, withRenderedTrees) {
          if (err) {
            cleanUpAndEmitDone(err);
          }
          else {
            emitAssets(withRenderedTrees);
          }
        });
      };

      async.map(compilations, compile, function(err, withTrees) {
        if (err) {
          cleanUpAndEmitDone(err);
        }
        else {
          renderTrees(withTrees, emitAssets);
        }
      });
    },

    function stopSerializer(callback) {
      serializer.stop(callback);
    },
  ], done);
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
    renderedTree: TreeRenderer.renderTree(options, tree, renderOperations)
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
    serializerOptions: spec.serializerOptions || {},
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
