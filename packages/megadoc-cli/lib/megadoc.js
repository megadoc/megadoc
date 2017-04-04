#!/usr/bin/env node

var program = require('commander');
var fs = require('fs-extra');
var path = require('path');
var set = require('lodash').set;
var pkg = require('../package');
var megadocCompiler = require('megadoc-compiler');
var megadocDevServer = require('./DevServer');
var config = {};
var configFilePath;

function collect(val, list) {
  list.push(val);
  return list;
}

program
  .version(pkg.version)
  .description('Parse sources and generate static documentation.')
  .arguments('<CONFIG>')
  .option('--config [PATH]', 'path to megadoc config file (defaults to megadoc.conf.js)')
  .option('--no-scan', 'Skip the scanning phase.')
  .option('--no-index', 'Do not index documentation entities (for linking.)')
  .option('--no-render', 'Do not render markdown or resolve links.')
  .option('--no-write', 'Do not write any assets.')
  .option('--override <KEY=VALUE>', 'Override a config item.', collect, [])
  .option('--plugin <NAME>', 'Override the active plugin list.', collect, [])
  .option('--dump-config')
  .option('--dump-corpus <PATH>')
  .option('--layout <NAME>', 'Override the HTML layout to use ("single-page" or "multi-page")')
  .option('--log-level [LEVEL]', 'Logger level. Valid values: "info", "log", "warn", or "error"')
  .option('-w, --watch', 'Run in watch mode.')
  .option('-v, --verbose', 'Shortcut for --log-level="info"')
  .option('--debug', 'Run in DEBUG mode to print debugging messages.')
  .option('--stats', 'Show scanner-related statistics.')
  .option('--tmp-dir [PATH]', 'Path to a directory megadoc will use for intermediatery files. Defaults to .megadoc/')
  .option('--no-purge', 'Do not purge the output directory.')
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

if (!config.gitRepository) {
  config.gitRepository = path.resolve(config.assetRoot, '.git');
}

if (program.dumpConfig) {
  console.log('Config:\n', config);
}

if (program.verbose) {
  set(config, 'verbose', true);
}

program.override.forEach(function(override) {
  var fragments = override.split(/\s*=\s*/);
  var key = fragments[0];
  var value;

  try {
    value = JSON.parse(fragments[1]);
  }
  catch(e) {
    value = fragments[1].toString();
  }

  set(config, key, value);

  console.log('Overridden "%s" with "%s"', key, value);
});

if (program.plugin.length > 0) {
  console.log('Plugins:', JSON.stringify(program.plugin));

  var activePlugins = config.plugins.filter(function(plugin) {
    return program.plugin.indexOf(plugin.name) > -1;
  });

  if (activePlugins.length !== config.plugins.length) {
    console.log('%d plugins were excluded.', config.plugins.length - activePlugins.length);
    config.plugins = activePlugins;
  }
}

if (program.layout) {
  config.layout = program.layout;
}

if (program.debug === true) {
  config.debug = true;
}

console.log('version %s', pkg.version);

if (program.watch) {
  megadocDevServer.run(config);
}
else {
  megadocCompiler.run(config, function(err/*, compilations*/) {
    if (err) {
      console.error(Array(80 - 'megadoc-cli'.length).join('*'));
      console.error('An error occurred during compilation. Error details below.');
      console.error(err.stack ? err.stack : err);
      console.error(Array(80 - 'megadoc-cli'.length).join('*'));

      throw err;
    }

    console.log('done!');
  });
}