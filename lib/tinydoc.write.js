var assert = require('./utils/assert');

var write = function(writers, pluginMgr, database, tinyConfig, utils, done) {
  var doneCount = 0;

  writers.forEach(function(writer) {
    var API = {
      getDatabase: function() {
        return database;
      },

      getReporterPlugins: function(format) {
        return pluginMgr.getReporterPlugins(format).map(function(reporterPlugin) {
          return {
            name: reporterPlugin.name,
            options: reporterPlugin.options
          };
        });
      },

      getPluginConfigItem: function(pluginName, configKey) {
        var plugin = tinyConfig.plugins.filter(function(spec) {
          return spec.name === pluginName;
        })[0];

        assert(plugin,
          "Unable to find config item '%s' for plugin '%s' as it does not seem" +
          " to be registered.",
          configKey, pluginName
        );

        assert(plugin.config.hasOwnProperty(configKey),
          "Plugin '%s' does not seem to support the option '%s'.",
          pluginName, configKey
        );

        return plugin.config[configKey];
      },

      getScannerOutput: function() {
        assert(database.hasOwnProperty(writer.name),
          "Unable to find a database for plugin '%s'! Are you sure you have " +
          "registered a scanner?"
        );

        return database[writer.name];
      },

      done: function(err) {
        if (err) {
          return done(err);
        }

        if (++doneCount === writers.length) {
          done();
        }
      }
    };

    writer.runner(API, writer.config, tinyConfig, utils);
  });
};

module.exports = write;