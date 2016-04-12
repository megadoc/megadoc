var Compiler = require('./Compiler');
var assert = require('assert');
var defaults = require('./plugins/core/config');
var merge = require('lodash').merge;
var console = require('./Logger')('tinydoc');

function tinydoc(userConfig, runOptions) {
  var compiler;
  var config = merge({}, defaults, userConfig);

  config.plugins = config.plugins || [];
  config.plugins.push(require('./plugins/core'));

  compiler = new Compiler(config);

  if (config.verbose) {
    console.log('There are %d registered plugins:',
      config.plugins.length,
      config.plugins.map(function(p) { return p.name; })
    );
  }

  config.plugins.forEach(function(plugin) {
    assert(plugin.run instanceof Function,
      "A plugin must define a 'run' function." +
      (plugin.name ? ' (Name: ' + plugin.name + ')' : '')
    );

    plugin.run(compiler);
  });

  return {
    config: config,

    run: function(done) {
      compiler.run(runOptions, done);
    }
  };
}

module.exports = tinydoc;
