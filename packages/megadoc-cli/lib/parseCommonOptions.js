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
  const runOptions = {}

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

  if (program.threads) {
    config.threads = Math.max(parseInt(program.threads, 10), 1)
  }

  if (program.concurrency) {
    config.concurrency = Math.max(parseInt(program.concurrency, 10), 1)
  }

  runOptions.breakpoint = asNumberOrNull(program.breakpoint);
  runOptions.excludedTags = [].concat(program.exclude || [])
  runOptions.includedTags = [].concat(program.only || [])
  runOptions.profile = program.profile;
  runOptions.purge = program.purge;

  return {
    config: R.merge(defaults, config),
    configFilePath,
    runOptions
  };
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