var path = require('path');
var extend = require('lodash').extend;
var scan = require('./scan');

function YardAPIPlugin(emitter, cssCompiler, config, globalConfig, utils) {
  var database;

  cssCompiler.addStylesheet(path.resolve(__dirname, '..', '..', 'ui', 'plugins', 'yard-api', 'css', 'index.less'));

  globalConfig.scripts.push('plugins/yard-api-config.js');
  globalConfig.pluginScripts.push('plugins/yard-api.js');

  emitter.on('scan', function(compilation, done) {
    scan(config, globalConfig, utils, function (err, _database) {
      if (err) {
        return done(err, null);
      }

      database = _database;

      done();
    });
  });

  emitter.on('write', function(compilation, done) {
    if (compilation.scanned) {
      var runtimeConfig = extend({}, config, { database: database });

      utils.writeAsset(
        'plugins/yard-api-config.js',
        'window["yard-api-config"]=' + JSON.stringify(runtimeConfig) + ';'
      );
    }

    done();
  });
}

YardAPIPlugin.$inject = [
  'emitter',
  'cssCompiler',
  'config.yard-api',
  'config',
  'utils'
];

YardAPIPlugin.defaults = {
  'yard-api': {
    command: 'bundle exec rake yard_api',
    source: 'public/doc/api/**/*.json',
    exclude: null,
    showEndpointPath: false
  }
};

module.exports = YardAPIPlugin;