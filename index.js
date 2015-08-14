var extend = require('lodash').extend;
// var PluginManager = require('./lib/PluginManager');
var Utils = require('./lib/Utils');
var Compiler = require('./lib/Compiler');

// var scan = require('./lib/tinydoc.scan');
// var write = require('./lib/tinydoc.write');

var defaults = {
  plugins: [],
  scripts: [],
  pluginScripts: []
};

function tinydoc(userConfig, runOptions) {
  var config = extend({}, defaults, userConfig);
  // var utils = new Utils(config);
  // var pluginMgr = new PluginManager((config.plugins), config);
  config.plugins.unshift(require('./plugins/ui'));

  return {
    config: config,

    run: function(done) {
      new Compiler(config).run(done, runOptions);
    },

    // utils: utils
  };
};

module.exports = tinydoc;
