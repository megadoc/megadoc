const path = require('path');

function getConfigurablePair(item) {
  if (typeof item === 'string') {
    return { name: item, options: null };
  }
  else if (Array.isArray(item)) {
    return { name: item[0], options: item[1] };
  }
  else if (item && typeof item === 'object' && item.name) {
    return { name: item.name, options: item.options };
  }
  else {
    return null;
  }
};

exports.getConfigurablePair = getConfigurablePair;
exports.getOptionsFromPair = function(value) {
  const tuple = getConfigurablePair(value);

  if (tuple) {
    return tuple.options;
  }
  else {
    return null;
  }
};

exports.loadConfigFromFile = function(filePath) {
  const userConfig = require(filePath);

  return Object.assign({}, userConfig, {
    assetRoot: userConfig.assetRoot || path.resolve(path.dirname(filePath))
  });
}