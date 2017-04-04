/* eslint-disable */
const compiler = require('megadoc-compiler');
const chokidar = require('chokidar');
exports.run = function(config) {
  compiler.run(config, function(err, stats) {
    if (err) {
      throw err;
    }

    const watcher = new chokidar.FSWatcher({
      usePolling: true,
      ignorePermissionErrors: true,
      ignoreInitial: true,
      followSymlinks: false
    });

    let state = stats;

    watcher
      .on('add', function(file) {
        console.log('[I] A source file has been added. Re-generating...');
      })
      .on('change', function(file) {
        console.log('[I] A source file has been modified. Re-generating...');
        recompile(config, state, [ file ], function(err, nextStats) {
          if (err) {
            throw err;
          }

          state = nextStats;
          console.log('[I] Recompiled successfully. Watching for further changes...');
        })
      })
      .on('unlink', function(file) {
        console.log('[I] A source file has been deleted. Re-generating...');
      })
    ;

    const filePaths = Object.keys(stats.compilations.reduce((map, compilation) => {
      compilation.files.forEach(filePath => map[filePath] = true);

      return map;
    }, {}));

    watcher.add(filePaths);

    process.on('exit', function() {
      console.log('Cleaning up');
      watcher.close();
      console.log('Bye!');
    });

    process.on('SIGINT', () => {
      console.log('SIGINT caught; terminating.');
      process.exit(0);
    });
  });
};

function recompile(config, initialState, sources, done) {
  compiler.run(config, {
    changedSources: sources.reduce((map, x) => { map[x] = true; return map; }, {}),
    initialState,
    purge: true,
  }, function(err, nextState) {
    done(null, nextState); // todo: merge
  });
}