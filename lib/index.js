var Compiler = require('./Compiler');
var assert = require('assert');
var defaults = require('./config');
var merge = require('lodash').merge;
var console = require('./Logger')('megadoc');

/**
 * Perform a megadoc compilation.
 *
 * @param  {Config} userConfig
 * @param  {Object} runOptions
 *         The options to pass to [Compiler#run]().
 *
 * @return {Object} rc
 * @return {Object} rc.config
 * @return {Compiler} rc.compiler
 * @return {Function} rc.run
 */
function megadoc(userConfig, runOptions) {
  var compiler;
  var config = merge({}, defaults, userConfig);

  config.plugins = config.plugins || [];
  config.plugins.push(require('./HTMLSerializer')(config));

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

module.exports = megadoc;
