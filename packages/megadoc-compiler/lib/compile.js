const async = require('async');
const boot = require('./boot');
const composeTree = require('./composeTree');
const createBreakpoint = require('./utils/createBreakpoint');
const createProfiler = require('./utils/createProfiler');
const emit = require('./emit');
const mergeTrees = require('./mergeTrees');
const parse = require('./parse');
const purge = require('./purge');
const R = require('ramda');
const reduce = require('./reduce');
const reduceTree = require('./reduceTree');
const refine = require('./refine');
const render = require('./render');
const seal = require('./seal');
const teardown = require('./teardown');
const { assocWith, asyncify, asyncSequence, nativeAssoc } = require('./utils');

const {
  BREAKPOINT_COMPILE,
  BREAKPOINT_PARSE,
  BREAKPOINT_MERGE_CHANGE_TREE,
  BREAKPOINT_REFINE,
  BREAKPOINT_REDUCE,
  BREAKPOINT_RENDER,
  BREAKPOINT_REDUCE_TREE,
  BREAKPOINT_COMPOSE_TREE,
  BREAKPOINT_RENDER_CORPUS,
  BREAKPOINT_EMIT_ASSETS,
} = require('./breakpoints');
const { BreakpointError } = createBreakpoint;

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
module.exports = function compile(userConfig, runOptions, done) {
  if (arguments.length === 2) {
    return compile(userConfig, {}, runOptions);
  }

  const profile = { benchmarks: [] };
  const defineBreakpoint = createBreakpoint(runOptions.breakpoint, runOptions.tap);
  const instrument = createProfiler({
    enabled: !!runOptions.profile,
    writeFn: x => profile.benchmarks.push(x)
  });

  const bootCompileAndEmit = asyncSequence([
    instrument.async('boot')
    (
      boot(instrument)
    ),

    instrument.async('compile')
    (
      defineBreakpoint(BREAKPOINT_COMPILE)
      (
        R.partial(compileTrees, [ instrument, defineBreakpoint ])
      )
    ),

    instrument.async('emit')
    (
      R.partial(sealPurgeAndEmit, [ instrument, defineBreakpoint ])
    ),

    instrument.async('teardown')
    (
      teardown
    )
  ])

  instrument.async('total')(bootCompileAndEmit)({
    userConfig,
    runOptions,
  }, (err, state) => {
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
  });
}

function compileTrees(instrument, defineBreakpoint, state, done) {
  const { runOptions, serializer, compilations } = state;
  const prevCompilations = R.pathOr([], ['initialState', 'compilations'], runOptions)
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
      done(null, nativeAssoc('compilations', withTrees, state))
    }
  });
}

function sealPurgeAndEmit(instrument, defineBreakpoint, state, done) {
  const { compilations, runOptions, serializer } = state;

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
  ])(compilations, function(err, emitted) {
    if (err) {
      done(err);
    }
    else {
      done(null, Object.assign({}, state, emitted));
    }
  });
}
