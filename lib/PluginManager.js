var where = require('lodash').where;
var merge = require('lodash').merge;
var assert = require('./assert');
var defaults = require('../defaults');

var PLUGIN_SCANNER = 'scanner';
var PLUGIN_WRITER = 'writer';
var PLUGIN_REPORTER = 'reporter';

var KNOWN_PLUGINS = [
  require('../plugins/cjs'),
  require('../plugins/markdown'),
  require('../plugins/yard-api'),
  require('../ui')
];

function PluginManager(config, tinyConfig) {
  var plugins = [];

  config.forEach(function(spec) {
    var pluginName = spec.name;
    var plugin;

    assert(!!pluginName, 'You must specify the name of the plugin.');

    if (spec.register) {
      plugin = { register: spec.register };
    }
    else {
      var knownPlugin = where(KNOWN_PLUGINS, { name: pluginName })[0];

      if (knownPlugin) {
        plugin = knownPlugin;
      }
      else {
        throw new Error('You must define a #register function for the plugin "' + pluginName + '"');
      }
    }

    var registrar = {
      registerScanner: function(runner) {
        plugins.push({
          type: PLUGIN_SCANNER,
          name: pluginName,
          runner: runner,
          config: merge({}, plugin.defaults, spec.config)
        });
      },

      registerWriter: function(runner) {
        plugins.push({
          type: PLUGIN_WRITER,
          name: pluginName,
          runner: runner,
          config: merge({}, plugin.defaults, spec.config)
        });
      },

      registerReporterPlugin: function(format, options) {
        plugins.push({
          type: PLUGIN_REPORTER,
          name: pluginName,
          format: format,
          options: options
        });
      }
    };

    plugin.register(registrar, spec.config, tinyConfig);
  });

  return {
    getScanners: function() {
      return where(plugins, { type: PLUGIN_SCANNER });
    },

    getWriters: function() {
      return where(plugins, { type: PLUGIN_WRITER });
    },

    getReporterPlugins: function(format) {
      return where(plugins, { type: PLUGIN_REPORTER, format: format });
    }
  };
}

module.exports = PluginManager;
