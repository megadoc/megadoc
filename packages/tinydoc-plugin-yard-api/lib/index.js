var path = require('path');
var assign = require('tinydoc/lib/utils/Object.assign');
var scan = require('./scan');
var indexEntities = require('./indexEntities');
var resolveLink = require('./resolveLink');
var render = require('./render');

var defaults = require('./config');

function YardAPIPlugin(userConfig) {
  var config = assign({}, defaults, userConfig);

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
          compiler.linkResolver.use(resolveLink.bind(null, config.routeName,  database));

          done();
        });
      });

      compiler.on('index', function(registry, done) {
        indexEntities(database, registry, config);

        done();
      });

      compiler.on('render', function(md, linkify, done) {
        render(database, md, linkify);
        done();
      });

      compiler.on('write', function(done) {
        var runtimeConfig = assign({}, config, { database: database });

        compiler.assets.addStyleSheet(
          path.resolve(__dirname, '..', 'ui', 'css', 'index.less')
        );

        compiler.assets.addPluginScript(
          path.resolve(__dirname, '..', 'dist', 'tinydoc-plugin-yard-api.js')
        );

        compiler.assets.addPluginRuntimeConfig('yard-api', runtimeConfig);

        done();
      });
    }
  };
}

module.exports = YardAPIPlugin;