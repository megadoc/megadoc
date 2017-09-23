const fs = require('fs-extra');
const path = require('path');

module.exports = function parseCommonOptions(program) {
  let config;
  const configFilePath = program.config || program.args[0] || 'megadoc.conf.js';

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

  if (program.verbose) {
    config.verbose = true;
  }

  if (program.threads) {
    config.threads = Math.max(parseInt(program.threads, 10), 1)
  }

  if (program.debug === true) {
    config.debug = true;
  }

  return config;
}