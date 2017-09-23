const invariant = require('invariant');
const crypto = require('crypto');
const scanSources = require('./utils/scanSources');
const ConfigUtils = require('megadoc-config-utils');
const { pick } = require('ramda');
const blankProcessor = require('./blankProcessor');

// TODO: extract decorators
module.exports = function createCompilation(optionWhitelist, state, source) {
  const { config, linter, runOptions } = state;
  const processorEntry = ConfigUtils.getConfigurablePair(source.processor);
  const files = getSourceFiles({ assetRoot: config.assetRoot, runOptions, source })
  const spec = require(processorEntry.name);
  const paths = extractPaths(spec);
  const configure = require(paths.configureFnPath);

  const id = source.id || calculateMD5Sum(JSON.stringify(source));

  invariant(
    typeof spec.parseFnPath === 'string' ||
    typeof spec.parseBulkFnPath === 'string'
  , "A processor must define either a parseFn or parseBulkFn parsing routine.");

  invariant(typeof spec.reduceFnPath === 'string',
    "A processor must define a reducing routine found in 'reduceFnPath'."
  );

  return {
    id,
    documents: null,
    files,
    compilerOptions: pick(optionWhitelist, config),
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
    tree: null,
    treeOperations: null,
  };
};

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

function getSourceFiles({ assetRoot, runOptions, source }) {
  const files = scanSources(source.pattern, source.include, source.exclude, assetRoot);

  return runOptions.changedSources ?
    files.filter(x => runOptions.changedSources.indexOf(x) > -1) :
    files
  ;
}