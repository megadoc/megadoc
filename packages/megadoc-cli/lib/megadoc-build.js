#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package');
const { run: compile } = require('megadoc-compiler');
const { run: compileAndWatch } = require('./compileAndWatch');
const printProfile = require('./printProfile');
const parseCommonOptions = require('./parseCommonOptions');

program
  .version(pkg.version)
  .description('Generate static documentation.')
  .option('-c, --config [PATH]', 'path to megadoc config file', 'megadoc.conf.js')
  .option('--breakpoint [BREAKPOINT]', 'Debugging breakpoint')
  .option('--profile')
  .option('--dump-config')
  .option('--dump-corpus <PATH>')
  .option('--log-level [LEVEL]', 'Logger level. Valid values: "info", "log", "warn", or "error"')
  .option('-w, --watch', 'Run in watch mode.')
  .option('-v, --verbose', 'Shortcut for --log-level="info"')
  .option('--debug', 'Run in DEBUG mode to print debugging messages.')
  .option('--stats', 'Show scanner-related statistics.')
  .option('--tmp-dir [PATH]', 'Path to a directory megadoc will use for intermediatery files. Defaults to .megadoc/')
  .option('--output-dir [PATH]')
  .option('--no-purge', 'Do not purge the output directory.')
  .option('-j, --threads [COUNT]', 'Number of threads to use for processing (1 indicates foreground.)')
  .parse(process.argv)
;

const config = parseCommonOptions(program);

if (program.dumpConfig) {
  console.log('Config:\n', config);
}

console.log('megadoc: version "%s".', pkg.version);

const runOptions = {
  purge: program.purge,
  profile: program.profile,
  breakpoint: asNumberOrNull(program.breakpoint),
};

if (program.watch) {
  compileAndWatch(config, runOptions);
}
else {
  const startedAt = new Date()

  compile(config, runOptions, function(err, result) {
    if (err) {
      console.error(Array(80 - 'megadoc-cli'.length).join('*'));
      console.error('An error occurred during compilation. Error details below.');
      console.error(err.stack ? err.stack : err);
      console.error(Array(80 - 'megadoc-cli'.length).join('*'));

      throw err;
    }

    if (runOptions.profile) {
      printProfile(result.profile)
    }

    const elapsed = (new Date() - startedAt) / 1000
    console.log(`Done: ${elapsed}s.`);
  });
}

function asNumberOrNull(x) {
  const asNumber = parseInt(x, 10);

  if (isNaN(asNumber)) {
    return null;
  }
  else {
    return asNumber
  }
}