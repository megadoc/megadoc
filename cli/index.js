#!/usr/bin/env node

var program = require('commander');
var fs = require('fs-extra');
var path = require('path');
var pkg = require('../package');
var tinydoc = require('..');
var console = new require('../lib/Logger')('tinydoc-cli');
var config = {};
var tiny, configFilePath;

program
  .version(pkg.version)
  .option('--source [DIR]', 'directory to scan for JS source files')
  .option('--exclude [VALUE]', 'pattern to exclude files with')
  .option('--output [VALUE]', 'path to output file')
  .option('--config [PATH]', 'path to tinydoc config file (defaults to tinydoc.conf.js)')
  .option('--dump-config')
  .option('--dump-database')
  .option('--pretty')
  .parse(process.argv)
;

configFilePath = program.config || 'tinydoc.conf.js';

if (fs.existsSync(configFilePath)) {
  config = require(path.resolve(configFilePath));
  config.root = path.resolve(path.dirname(configFilePath));
}
else {
  config.root = __dirname;
}

if (program.dumpConfig) {
  console.log('running with %s', JSON.stringify(config, null, 2));
}

if (program.output) {
  console.log('Database will be written to %s.', program.output);
  config.output = program.output;
}

tiny = tinydoc(config);
tiny.run(function(err, database) {
  if (err) {
    console.error(Array(80 - 'tinydoc-cli'.length).join('*'));
    console.error('An error occurred while scanning & generating assets. Error details below.');
    console.error(err.stack ? err.stack : err);
    console.error(Array(80 - 'tinydoc-cli'.length).join('*'));

    process.exit(1);
  }

  console.log('done!');

  if (program.dumpDatabase) {
    console.log(database);
  }

  if (config.output) {
    var filePath = tiny.utils.resolvePath(config.output);

    console.log('Writing database to %s.', filePath);

    fs.ensureFileSync(filePath);
    fs.writeFileSync(filePath,
      program.pretty ?
        JSON.stringify(database, null, 2) :
        JSON.stringify(database)
    );
  }
});