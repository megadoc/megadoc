const fs = require('fs-extra');
const async = require('async');
const partial = require('./utils/partial');
const ConfigUtils = require('megadoc-config-utils');
const defaults = require('./config');
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
const parseConfig = require('./parseConfig');
const BlankSerializer = require('./BlankSerializer');
const composeAsync = fns => async.compose.apply(async, fns);

function createSerializer(config) {
  const serializerSpec = ConfigUtils.getConfigurablePair(config.serializer);

  if (!serializerSpec) {
    return new BlankSerializer();
  }

  const Serializer = require(serializerSpec.name);

  return new Serializer(config, serializerSpec.options);
}

const BREAKPOINT_PARSE              = exports.BREAKPOINT_PARSE              = 1;
const BREAKPOINT_REFINE             = exports.BREAKPOINT_REFINE             = 2;
const BREAKPOINT_REDUCE             = exports.BREAKPOINT_REDUCE             = 3;
const BREAKPOINT_RENDER             = exports.BREAKPOINT_RENDER             = 4;
const BREAKPOINT_REDUCE_TREE        = exports.BREAKPOINT_REDUCE_TREE        = 5;
const BREAKPOINT_COMPOSE_TREE       = exports.BREAKPOINT_COMPOSE_TREE       = 6;
const BREAKPOINT_MERGE_CHANGE_TREE  = exports.BREAKPOINT_MERGE_CHANGE_TREE  = 7;
const BREAKPOINT_RENDER_CORPUS      = exports.BREAKPOINT_RENDER_CORPUS      = 8;
const BREAKPOINT_EMIT_ASSETS        = exports.BREAKPOINT_EMIT_ASSETS        = 9;

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
exports.run = function(userConfig, runOptions, done) {
  if (arguments.length === 2) {
    done = runOptions;
    runOptions = {};
  }

  const config = Object.assign({}, defaults, parseConfig(userConfig));
  const { tmpDir } = config;
  const commonOptions = config; // TODO
  const serializer = createSerializer(config);
  const compilations = config.sources.map(partial(createCompilation, commonOptions, runOptions));
  const defineBreakpoint = createBreakpoint({
    breakpoint: runOptions.breakpoint,
    exit: done
  });

  const compileTree = composeAsync([
    defineBreakpoint(BREAKPOINT_COMPOSE_TREE)
    (
      composeTree
    ),
    defineBreakpoint(BREAKPOINT_MERGE_CHANGE_TREE)
    (
      partial(
        mergeChangeTree, runOptions.initialState
      )
    ),
    defineBreakpoint(BREAKPOINT_REDUCE_TREE)
    (
      reduceTree
    ),
    defineBreakpoint(BREAKPOINT_RENDER)
    (
      partial(
        render, serializer.renderRoutines
      )
    ),
    defineBreakpoint(BREAKPOINT_REDUCE)
    (
      partial(
        reduce, serializer.reduceRoutines
      )
    ),
    defineBreakpoint(BREAKPOINT_REFINE)
    (
      refine
    ),
    defineBreakpoint(BREAKPOINT_PARSE)
    (
      parse
    ),
    initState,
  ]);

  const compileTreesIntoCorpus = composeAsync([
    defineBreakpoint(BREAKPOINT_EMIT_ASSETS)
    (
      partial(emit, serializer)
    ),
    runOptions.purge ?
      partial(purge, serializer) :
      null
    ,
    defineBreakpoint(BREAKPOINT_RENDER_CORPUS)
    (
      partial(renderCorpus, serializer)
    )
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

function createBreakpoint({ breakpoint, exit }) {
  return function defineBreakpoint(stage) {
    const shouldBreak = breakpoint >= 0 && breakpoint <= stage || false;

    return function createBreakableFunction(fn) {
      return function maybeBreakOutOfFunction(x, callback) {
        if (shouldBreak) {
          exit(null, x);
        }
        else {
          fn(x, callback);
        }
      }
    }
  }
}
