const Outlet = require('components/Outlet');
const Layout = require('../../components/Layout');
const CorpusAPI = require('./CorpusAPI');
const invariant = require('utils/invariant');

/**
 * @module tinydoc
 * @singleton
 */
module.exports = function createTinydoc(config) {
  const corpusAPI = CorpusAPI(config.database || []);
  let exports = {};
  let routeSpecs = [];
  let previewHandlers = [];
  let symbolIndexers = [];
  const documentHandlers = {};
  let callbacks = [];
  let ran = 0;
  let state = {
    // getRouteMap() {
    //   return buildRouteMap(routeSpecs);
    // }
  };

  const pluginAPI = {
    outlets: Outlet,
    addRoutes,
    corpus: corpusAPI,

    registerPreviewHandler(fn) {
      previewHandlers.push(fn);
    },

    registerSymbolIndexer(fn) {
      symbolIndexers.push(fn);
    },

    registerDocumentHandler(namespaceId, fn) {
      invariant(!documentHandlers[namespaceId],
        `A document handler for the namespace '${namespaceId}' already exists!`
      );

      documentHandlers[namespaceId] = fn;
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
    invariant(false, "Disabled!")
    specs.forEach(function(spec) {
      // spec.ignoreScrollBehavior = spec.ignoreScrollBehavior !== false;
      // // todo: validate spec
      // routeSpecs.push(spec);
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

  exports.getRuntimeConfigs = function(pluginId) {
    return corpusAPI.getNamespacesForPlugin(pluginId).map(x => x.config);
  };

  exports.getPreviewHandlers = function() {
    return previewHandlers;
  };

  exports.getSymbolIndexers = function() {
    return symbolIndexers;
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

  exports.getCorpus = function() {
    return config.database;
  };

  exports.renderDocument = function(href) {
    const node = corpusAPI.getByURI(href);

    if (node) {
      const nsNode = corpusAPI.getNamespaceOfDocument(node.uid);

      if (nsNode) {
        if (documentHandlers[nsNode.id]) {
          return documentHandlers[nsNode.id](node, nsNode);
        }
      }
    }
  };

  /**
   * @property {UI.Corpus}
   *           The Corpus API for plugins to use.
   */
  exports.corpus = corpusAPI;

  exports.hasCustomLayoutForDocument = function(node) {
    return !!Layout.getRegionsForDocument(node, config.layoutOptions.layouts || []);
  };

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

