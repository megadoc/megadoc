const PluginRegistrar = require('./PluginRegistrar');

function PluginManager(pluginCount, emitter) {
  const registrar = new PluginRegistrar(emitter);
  let pluginConfigs = {};
  let ran = 0;

  if (pluginCount === 0) {
    emitter.emit('pluginsLoaded', registrar);
  }

  console.log('Awaiting %d plugins to be loaded.', pluginCount);

  return {
    use: function(runner) {
      try {
        console.log('Loading %s.', runner.name);

        runner(registrar.API);
      }
      catch (e) {
        console.warn('A plugin (%s) failed to load, ignoring.', runner.name);
        console.warn(e);
      }
      finally {
        if (++ran === pluginCount) {
          delete window.tinydoc.use;

          console.log('All plugins were loaded, sealing the plugin API.');

          emitter.emit('pluginsLoaded', registrar);
        }
      }
    },

    addPluginConfig: function(pluginId, config) {
      if (!pluginConfigs[pluginId]) {
        pluginConfigs[pluginId] = [];
      }

      pluginConfigs[pluginId].push(config);
    },

    getPluginConfigs: function(pluginId) {
      return pluginConfigs[pluginId];
    }
  };
}

module.exports = PluginManager;