const fs = require('fs');
const path = require('path');
const { loadConfigFromFile } = require('megadoc-config-utils');
const { defaults } = require('megadoc-compiler');
const R = require('ramda');

module.exports = function parseCommonOptions(program) {
  const configFilePath = path.resolve(program.config);

  if (!fs.existsSync(configFilePath)) {
    throw new Error("You must specify a config file using --config.");
  }

  const config = loadConfigFromFile(configFilePath);

  if (program.outputDir) {
    config.outputDir = path.resolve(program.outputDir);
  }

  if (program.assetRoot) {
    config.assetRoot = path.resolve(program.assetRoot);
  }

  if (program.tmpDir) {
    config.tmpDir = path.resolve(program.tmpDir);
  }

  if (program.verbose) {
    config.verbose = true;
  }

  if (program.debug) {
    config.debug = true;
  }

  if (program.strict) {
    config.strict = true;
  }

  if (program.threads) {
    config.threads = Math.max(parseInt(program.threads, 10), 1)
  }

  return { config: R.merge(defaults, config), configFilePath };
}