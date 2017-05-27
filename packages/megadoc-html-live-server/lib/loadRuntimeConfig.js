const path = require('path');
const { getConfigurablePair } = require('megadoc-config-utils');
const { constants: K } = require('megadoc-html-serializer');
const HTMLSerializer = require('megadoc-html-serializer');

function loadRuntimeConfig({ configFilePath }) {
  const config = reverseMerge(require(configFilePath), {
    assetRoot: path.resolve(path.dirname(configFilePath))
  });

  const serializerSpec = getConfigurablePair(config.serializer) || {
    name: 'megadoc-html-serializer',
    options: {},
  };

  const serializer = new HTMLSerializer(config, serializerSpec.options)
  const { runtimeOutputPath } = serializer.config;
  const runtimeConfigFilePath = serializer.assetUtils.getOutputPath(runtimeOutputPath, K.CONFIG_FILE);

  return {
    compilerConfig: config,
    contentBase: path.resolve(config.outputDir),
    runtimeConfig: require(runtimeConfigFilePath),
    runtimeOutputPath: normalizePath(runtimeOutputPath),
  };
}

function reverseMerge(target, source) {
  return Object.keys(source).reduce(function(map, key) {
    if (!map.hasOwnProperty(key) || map[key] === undefined) {
      map[key] = source[key];
    }

    return map;
  }, Object.assign({}, target))
}

function normalizePath(x = '') {
  return (x[0] !== '/' ? `/${x}` : x).replace(/\/$/, '');
}

module.exports = loadRuntimeConfig;
