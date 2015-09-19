var merge = require('lodash').merge;
var Compiler = require('./lib/Compiler');

function tinydoc(config, runOptions) {
  config.plugins = config.plugins || [];
  config.plugins.push(require('./plugins/ui'));

  var compiler = new Compiler(config);

  return {
    config: config,

    run: function(done) {
      compiler.run(done, runOptions);
    }
  };
}

module.exports = tinydoc;
