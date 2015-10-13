var path = require('path');
var merge = require('lodash').merge;
var scan = require('./scan');
var indexEntities = require('./indexEntities');

var defaults = {
  command: 'bundle exec rake yard_api',
  source: 'public/doc/api/**/*.json',
  exclude: null,
  showEndpointPath: false
};

function YardAPIPlugin(userConfig) {
  var config = merge({}, defaults, userConfig);

  return {
    name: 'YARD-API',

    run: function(compiler) {
      var database;

      compiler.on('scan', function(done) {
        scan(config, compiler.config, compiler.utils, function (err, _database) {
          if (err) {
            return done(err, null);
          }

          database = _database;

          done();
        });
      });

      compiler.on('index', function(registry, done) {
        indexEntities(database, registry, config);

        done();
      });

      compiler.on('write', function(done) {
        var runtimeConfig = merge({}, config, { database: database });

        compiler.assets.addStyleSheet(path.resolve(__dirname, 'ui', 'css', 'index.less'));
        compiler.assets.addPluginScript(
          path.resolve(__dirname, 'ui/dist/tinydoc-plugin-yard-api.js')
        );
        compiler.assets.addPluginRuntimeConfig('yard-api', runtimeConfig);

        done();
      });
    }
  };
}

module.exports = YardAPIPlugin;