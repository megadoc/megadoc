const fs = require('fs-extra');
const async = require('async');
const partial = require('./utils/partial');
const ConfigUtils = require('megadoc-config-utils');

const Compiler = exports;

const createCompilation = require('./stage00__createCompilation');
const initState = require('./stage00__initState');
const parse = require('./stage01__parse');
const reduce = require('./stage01__reduce');
const refine = require('./stage01__refine');
const render = require('./stage01__render');
const reduceTree = require('./stage02__reduceTree');
const mergeChangeTree = require('./stage03__mergeChangeTree');
const composeTree = require('./stage03__composeTree');
const renderCorpus = require('./stage04__renderCorpus');
const purge = require('./stage05__purge');
const emit = require('./stage05__emit');

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
Compiler.run = function(config, runOptions, done) {
  if (arguments.length === 2) {
    done = runOptions;
    runOptions = {};
  }

  const tmpDir = config.tmpDir;
  const commonOptions = config; // TODO
  const serializerSpec = ConfigUtils.getConfigurablePair(config.serializer) || {
    name: 'megadoc-html-serializer'
  };
  const Serializer = require(serializerSpec.name);
  const serializer = new Serializer(config, serializerSpec.options);
  const compilations = config.sources.map(partial(createCompilation, commonOptions, runOptions));

  const compileTree = async.compose(
    composeTree,
    partial(mergeChangeTree, runOptions.initialState),
    reduceTree,
    partial(render, serializer.renderRoutines),
    refine,
    reduce,
    parse,
    initState
  );

  const compileTreesIntoCorpus = async.compose.apply(async, [
    partial(emit, serializer),
    runOptions.purge ? partial(purge, serializer) : null,
    partial(renderCorpus, serializer)
  ].filter(x => x !== null));

  async.series([
    function setup(callback) {
      // todo: cluster
      serializer.start(compilations, callback);
      fs.ensureDirSync(tmpDir);
    },

    function work(callback) {
      async.map(compilations, compileTree, function(err, withTrees) {
        if (err) {
          callback(err);
        }
        else {
          compileTreesIntoCorpus(withTrees, callback);
        }
      });
    },

    function cleanup(callback) {
      fs.removeSync(tmpDir);

      serializer.stop(callback);
    },
  ], function(err, results) {
    if (err) {
      try {
        serializer.stop(Function.prototype);
      }
      catch (_err) {
        //
      }
      finally {
        done(err);
      }
    }
    else {
      done(null, results[1]);
    }
  });
};
