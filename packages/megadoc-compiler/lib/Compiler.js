const fs = require('fs-extra');
const async = require('async');
const R = require('ramda');
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
const createProfiler = require('./utils/createProfiler');
const Linter = require('megadoc-linter');
const { assocWith, mergeWith, nativeAssoc } = require('./utils');
const asyncSequence = fns => async.seq.apply(async, fns.filter(x => !!x));
const { BreakpointError } = createBreakpoint;
const { asyncify } = async;
const divisus = require('divisus');

const BREAKPOINT_COMPILE            = exports.BREAKPOINT_COMPILE            = 1;
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
  const profile = { benchmarks: [] };
  const defineBreakpoint = createBreakpoint(runOptions.breakpoint, runOptions.tap);
  const instrument = createProfiler({
    enabled: !!runOptions.profile,
    writeFn: x => profile.benchmarks.push(x)
  });

  const compile = asyncSequence([
    asyncify
    (
      mergeWith({ instrument })
    ),

    instrument.async('boot:parse-config')
    (
      asyncify(
        assocWith
        (
          'config'
        )
        (
          R.compose(mergeWith(defaults), parseConfig, R.prop('userConfig'))
        )
      )
    ),

    instrument.async('boot:create-serializer')
    (
      createSerializer
    ),

    instrument.async('boot:create-linter')
    (
      createLinter
    ),

    instrument.async('boot:create-compilations')
    (
      asyncify
      (
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
      )
    ),

    instrument.async('boot:start-serializer')
    (
      startSerializer
    ),

    instrument.async('boot:start-cluster')
    (
      startCluster
    ),

    instrument.async('compile')
    (
      defineBreakpoint(BREAKPOINT_COMPILE)
      (
        compileTrees
      )
    ),

    instrument.async('emit')
    (
      sealPurgeAndEmit
    )
  ])

  instrument.async('total')(compile)({
    userConfig,
    runOptions,
    registerTeardownRoutine(fn) {
      teardownRoutines.push(fn);
    }
  }, ensureTeardown(teardownRoutines, (err, state) => {
    if (err instanceof BreakpointError) {
      done(null, err.result);
    }
    else if (err) {
      done(err);
    }
    else if (runOptions.profile) {
      done(null, R.merge({ profile }, state));
    }
    else {
      done(null, state);
    }
  }));
}

function compileTrees(state, done) {
  const { runOptions, serializer, compilations, instrument } = state;
  const defineBreakpoint = createBreakpoint(runOptions.breakpoint, runOptions.tap);
  const prevCompilations = R.pathOr([], ['initialState', 'compilations'], runOptions)
  const findPrevCompilation = compilation => prevCompilations.filter(x => x.id === compilation.id)

  const scopeMessage = message => x => `${message} [${x.id}]`
  const compileTree = asyncSequence([
    instrument.async(scopeMessage('compile:parse'))
    (
      defineBreakpoint(BREAKPOINT_PARSE)
      (
        R.partial(parse, [ state.cluster ])
      )
    ),

    instrument.async(scopeMessage('compile:refine'))
    (
      defineBreakpoint(BREAKPOINT_REFINE)
      (
        refine
      )
    ),

    instrument.async(scopeMessage('compile:reduce'))
    (
      defineBreakpoint(BREAKPOINT_REDUCE)
      (
        reduce
      )
    ),

    instrument.async(scopeMessage('compile:render'))
    (
      defineBreakpoint(BREAKPOINT_RENDER)
      (
        R.partial(render, [ serializer.renderRoutines ])
      )
    ),

    instrument.async(scopeMessage('compile:reduce-tree'))
    (
      defineBreakpoint(BREAKPOINT_REDUCE_TREE)
      (
        reduceTree
      )
    ),

    instrument.async(scopeMessage('compile:merge-change-tree'))
    (
      defineBreakpoint(BREAKPOINT_MERGE_CHANGE_TREE)
      (
        asyncify
        (
          compilation =>
          (
            // findPrevCompilation(compilation).length > 0 ?
            //   R.merge(
            //     findPrevCompilation(compilation)[0],
            //     mergeTrees(findPrevCompilation(compilation)[0], compilation)
            //   ) :
            //   compilation
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
      )
    ),

    instrument.async(scopeMessage('compile:compose-tree'))
    (
      defineBreakpoint(BREAKPOINT_COMPOSE_TREE)
      (
        asyncify
        (
          assocWith('tree', composeTree)
        )
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

function sealPurgeAndEmit(state, done) {
  const { withTrees, runOptions, serializer, instrument } = state;
  const defineBreakpoint = createBreakpoint(runOptions.breakpoint, runOptions.tap);

  asyncSequence([
    instrument.async('emit:seal')
    (
      defineBreakpoint(BREAKPOINT_RENDER_CORPUS)
      (
        R.partial(seal, [ serializer ])
      )
    ),

    runOptions.purge &&
    (
      instrument.async('emit:purge')
      (
        R.partial(purge, [ serializer ])
      )
    ) || null,

    instrument.async('emit:write-assets')
    (
      defineBreakpoint(BREAKPOINT_EMIT_ASSETS)
      (
        R.partial(emit, [ serializer ])
      )
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

function createLinter(state, done) {
  const { config } = state;

  done(null, Object.assign({}, state, { linter: Linter.for(config) }));
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

  // sadness :(
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

function startCluster(state, done) {
  const createCluster = state.config.threads === 1 ?
    divisus.createForegroundCluster :
    divisus.createCluster
  ;

  const cluster = createCluster({ size: state.config.threads })

  cluster.start(function(err) {
    if (err) {
      done(err);
    }
    else {
      state.registerTeardownRoutine(function(callback) {
        cluster.stop(function(e) {
          callback(e);
        });
      });

      done(null, Object.assign(state, { cluster }));
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
