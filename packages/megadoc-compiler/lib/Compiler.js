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
const createBreakpoint = require('./utils/createBreakpoint');
const truthy = x => !!x;
const asyncSequence = fns => async.seq.apply(async, fns.filter(truthy));
const { BreakpointError } = createBreakpoint;

const BREAKPOINT_PARSE              = exports.BREAKPOINT_PARSE              = 1;
const BREAKPOINT_REFINE             = exports.BREAKPOINT_REFINE             = 2;
const BREAKPOINT_REDUCE             = exports.BREAKPOINT_REDUCE             = 3;
const BREAKPOINT_RENDER             = exports.BREAKPOINT_RENDER             = 4;
const BREAKPOINT_REDUCE_TREE        = exports.BREAKPOINT_REDUCE_TREE        = 5;
const BREAKPOINT_COMPOSE_TREE       = exports.BREAKPOINT_COMPOSE_TREE       = 6;
const BREAKPOINT_MERGE_CHANGE_TREE  = exports.BREAKPOINT_MERGE_CHANGE_TREE  = 7;
const BREAKPOINT_RENDER_CORPUS      = exports.BREAKPOINT_RENDER_CORPUS      = 8;
const BREAKPOINT_EMIT_ASSETS        = exports.BREAKPOINT_EMIT_ASSETS        = 9;

const compile = asyncSequence([
  configure,
  createSerializer,
  partial(createCompilations, [
    'assetRoot',
    'outputDir',
    'tmpDir',
    'verbose',
    'strict',
    'debug',
  ]),
  startSerializer,
  compileSources,
  generateCorpus,
])

exports.run = function run(userConfig, runOptions, done) {
  if (arguments.length === 2) {
    return run(userConfig, {}, runOptions);
  }

  const teardownRoutines = [];

  compile({
    userConfig,
    runOptions,
    registerTeardownRoutine(fn) {
      teardownRoutines.push(fn);
    }
  }, ensureTeardown(teardownRoutines, (err, result) => {
    if (err instanceof BreakpointError) {
      done(null, err.result);
    }
    else {
      done(err, result);
    }
  }));
}

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
function compileSources(state, done) {
  const { runOptions, serializer, compilations } = state;
  const defineBreakpoint = createBreakpoint(runOptions.breakpoint);

  const compileTree = asyncSequence([
    initState,

    defineBreakpoint(BREAKPOINT_PARSE)
    (
      parse
    ),

    defineBreakpoint(BREAKPOINT_REFINE)
    (
      refine
    ),

    defineBreakpoint(BREAKPOINT_REDUCE)
    (
      partial(
        reduce, serializer.reduceRoutines
      )
    ),

    defineBreakpoint(BREAKPOINT_RENDER)
    (
      partial(
        render, serializer.renderRoutines
      )
    ),

    defineBreakpoint(BREAKPOINT_REDUCE_TREE)
    (
      reduceTree
    ),

    defineBreakpoint(BREAKPOINT_MERGE_CHANGE_TREE)
    (
      partial(
        mergeChangeTree, runOptions.initialState
      )
    ),

    defineBreakpoint(BREAKPOINT_COMPOSE_TREE)
    (
      composeTree
    ),
  ]);

  async.map(compilations, compileTree, function(err, withTrees) {
    if (err) {
      done(err);
    }
    else {
      done(null, Object.assign({}, state, { withTrees }))
    }
  });
}

function generateCorpus(state, done) {
  const { withTrees, runOptions, serializer } = state;
  const defineBreakpoint = createBreakpoint(runOptions.breakpoint);

  asyncSequence([
    defineBreakpoint(BREAKPOINT_RENDER_CORPUS)
    (
      partial(renderCorpus, serializer)
    ),

    runOptions.purge && partial(purge, serializer) || null,

    defineBreakpoint(BREAKPOINT_EMIT_ASSETS)
    (
      partial(emit, serializer)
    ),
  ])(withTrees, done);
}

function configure(state, done) {
  const { userConfig } = state;
  const config = Object.assign({}, defaults, parseConfig(userConfig));

  done(null, Object.assign({}, state, { config }))
}

function createSerializer(state, done) {
  const { config } = state;
  const serializerSpec = ConfigUtils.getConfigurablePair(config.serializer);
  let serializer;

  if (!serializerSpec) {
    serializer = new BlankSerializer()
  }
  else {
    const Serializer = require(serializerSpec.name);
    serializer = new Serializer(config, serializerSpec.options);
  }

  done(null, Object.assign({}, state, {
    serializer
  }));
}

function createCompilations(optionWhitelist, state, done) {
  const compilations = state.config.sources.map(partial(createCompilation, optionWhitelist, state));

  done(null, Object.assign({}, state, { compilations }));
}

function startSerializer(state, done) {
  const { serializer, compilations } = state;

  fs.ensureDirSync(state.config.tmpDir);
  state.registerTeardownRoutine(partial(fs.remove, state.config.tmpDir));

  // todo: cluster
  serializer.start(compilations, function(err) {
    if (err) {
      done(err);
    }
    else {
      state.registerTeardownRoutine(serializer.stop.bind(serializer))

      done(null, state);
    }
  });
}

function ensureTeardown(fns, done) {
  return function(err, result) {
    async.parallel(fns.map(x => async.reflect(x)), function() {
      done(err, result);
    });
  }
}