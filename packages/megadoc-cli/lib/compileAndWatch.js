const compiler = require('megadoc-compiler');
const chokidar = require('chokidar');
const R = require('ramda');
const ConfigUtils = require('megadoc-config-utils');

exports.run = function(config, runOptions, callback = null) {
  compiler.run(config, runOptions, function(err, state) {
    if (err && callback) {
      return callback(err);
    }
    else if (callback) {
      callback();
    }

    if (err) {
      throw err;
    }

    engage(config, runOptions, state)
  });
};

function engage(config, runOptions, initialState) {
  console.log('[I] Initial compilation done. Will now be watching for changes...');

  const watcher = new chokidar.FSWatcher({
    usePolling: true,
    ignorePermissionErrors: true,
    ignoreInitial: true,
    followSymlinks: false
  });

  let state = initialState;

  watcher
    .on('add', function() {
      console.log('[I] A source file has been added. Re-generating...');
    })
    .on('change', function(file) {
      console.log('[I] A source file has been modified. Re-generating...');

      recompile(config, runOptions, state, [ file ], function(err, nextState) {
        if (err) {
          throw err;
        }

        state = nextState;
        console.log('[I] Recompiled successfully. Watching for further changes...');
      })
    })
    .on('unlink', function() {
      console.log('[I] A source file has been deleted. Re-generating...');
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
    console.log('Bye!');
  });

  process.on('SIGINT', () => {
    console.log('SIGINT caught; terminating.');
    process.exit(0);
  });
}

function recompile(config, runOptions, initialState, changedSources, done) {
  compiler.run(config, R.merge(runOptions, {
    changedSources/*.map(linter.getRelativeFilePath)*/,
    initialState,
    purge: true,
  }), done);
}