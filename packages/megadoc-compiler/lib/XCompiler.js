const fs = require('fs-extra');
const async = require('async');
const scanSources = require('./utils/scanSources');

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
  const processingLists = config.sources.map(XCompiler.createProcessingList);

  fs.ensureDirSync(tmpDir);

  XCompiler.parse(config, processingLists, function(err) {
    fs.removeSync(tmpDir);

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

function inferProcessorMetaData(processorEntry) {
  const processorSpec = require(processorEntry.name);
  const processorOptions = processorEntry.options || {};

  return {
    atomic: typeof processorSpec.parseFnPath === 'string',
    bulk: !processorSpec.parseFnPath && typeof processorSpec.parseBulkFnPath === 'string',
    options: processorOptions,
    parseFnPath: processorSpec.parseFnPath,
    parseBulkFnPath: processorSpec.parseBulkFnPath
  };
}

// TODO: apply decorators
XCompiler.parse = function(config, processingLists, done) {
  async.map(processingLists, function(list, listCallback) {
    const { processor, files } = list;
    const options = {
      common: config,
      processor: processor.options
    };

    if (processor.atomic) {
      parseEach(options, files, processor.parseFnPath, listCallback);
    }
    else {
      parseBulk(options, files, processor.parseBulkFnPath, listCallback);
    }
  }, done);
}

// TODO: distribute
function parseEach(options, files, fnPath, done) {
  const fn = partial(require(fnPath), options);

  async.mapLimit(files, 10, fn, done);
}

// TODO: apply in background
function parseBulk(options, files, fnPath, done) {
  const fn = partial(require(fnPath), options);

  fn(files, done);
}


function partial(fn, x) {
  return fn.bind(null, x);
}