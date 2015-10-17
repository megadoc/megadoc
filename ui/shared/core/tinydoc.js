const buildRouteMap = require('utils/buildRouteMap');

/**
 * @module tinydoc
 * @singleton
 */
module.exports = function createTinydoc(config) {
  let exports = {};
  let routeSpecs = [];
  let callbacks = [];
  let ran = 0;
  let state = {
    getRouteMap() {
      return buildRouteMap(routeSpecs);
    }
  };

  function seal() {
    exports.use = function() {
      console.warn(
        "You are attempting to call 'tinydoc.use()' after all plugins were " +
        "loaded. This probably means you forgot to register your " +
        "script as a plugin script."
      );
    };

    callbacks.forEach(function(callback) {
      callback(state);
    });
  }

  function addRoutes(specs) {
    specs.forEach(function(spec) {
      // todo: validate spec
      routeSpecs.push(spec);
    });
  }

  /**
   * @method tinydoc.use
   *
   * @param {Function} pluginEntryRunner
   *        The function that will register your plugin.
   *
   * @param {PluginRegistrar} pluginEntryRunner.api
   *        The plugin registration API you can use.
   */
  exports.use = function(plugin) {
    try {
      console.log('Loading %s.', plugin.name);

      plugin({ addRoutes });
    }
    catch (e) {
      console.error('A plugin (%s) failed to load, it will be ignored.', plugin.name);
      console.error(e.stack || e);
    }
    finally {
      if (++ran === config.pluginCount) {
        console.log('All plugins have been loaded, no more may be loaded from now on.');

        seal();
      }
    }
  };

  exports.getRuntimeConfigs = function(pluginId) {
    return config.pluginConfigs[pluginId] || [];
  };

  exports.onReady = function(callback) {
    if (ran === config.pluginCount) {
      callback(state);
    }
    else {
      callbacks.push(callback);
    }
  };

  return exports;
};

