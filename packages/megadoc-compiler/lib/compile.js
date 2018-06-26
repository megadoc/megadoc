const async = require('async');
const BlankSerializer = require('./BlankSerializer');
const composeTree = require('./composeTree');
const ConfigUtils = require('megadoc-config-utils');
const createBreakpoint = require('./utils/createBreakpoint');
const createCompilation = require('./createCompilation');
const createProfiler = require('./utils/createProfiler');
const defaults = require('./config');
const divisus = require('divisus');
const emit = require('./emit');
const fs = require('fs-extra');
const Linter = require('megadoc-linter');
const mergeTrees = require('./mergeTrees');
const os = require('os');
const parse = require('./parse');
const parseConfig = require('./parseConfig');
const path = require('path');
const purge = require('./purge');
const R = require('ramda');
const reduce = require('./reduce');
const reduceTree = require('./reduceTree');
const refine = require('./refine');
const render = require('./render');
const seal = require('./seal');
const Service = require('./Service');
const { asyncify, asyncEnsure, asyncSequence } = require('./utils');
const { tty } = require('megadoc-linter');
const {
  BREAKPOINT_COMPILE,
  BREAKPOINT_PARSE,
  BREAKPOINT_MERGE_CHANGE_TREE,
  BREAKPOINT_REFINE,
  BREAKPOINT_REDUCE,
  BREAKPOINT_RENDER,
  BREAKPOINT_REDUCE_TREE,
  BREAKPOINT_COMPOSE_TREE,
  BREAKPOINT_SEAL,
  BREAKPOINT_EMIT_ASSETS,
} = require('./breakpoints');

const { BreakpointError } = createBreakpoint;

// -----------------------------------------------------------------------------
// COMPILATION PHASES
// -----------------------------------------------------------------------------

const createCompiler = ({
  breakpoint,
  changedSources = null,
  initialState = null,
  profile = false,
  purge: purgeOption = true,
  includedTags = [],
  excludedTags = [],
  tap,
}) => {
  const profiles = [];
  const defineBreakpoint = createBreakpoint(breakpoint, tap);
  const instrument = createProfiler({
    enabled: !!profile,
    writeFn: x => { profiles.push(x) }
  });

  return {
    changedSources,
    defineBreakpoint,
    instrument,
    initialState,
    profiles,
    profile: !!profile,
    purge: purgeOption,
    excludedTags,
    includedTags,
  }
}

const boot = ({ changedSources, instrument, excludedTags, includedTags }) => asyncSequence([
  instrument.async('boot:parse-config')
  (
    asyncify(
      userConfig => ({
        config: Object.assign({}, defaults, parseConfig(userConfig))
      })
    )
  ),

  instrument.async('boot:create-temp-directory')
  (
    createTempDirectory
  ),

  instrument.async('boot:create-linter')
  (
    createLinter
  ),

  instrument.async('boot:create-compilations')
  (
    (state, callback) => async.map(
      state.config.sources,
      createCompilation({
        assetRoot: state.config.assetRoot,
        changedSources,
        compilerOptions: R.pick([
          'assetRoot',
          'debug',
          'lintRules',
          'outputDir',
          'tmpDir',
          'verbose',
        ], state.config),
        linter: state.linter,
      }),
      function(err, compilations) {
        if (err) {
          callback(err);
        }
        else {
          callback(null, Object.assign({}, state, {
            compilations: compilations.filter(compilation => {
              const containedIn = tagList => (
                R.intersection(tagList, compilation.tags).length > 0
              )

              if (excludedTags.length > 0 && containedIn(excludedTags)) {
                return false
              }
              else if (includedTags.length > 0 && !containedIn(includedTags)) {
                return false
              }
              else {
                return true
              }
            })
          }))
        }
      }
    )
  ),

  instrument.async('boot:create-serializer')
  (
    createSerializer
  ),
])

const start = ({ instrument }) => (state, done) => async.parallel([
  instrument.async('start:start-services')
  (
    R.partial(startServices, [state])
  ),

  instrument.async('start:start-serializer')
  (
    R.partial(startSerializer, [state])
  ),

  instrument.async('start:start-cluster')
  (
    R.partial(startCluster, [state])
  ),
], (err, partialStates) => {
  if (err) {
    done(err)
  }
  else {
    done(null, R.mergeAll([ state ].concat(R.unnest(partialStates))))
  }
})

