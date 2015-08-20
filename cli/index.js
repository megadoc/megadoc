#!/usr/bin/env node

var program = require('commander');
var fs = require('fs-extra');
var path = require('path');
var deep = require('deep-get-set');
var pkg = require('../package');
var tinydoc = require('..');
var Logger = require('../lib/Logger');
var console = new Logger('tinydoc-cli');
var config = {};
var tiny, configFilePath;

function collect(val, override) {
  override.push(val);
  return override;
}

program
  .version(pkg.version)
  .option('--config [PATH]', 'path to tinydoc config file (defaults to tinydoc.conf.js)')
  .option('--no-scan', 'Skip the scanning phase.')
  .option('--no-write', 'Do not write any assets.')
  .option('--override <KEY=VALUE>', 'Override a config item.', collect, [])
  .option('--dump-config')
  .option('--verbose')
  .option('--debug')
  .parse(process.argv)
;

configFilePath = program.config || 'tinydoc.conf.js';

if (fs.existsSync(configFilePath)) {
  config = require(path.resolve(configFilePath));
  config.assetRoot = config.assetRoot || path.resolve(path.dirname(configFilePath));
}
else {
  throw new Error("You must specify a config file using --config.");
}

if (!config.gitRepository) {
  config.gitRepository = path.resolve(config.assetRoot, '.git');
}

if (program.dumpConfig) {
  console.log('Config:\n', config);
}

if (program.verbose) {
  Logger.setVerbose(true);
}

if (program.debug) {
  Logger.setDebug(true);
}

program.override.forEach(function(override) {
  var fragments = override.split('=');
  var key = fragments[0];
  var value = JSON.parse(fragments[1]);

  deep(config, key, value);

  console.log('Overridden "%s" with "%s"', key, value);
});

tiny = tinydoc(config, {
  scan: program.scan !== false,
  write: program.write !== false
});

tiny.run(function(err) {
  if (err) {
    console.error(Array(80 - 'tinydoc-cli'.length).join('*'));
    console.error('An error occurred during compilation. Error details below.');
    console.error(err.stack ? err.stack : err);
    console.error(Array(80 - 'tinydoc-cli'.length).join('*'));

    throw err;
  }

  console.log('done!');
});