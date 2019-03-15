const path = require('path');
const { getOptionsFromPair } = require('megadoc-config-utils');
const { CONFIG_FILE, STYLES_FILE } = require('../lib/constants');
const HTMLSerializer = require('../lib/HTMLSerializer');

function extractRuntimeParameters({ config }) {
  const serializer = new HTMLSerializer(config, getOptionsFromPair(config.serializer) || {});
  const { runtimeOutputPath } = serializer.config;
  const runtimeConfigFilePath = serializer.assetUtils.getOutputPath(runtimeOutputPath, CONFIG_FILE);
  const runtimeStylesFilePath = serializer.assetUtils.getOutputPath(runtimeOutputPath, STYLES_FILE);

  return {
    compilerConfig: config,
    contentBase: path.resolve(config.outputDir),
    runtimeConfig: require(runtimeConfigFilePath),
    runtimeConfigFilePath,
    runtimeStylesFilePath,
    runtimeOutputPath: asWebpackPublicPath(runtimeOutputPath),
  };
}

// ensure has leading slash and no trailing slash
function asWebpackPublicPath(x = '') {
  return (x[0] !== '/' ? `/${x}` : x).replace(/\/$/, '');
}

module.exports = extractRuntimeParameters;
