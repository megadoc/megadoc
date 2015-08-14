#!/usr/bin/env node

var program = require('commander');
var fs = require('fs-extra');
var path = require('path');
var pkg = require('../package');
var tinydoc = require('..');
var console = require('../lib/Logger')('tinydoc-cli');
var config = {};
var tiny, configFilePath;

program
  .version(pkg.version)
  .option('--config [PATH]', 'path to tinydoc config file (defaults to tinydoc.conf.js)')
  .option('--no-scan', 'Skip the scanning phase.')
  .option('--no-write', 'Do not write any assets.')
  .option('--dump-config')
  .parse(process.argv)
;

configFilePath = program.config || 'tinydoc.conf.js';

if (fs.existsSync(configFilePath)) {
  config = require(path.resolve(configFilePath));
  config.assetRoot = path.resolve(path.dirname(configFilePath));
}
else {
  config.assetRoot = __dirname;
}

if (program.dumpConfig) {
  console.log('Config:\n', config);
}

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