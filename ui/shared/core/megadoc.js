const Outlet = require('components/Outlet');
const CorpusAPI = require('./CorpusAPI');

/**
 * @module megadoc
 * @singleton
 */
module.exports = function createMegadoc(config) {
  const corpusAPI = CorpusAPI(config.database || []);
  let exports = {};
  let previewHandlers = [];
  let callbacks = [];
  let ran = 0;

  const pluginAPI = {
    outlets: Outlet,
    corpus: corpusAPI,

    registerPreviewHandler(fn) {
      previewHandlers.push(fn);
    },
  };

  function seal() {
    exports.use = function() {
      console.warn(
        "You are attempting to call 'megadoc.use()' after all plugins were " +
        "loaded. This probably means you forgot to register your " +
        "script as a plugin script."
      );
    };

    callbacks.forEach(function(callback) {
      callback();
    });
  }

  /**
   * @method megadoc.use
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
      args = [
        pluginAPI,
        corpusAPI.getNamespacesForPlugin(pluginName).map(x => x.config)
      ];
    }

    try {
      console.log('Loading "%s".', plugin.name);

      plugin.apply(null, args);
    }
    catch (e) {
      console.error('A plugin (%s) failed to load, it will be ignored.', plugin.name);
      console.error(e.stack || e);
    }
    finally {
      console.log('Plugin "%s" has been loaded - %d remain.', plugin.name, config.pluginCount - ran - 1);

      if (++ran === config.pluginCount) {
        console.log('All %d/%d plugins have been loaded, no more may be loaded from now on.', ran, config.pluginCount);

        seal();
      }
    }
  };

  exports.getPreviewHandlers = function() {
    return previewHandlers;
  };

  exports.onReady = function(callback) {
    if (ran === config.pluginCount) {
      callback();
    }
    else {
      callbacks.push(callback);
    }
  };

  /**
   * @property {UI.Corpus}
   *           The Corpus API for plugins to use.
   */
  exports.corpus = corpusAPI;

  exports.getRelativeFilePath = function(filePath) {
    if (filePath.indexOf(config.assetRoot) === 0) {
      return filePath.slice(config.assetRoot.length + 1);
    }
    else {
      return filePath;
    }
  }

  return exports;
};

