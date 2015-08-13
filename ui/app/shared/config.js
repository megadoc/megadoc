var config = window.CONFIG;

if (process.env.NODE_ENV === 'development' && process.env.CONFIG_FILE) {
  var { merge } = require('lodash');
  var override = function(key, newValue) {
    if (config[key] && config[key] !== newValue) {
      console.warn('Overriding config[%s]: from `%s` to `%s`.', key, config[key], newValue);
    }

    config[key] = newValue;
  };

  require(process.env.CONFIG_FILE);

  config = merge({}, require('../../defaults'), window.CONFIG);

  override('publicPath', '/doc');
  override('useHashLocation', true);
}

module.exports = config;
