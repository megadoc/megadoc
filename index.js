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

  var compiler = new Compiler(config);
  var compilation;

  return {
    config: config,

    run: function(done) {
      compiler.run(function(err, _compilation) {
        compilation = _compilation;
        done(err, _compilation);
      }, runOptions);
    },

    generateStats: function(done) {
      if (compilation) {
        compiler.generateStats(compilation).then(function(stats) {
          done(null, stats);
        }, function(error) {
          done(error);
        });
      }
      else {
        done('You must compile the docs first before generating stats!');
      }
    }
  };
}

module.exports = tinydoc;
