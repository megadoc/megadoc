#!/usr/bin/env node

var program = require('commander');
var fs = require('fs-extra');
var path = require('path');
var set = require('lodash').set;
var pkg = require('../package');
var { run: compile } = require('megadoc-compiler');
var { run: compileAndWatch } = require('./compileAndWatch');
var printProfile = require('./printProfile');
var config = {};
var configFilePath;

program
  .version(pkg.version)
  .description('Parse sources and generate static documentation.')
  .arguments('<CONFIG>')
  .option('--config [PATH]', 'path to megadoc config file (defaults to megadoc.conf.js)')
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

configFilePath = program.config || program.args[0] || 'megadoc.conf.js';

if (fs.existsSync(configFilePath)) {
  config = require(path.resolve(configFilePath));
  config.assetRoot = config.assetRoot || path.resolve(path.dirname(configFilePath));
}
else {
  throw new Error("You must specify a config file using --config.");
}

config.tmpDir = path.join(config.assetRoot, '.megadoc');

if (program.outputDir) {
  config.outputDir = path.resolve(program.outputDir);
}

if (!config.gitRepository) {
  config.gitRepository = path.resolve(config.assetRoot, '.git');
}

if (program.dumpConfig) {
  console.log('Config:\n', config);
}

if (program.verbose) {
  set(config, 'verbose', true);
}

if (program.threads) {
  set(config, 'threads', Math.max(parseInt(program.threads, 10), 1))
}

if (program.debug === true) {
  config.debug = true;
}

console.log('Megadoc: version "%s".', pkg.version);

const runOptions = {
  purge: program.purge,
  profile: program.profile,
  breakpoint: asNumberOrNull(program.breakpoint),
};

if (program.watch) {
  compileAndWatch(config, runOptions);
}
else {
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

    console.log('OK!');
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