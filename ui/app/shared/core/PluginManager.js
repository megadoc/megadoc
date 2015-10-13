const PluginRegistrar = require('./PluginRegistrar');

function PluginManager(pluginCount, emitter) {
  const registrar = new PluginRegistrar(emitter);
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
        console.error('A plugin (%s) failed to load, it will be ignored.', runner.name);
        console.error(e.stack || e);
      }
      finally {
        if (++ran === pluginCount) {
          console.log('All plugins have been loaded, no more may be loaded from now on.');

          window.tinydoc.seal();

          emitter.emit('pluginsLoaded', registrar);
        }
      }
    }
  };
}

module.exports = PluginManager;