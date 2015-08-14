var extend = require('lodash').extend;
var Compiler = require('./lib/Compiler');

var defaults = {
  plugins: [],
  scripts: [],
  pluginScripts: []
};

function tinydoc(userConfig, runOptions) {
  var config = extend({}, defaults, userConfig);
  config.plugins.unshift(require('./plugins/ui'));

  return {
    config: config,

    run: function(done) {
      new Compiler(config).run(done, runOptions);
    }
  };
}

module.exports = tinydoc;
