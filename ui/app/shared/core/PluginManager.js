var PluginRegistrar = require('./PluginRegistrar');
var config = require('config');
var loadScript = require('utils/loadScript');
var loadStylesheet = require('utils/loadStylesheet');

function createPublicPath(filePath) {
  return [ config.publicPath, filePath ].join('/').replace('//', '/');
}

function PluginManager(plugins, emitter, onDone) {
  var registrar = new PluginRegistrar(emitter);
  var ran = 0;

  if (!plugins.length) {
    setTimeout(function() {
      onDone(registrar, []);
    }, 0);
  }

  return {
    use: function(runner) {
      runner(registrar.API);

      console.log('%d more plugins to go.', plugins.length - ran);

      if (++ran === plugins.length) {
        delete window.tinydocReact.use;

        console.log('All plugins were loaded, starting.');

        onDone(registrar, []);
      }
    },

    load: function() {
      plugins.forEach(function(plugin) {
        var { name } = plugin;

        console.log(`Loading plugin ${name}.`);

        // in development, we'll be eagerly loading the plugins in the devserver
        //
        // see /server.js and /.local.js
        if (process.env.NODE_ENV !== 'development') {
          plugin.options.files.map(createPublicPath).forEach(loadScript);
        }
      });

      if (config.stylesheet) {
        var styleNode = document.createElement('style');
        styleNode.innerText = config.stylesheet;
        document.head.appendChild(styleNode);
      }
    }
  };
}

module.exports = PluginManager;