const compile = compiler => (state, done) => {
  const { defineBreakpoint, instrument } = compiler;
  const { serializer, compilations } = state;
  const prevCompilations = R.pathOr([], ['initialState', 'compilations'], compiler)
  const findPrevCompilation = compilation => prevCompilations.filter(x => x.id === compilation.id)

  const scopeMessage = message => x => `${message} [${x.id}]`
  const compileTree = asyncSequence([
    instrument.async(scopeMessage('compile:parse'))
    (
      defineBreakpoint(BREAKPOINT_PARSE)
      (
        R.partial(parse, [ state.cluster, state.config.concurrency, ])
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
        R.partial(reduce, [ serializer ])
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

    instrument.async(scopeMessage('compile:compose-tree'))
    (
      defineBreakpoint(BREAKPOINT_COMPOSE_TREE)
      (
        asyncify
        (
          reducedState => Object.assign({}, reducedState, {
            tree: composeTree(reducedState)
          })
        )
      )
    ),
  ]);

  async.map(compilations, compileTree, function(err, withTrees) {
    if (err) {
      done(err);
    }
    else {
      done(null, Object.assign({}, state, { compilations: withTrees }))
    }
  });
}

const sealPurgeAndEmit = compiler => (state, done) => {
  const { defineBreakpoint, instrument } = compiler;
  const { compilations, serializer } = state;

  asyncSequence([
    instrument.async('seal')
    (
      defineBreakpoint(BREAKPOINT_SEAL)
      (
        R.partial(seal, [ serializer ])
      )
    ),

    compiler.purge &&
    (
      instrument.async('purge')
      (
        R.partial(purge, [ serializer ])
      )
    ) || null,

    instrument.async('emit')
    (
      defineBreakpoint(BREAKPOINT_EMIT_ASSETS)
      (
        R.partial(emit, [ serializer ])
      )
    ),
  ])(compilations, (err, sealedState) => {
    if (err) {
      done(err);
    }
    else {
      done(null, Object.assign({}, state, sealedState));
    }
  });
};

const stop = () => (state, done) => async.applyEach([
  removeTempDirectory,
  stopSerializer,
  stopCluster,
  stopServices,
].map(async.reflect), state, (error, results) => {
  const failures = results.filter(R.prop('error')).map(R.prop('error'))

  if (failures.length) {
    const serializeError = e => `
      ${tty.pad(4, e.stack)}
    `.trim();

    const combinedError = new Error(tty.nws(`
      Unable to terminate cleanly:

      ${failures.map(serializeError)}
    `));

    done(combinedError, state);
  }
  else {
    done(null, state);
  }
});

// -----------------------------------------------------------------------------
// COMPILATION MODULES
// -----------------------------------------------------------------------------

function createSerializer(state, done) {
  const { config } = state;
  const serializerSpec = ConfigUtils.getConfigurablePair(config.serializer);
  let serializer;

  if (!serializerSpec) {
    serializer = new BlankSerializer()
  }
  else {
    const serializerModule = require(serializerSpec.name);
    const factory = serializerModule.factory || serializerModule;

    serializer = new factory(config, serializerSpec.options);
  }

  done(null, Object.assign({}, state, { serializer }));
}

function createLinter(state, done) {
  const { config } = state;

  done(null, Object.assign({}, state, { linter: Linter.for(config) }));
}

function startSerializer(state, done) {
  const { serializer, compilations } = state;

  // todo: cluster
  serializer.start(compilations, function(err) {
    if (err) {
      done(err);
    }
    else {
      done(null, { serializer });
    }
  });
}

function stopSerializer(state, done) {
  state.serializer.stop(done);
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
      done(null, { cluster });
    }
  });
}

function stopCluster(state, done) {
  state.cluster.stop(done);
}

function startServices(state, done) {
  const services = Service.start(Service.DefaultPreset, state);

  services.up(function(err) {
    done(err, { services });
  });
}

function stopServices(state, done) {
  state.services.down(done);
}

function createTempDirectory(state, done) {
  const tmpDir = state.config.tmpDir;

  if (tmpDir) {
    fs.ensureDir(tmpDir, function(err) {
      if (err) {
        done(err);
      }
      else {
        done(null, state);
      }
    });
  }
  else {
    fs.mkdtemp(path.join(os.tmpdir(), `megadoc-`), function(err, folder) {
      if (err) {
        done(err);
      }
      else {
        done(null, Object.assign({}, state, {
          config: Object.assign({}, state.config, {
            tmpDir: folder
          })
        }))
      }
    });
  }
}

function removeTempDirectory(state, done) {
  fs.remove(state.config.tmpDir, done);
}

const compileAndEmit = compiler => asyncSequence([
  compiler.instrument.async('compile')
  (
    compiler.defineBreakpoint(BREAKPOINT_COMPILE)
    (
      compile(compiler)
    )
  ),

  compiler.instrument.async('seal-purge-emit')
  (
    sealPurgeAndEmit(compiler)
  ),
])

// -----------------------------------------------------------------------------
// PUBLIC EXPORTS
// -----------------------------------------------------------------------------

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
exports.run = function(userConfig, runOptions, done) {
  const compiler = createCompiler(runOptions);
  const bootStartCompileEmitAndStop = asyncSequence([
    compiler.instrument.async('boot')
    (
      boot(compiler)
    ),

    compiler.instrument.async('start')
    (
      start(compiler)
    ),

    asyncEnsure(stop(compiler))
    (
      compileAndEmit(compiler)
    ),
  ])

  compiler.instrument.async('total')(bootStartCompileEmitAndStop)(userConfig, (err, state) => {
    if (err instanceof BreakpointError) {
      done(null, err.result);
    }
    else if (err) {
      done(err);
    }
    else if (compiler.profile) {
      done(null, R.merge({
        profile: {
          benchmarks: compiler.profiles
        }
      }, state));
    }
    else {
      done(null, state);
    }
  });
};

exports.create  = createCompiler;
exports.boot    = boot;
exports.start   = start;
exports.compile = compile;
exports.compileAndEmit = compileAndEmit
exports.emit    = sealPurgeAndEmit;
exports.stop    = stop;
exports.utils = { asyncEnsure };