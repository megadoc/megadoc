var merge = require('lodash').merge;
var Compiler = require('./lib/Compiler');

var defaults = {
  plugins: [],
  scripts: [],
  pluginScripts: []
};

function tinydoc(userConfig, runOptions) {
  var config;
  var plugins = userConfig.plugins || defaults.plugins;
  var pluginDefaults = {};

  plugins.unshift(require('./plugins/ui'));

  // apply the plugins default configs
  plugins.forEach(function(plugin) {
    if (plugin.defaults) {
      merge(pluginDefaults, plugin.defaults);
    }
  });

  config = merge({}, defaults, pluginDefaults, userConfig);

  return {
    config: config,

    run: function(done) {
      new Compiler(config).run(done, runOptions);
    }
  };
}

module.exports = tinydoc;
