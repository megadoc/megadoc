const { Compiler: C } = require('megadoc-compiler');
const chokidar = require('chokidar');
const R = require('ramda');
const ConfigUtils = require('megadoc-config-utils');
const printProfile = require('./printProfile');

exports.run = function(config, runOptions, callback = null) {
  const compiler = C.create(R.merge(runOptions, { purge: true }));

  C.boot(compiler)(config, function(err, booted) {
    if (err) {
      return callback(err);
    }

    C.start(compiler)(booted, function(startErr, started) {
      if (startErr) {
        return callback(startErr);
      }

      C.compileAndEmit(compiler)(started, function(compileErr, compiled) {
        if (compileErr) {
          return C.stop(compiler)(started, function() {
            return callback(compileErr);
          });
        }

        callback();

        engage(config, runOptions, compiler, compiled);
      })
    });
  });
};

function engage(config, runOptions, initialCompiler, initialState) {
  console.log('[I] Initial compilation done. Will now be watching for changes...');

  const watcher = new chokidar.FSWatcher({
    usePolling: true,
    ignorePermissionErrors: true,
    ignoreInitial: true,
    followSymlinks: false
  });

  let compiler = initialCompiler;
  let state = initialState;

  const teardown = () => {
    C.stop(compiler)(state, function() {});
  };

  watcher
    .on('add', function() {
      console.log('[I] File added, re-generating...');
    })
    .on('change', function(file) {
      console.log('[I] File modified, re-generating...');

      const startedAt = new Date();
      const nextCompiler = C.create(R.merge(runOptions, {
        changedSources: [ file ],
        initialState: state,
        purge: true,
      }))

      C.compileAndEmit(nextCompiler)(state, function(err, nextState) {
        if (err) {
          throw err;
        }

        state = nextState;
        compiler = nextCompiler;

        maybePrintProfile(compiler)

        const elapsed = (new Date() - startedAt) / 1000;
        console.log(`[I] Done: ${elapsed}s.`);
      })
    })
    .on('unlink', function() {
      console.log('[I] File deleted, re-generating...');
    })
  ;

  const serializerSpec = ConfigUtils.getConfigurablePair(config.serializer) || { name: 'megadoc-html-serializer' };
  const serializerOptions = serializerSpec.options || {};
  const filePaths = R.uniq(R.flatten(state.compilations.map(R.prop('files'))))

  watcher.add(filePaths);

  if (serializerOptions.styleSheet) {
    watcher.add(serializerOptions.styleSheet);
  }

  process.on('exit', function() {
    console.log('Cleaning up');
    watcher.close();
    teardown();
    console.log('Bye!');
  });

  process.on('SIGINT', () => {
    console.log('SIGINT caught; terminating.');
    process.exit(0);
  });
}

function maybePrintProfile(compiler) {
  if (compiler.profile) {
    printProfile({
      benchmarks: compiler.profiles
    })
  }
}