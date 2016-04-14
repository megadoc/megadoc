const buildRouteMap = require('utils/buildRouteMap');
const Outlet = require('components/Outlet');

/**
 * @module tinydoc
 * @singleton
 */
module.exports = function createTinydoc(config) {
  let exports = {};
  let routeSpecs = [];
  let previewHandlers = [];
  let callbacks = [];
  let ran = 0;
  let state = {
    getRouteMap() {
      return buildRouteMap(routeSpecs);
    }
  };

  const pluginAPI = {
    outlets: Outlet,
    addRoutes,
    registerPreviewHandler(fn) {
      previewHandlers.push(fn);
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
      spec.ignoreScrollBehavior = spec.ignoreScrollBehavior !== false;
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
  exports.use = function(pluginName, plugin) {
    var newSignature = arguments.length === 2;

    setTimeout(function() {
      if (newSignature) {
        use(pluginName, plugin);
      }
      else {
        use(pluginName);
      }
    }, 0);
  };

  function use(pluginName, plugin) {
    var args = [];

    if (arguments.length === 1) {
      plugin = pluginName;
      pluginName = plugin.name;
      args = [ pluginAPI ];
    }
    else {
      args = [ pluginAPI, exports.getRuntimeConfigs(pluginName) ];
    }

    try {
      console.log('Loading %s.', plugin.name);

      plugin.apply(null, args);
    }
    catch (e) {
      console.error('A plugin (%s) failed to load, it will be ignored.', plugin.name);
      console.error(e.stack || e);
    }
    finally {
      if (++ran === config.pluginCount) {
        console.log('All %d/%d plugins have been loaded, no more may be loaded from now on.', ran, config.pluginCount);

        seal();
      }
    }
  };

  exports.getRuntimeConfigs = function(pluginId) {
    return config.pluginConfigs[pluginId] || [];
  };

  exports.getPreviewHandlers = function() {
    return previewHandlers;
  };

  exports.isPluginEnabled = function(name) {
    return (config.pluginConfigs[name] || []).length > 0;
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

