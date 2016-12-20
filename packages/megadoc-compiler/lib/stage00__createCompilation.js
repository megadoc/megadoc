const invariant = require('invariant');
const scanSources = require('./utils/scanSources');

// TODO: extract decorators
module.exports = function createCompilation(commonOptions, source) {
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
