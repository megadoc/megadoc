const fs = require('fs-extra');
const async = require('async');
const ConfigUtils = require('megadoc-config-utils');
const defaults = require('./config');
const createCompilation = require('./stage00__createCompilation');
const parse = require('./stage01__parse');
const reduce = require('./stage01__reduce');
const refine = require('./stage01__refine');
const render = require('./stage01__render');
const reduceTree = require('./stage02__reduceTree');
const mergeTrees = require('./mergeTrees');
const composeTree = require('./stage03__composeTree');
const seal = require('./stage04__seal');
const purge = require('./stage05__purge');
const emit = require('./stage05__emit');
const parseConfig = require('./parseConfig');
const BlankSerializer = require('./BlankSerializer');
const createBreakpoint = require('./utils/createBreakpoint');
const R = require('ramda');
const asyncSequence = fns => async.seq.apply(async, fns.filter(x => !!x));
const { BreakpointError } = createBreakpoint;
const { asyncify } = async;

// String -> a -> {k: v} -> {k: v}
const nativeAssoc = R.curry(function nativeAssoc(propName, propValue, x) {
  return Object.assign({}, x, { [propName]: propValue });
});

// String -> {k: v} -> ???
const assocWith = R.curry(function assocWith(propName, x) {
  return R.over
  (
    R.lens(R.identity, nativeAssoc(propName))
  )
  (
    x
  );
})

const mergeWith = R.curry (function mergeWith(source, x) {
  return Object.assign({}, source, x)
})

const BREAKPOINT_COMPILE            = exports.BREAKPOINT_COMPILE              = 1;
const BREAKPOINT_PARSE              = exports.BREAKPOINT_PARSE              = 2;
const BREAKPOINT_REFINE             = exports.BREAKPOINT_REFINE             = 3;
const BREAKPOINT_REDUCE             = exports.BREAKPOINT_REDUCE             = 4;
const BREAKPOINT_RENDER             = exports.BREAKPOINT_RENDER             = 5;
const BREAKPOINT_REDUCE_TREE        = exports.BREAKPOINT_REDUCE_TREE        = 6;
const BREAKPOINT_COMPOSE_TREE       = exports.BREAKPOINT_COMPOSE_TREE       = 7;
const BREAKPOINT_MERGE_CHANGE_TREE  = exports.BREAKPOINT_MERGE_CHANGE_TREE  = 8;
const BREAKPOINT_RENDER_CORPUS      = exports.BREAKPOINT_RENDER_CORPUS      = 9;
const BREAKPOINT_EMIT_ASSETS        = exports.BREAKPOINT_EMIT_ASSETS        = 10;

/**
 * @module Compiler
 *
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
exports.run = function run(userConfig, runOptions, done) {
  if (arguments.length === 2) {
    return run(userConfig, {}, runOptions);
  }

  const teardownRoutines = [];
  const defineBreakpoint = createBreakpoint(runOptions.breakpoint, runOptions.tap);

  const compile = asyncSequence([
    asyncify(
      assocWith
      (
        'config'
      )
      (
        R.compose(mergeWith(defaults), parseConfig, R.prop('userConfig'))
      )
    ),
    createSerializer,
    asyncify(
      assocWith
      (
        'compilations'
      )
      (
        R.partial(createCompilations, [
          {
            optionWhitelist: [
              'assetRoot',
              'outputDir',
              'tmpDir',
              'verbose',
              'strict',
              'debug',
            ]
          }
        ])
      )
    ),
    startSerializer,
    defineBreakpoint(BREAKPOINT_COMPILE)
    (
      compileSources
    ),
    generateCorpus,
  ])

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

function compileSources(state, done) {
  const { runOptions, serializer, compilations } = state;
  const defineBreakpoint = createBreakpoint(runOptions.breakpoint, runOptions.tap);
  const prevCompilations = R.pathOr([], ['initialState', 'compilations'])(runOptions)
  const findPrevCompilation = compilation => prevCompilations.filter(x => x.id === compilation.id)

  const compileTree = asyncSequence([
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
      R.partial(reduce, [ serializer.reduceRoutines ])
    ),

    defineBreakpoint(BREAKPOINT_RENDER)
    (
      R.partial(render, [ serializer.renderRoutines ])
    ),

    defineBreakpoint(BREAKPOINT_REDUCE_TREE)
    (
      reduceTree
    ),

    defineBreakpoint(BREAKPOINT_MERGE_CHANGE_TREE)
    (
      asyncify
      (
        compilation =>
        (
          R.reduce
          (
            (aggregateCompilation, prevCompilation) =>
            (
              R.merge
              (
                aggregateCompilation
              )
              (
                mergeTrees(prevCompilation, aggregateCompilation)
              )
            )
          )
          (
            compilation
          )
          (
            findPrevCompilation(compilation)
          )
        )
      )
    ),

    defineBreakpoint(BREAKPOINT_COMPOSE_TREE)
    (
      asyncify
      (
        assocWith('tree', composeTree)
      )
    ),
  ]);

  async.map(compilations, compileTree, function(err, withTrees) {
    if (err) {
      done(err);
    }
    else {
      done(null, nativeAssoc('withTrees', withTrees, state))
    }
  });
}

function generateCorpus(state, done) {
  const { withTrees, runOptions, serializer } = state;
  const defineBreakpoint = createBreakpoint(runOptions.breakpoint, runOptions.tap);

  asyncSequence([
    defineBreakpoint(BREAKPOINT_RENDER_CORPUS)
    (
      R.partial(seal, [ serializer ])
    ),

    runOptions.purge && R.partial(purge, [ serializer ]) || null,

    defineBreakpoint(BREAKPOINT_EMIT_ASSETS)
    (
      R.partial(emit, [ serializer ])
    ),
  ])(withTrees, done);
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

  done(null, Object.assign({}, state, { serializer }));
}

function createCompilations({ optionWhitelist }, state) {
  const compilations = R.map
    (
      R.partial(createCompilation, [ optionWhitelist, state ])
    )
    (
      state.config.sources
    )
  ;

  return compilations;
}

function startSerializer(state, done) {
  const { serializer, compilations } = state;

  fs.ensureDirSync(state.config.tmpDir);
  state.registerTeardownRoutine(R.partial(fs.remove, [ state.config.tmpDir ]));

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
