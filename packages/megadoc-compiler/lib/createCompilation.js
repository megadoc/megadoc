const R = require('ramda');
const crypto = require('crypto');
const invariant = require('invariant');
const scanSources = require('./utils/scanSources');
const { getConfigurablePair } = require('megadoc-config-utils');
const blankProcessor = require('./blankProcessor');

function createCompilation({
  assetRoot,
  changedSources,
  compilerOptions,
  linter
}, source, done) {
  getSourceFiles({ assetRoot, changedSources, source }, function(err, files) {
    if (err) {
      return done(err);
    }

    const processorEntry = getConfigurablePair(source.processor);
    const spec = require(processorEntry.name);
    const paths = extractPaths(spec);
    const configure = require(paths.configureFnPath);

    const id = source.id || calculateMD5Sum(JSON.stringify(source));
    const { decorators = [] } = source;

    invariant(
      typeof spec.parseFnPath === 'string' ||
      typeof spec.parseBulkFnPath === 'string'
    , "A processor must define either a parseFn or parseBulkFn parsing routine.");

    invariant(typeof spec.reduceFnPath === 'string',
      "A processor must define a reducing routine found in 'reduceFnPath'."
    );

    done(null, {
      id,
      decorators: decorators
        .map(getConfigurablePair)
        .map(R.partial(createDecorator, [{
          compilerOptions,
          compilationId: id,
        }]))
      ,
      decorations: null,
      documents: null,
      files,
      compilerOptions,
      linter,
      processor: paths,
      processorOptions: configure(processorEntry.options || {}),
      rawDocuments: null,
      refinedDocuments: null,
      renderOperations: null,
      renderedTree: null,
      serializerOptions: spec.serializerOptions || {},
      // this is needed by some processors like markdown during refinement in
      // order to calculate a common prefix
      sourcePatterns: source.include,
      stats: {},
      tags: listOf(source.tags || source.id),
      tree: null,
      treeOperations: null,
    });
  })
}

function createDecorator(configurationContext, decoratorEntry) {
  const spec = require(decoratorEntry.name);
  const userOptions = decoratorEntry.options;
  const { configureFn = R.identity } = spec;

  return {
    name: spec.name,
    spec,
    services: spec.services,
    options: configureFn(userOptions, configurationContext),
    metaKey: spec.metaKey,
    parseFnPath: spec.parseFnPath,
  }
}

function calculateMD5Sum(string) {
  return crypto.createHash('md5').update(string).digest("hex");
}

function extractPaths(spec) {
  return {
    initFnPath: spec.initFnPath,
    configureFnPath: spec.configureFnPath || blankProcessor.configureFnPath,
    parseFnPath: spec.parseFnPath,
    parseBulkFnPath: spec.parseBulkFnPath,
    reduceFnPath: spec.reduceFnPath,
    reduceTreeFnPath: spec.reduceTreeFnPath || blankProcessor.reduceTreeFnPath,
    refineFnPath: spec.refineFnPath || blankProcessor.refineFnPath,
    renderFnPath: spec.renderFnPath || blankProcessor.renderFnPath,
  }
}

function getSourceFiles({ assetRoot, changedSources, source }, done) {
  scanSources({
    include: source.include,
    exclude: source.exclude,
    rootDir: assetRoot
  }, function(err, files) {
    if (err) {
      done(err);
    }
    else {
      done(null, changedSources ?
        files.filter(x => changedSources.indexOf(x) > -1) :
        files
      );
    }
  });
}

function listOf(x) {
  return Array.isArray(x) ? x : [].concat(x || [])
}

module.exports = R.curry(createCompilation);