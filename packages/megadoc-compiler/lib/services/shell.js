const cp = require('child_process');
const { t } = require('megadoc-config-utils');
const invariant = require('invariant');
const defaults = {
  up: {
    args: [],
  },
  down: {
    signal: 'SIGINT'
  }
}

module.exports = function ShellService({ compilerOptions, timeout }, serviceSpec) {
  const { verbose } = compilerOptions;
  const { name } = serviceSpec;
  const { command, args, env } = Object.assign({}, defaults.up, serviceSpec.up);
  const { signal: killSignal } = Object.assign({}, defaults.down, serviceSpec.down);

  let subProcess = null;

  // TODO: move to validation phase
  invariant(typeof command === 'string',
    'shell service requires a command to spawn');

  invariant(typeof killSignal === 'string',
    'shell service down.signal must be a SIG* signal string');

  return {
    up(callback) {
      let timer;

      const failFromCommandError = (code) => {
        if (code !== 0) {
          timer = clearTimeout(timer);

          callback(new Error(`megadoc: service "${name}" exited abnormally with ${code}`))
          subProcess = null
        }
      };

      const failFromSpawnError = function(error) {
        timer = clearTimeout(timer);
        subProcess.removeListener('close', failFromCommandError);

        const decoratedError = new Error(`megadoc: service "${name}" failed to start: ${error.message}`)

        decoratedError.stack = error.stack;

        callback(error)
      };

      const failFromTimeout = function() {
        callback(new Error(`megadoc: service "${name}" is taking too long to start, something isn't right`));
      };

      if (verbose) {
        console.log(`megadoc: service "${name}": starting...`);
      }

      subProcess = cp.spawn(command, args.map(t(compilerOptions)), {
        detached: false,
        shell: false,
        cwd: compilerOptions.assetRoot,
        stdio: [ 'pipe', 'pipe', 'inherit' ],
        env: env,
      })

      subProcess.stdout.pause();
      subProcess.stdout.on('data', function(chunk) {
        // down() called before we got the chance to start:
        if (!subProcess) {
          return;
        }

        if (chunk.toString().match(/\bREADY\n/)) {
          if (verbose) {
            console.log(`megadoc: service "${name}": started`);
          }

          timer = clearTimeout(timer);
          subProcess.removeListener('error', failFromSpawnError);
          subProcess.removeListener('close', failFromCommandError);

          callback();
        }
      });

      subProcess.on('close', failFromCommandError);
      subProcess.on('error', failFromSpawnError);

      timer = setTimeout(failFromTimeout, timeout || 1000)

      subProcess.stdout.resume();
    },

    down(callback) {
      if (subProcess) {
        if (verbose) {
          console.log(`megadoc: service "${name}": stopping...`);
        }

        subProcess.stdin.end();
        subProcess.kill(killSignal);

        subProcess = null;
      }

      callback();
    }
  }
}