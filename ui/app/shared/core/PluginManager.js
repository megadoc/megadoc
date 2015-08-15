const PluginRegistrar = require('./PluginRegistrar');

function PluginManager(pluginCount, emitter) {
  const registrar = new PluginRegistrar(emitter);
  let ran = 0;

  if (pluginCount === 0) {
    emitter.emit('pluginsLoaded', registrar);
  }

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
        console.log('%d more plugins to go.', pluginCount - (++ran));

        if (ran === pluginCount) {
          delete window.tinydocReact.use;

          console.log('All plugins were loaded, starting.');

          emitter.emit('pluginsLoaded', registrar);
        }
      }
    }
  };
}

module.exports = PluginManager;