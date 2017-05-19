const invariant = require('invariant');
const crypto = require('crypto');
const scanSources = require('./utils/scanSources');
const ConfigUtils = require('megadoc-config-utils');
const { pick } = require('lodash');
const blankProcessor = require('./blankProcessor');

// TODO: extract decorators
module.exports = function createCompilation(optionWhitelist, state, source) {
  const { config, runOptions } = state;
  const processorEntry = ConfigUtils.getConfigurablePair(source.processor);
  const files = getSourceFiles({ runOptions, source })
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
    compilerOptions: pick(config, optionWhitelist),
    processor: paths,
    processorOptions: configure(processorEntry.options || {}),
    serializerOptions: spec.serializerOptions || {},
    rawDocuments: null,
    refinedDocuments: null,
    renderOperations: null,
    renderedTree: null,
    stats: {},
    tree: null,
    treeOperations: null,
    logger: runOptions.logger,
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

function getSourceFiles({ runOptions, source }) {
  const files = scanSources(source.pattern, source.include, source.exclude);

  return runOptions.changedSources ?
    files.filter(x => runOptions.changedSources[x] === true) :
    files
  ;
}