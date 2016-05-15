var path = require('path');
var assign = require('object-assign');
var scan = require('./scan');
var render = require('./render');
var defaults = require('./config');
var isAPIObject = require('./utils').isAPIObject;
var isAPIEndpoint = require('./utils').isAPIEndpoint;

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
          compiler.corpus.add(database);

          done();
        });
      });

      compiler.on('render', function(md, linkify, done) {
        render(database, md, linkify);
        done();
      });

      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(
          path.resolve(__dirname, '..', 'ui', 'css', 'index.less')
        );

        compiler.assets.addPluginScript(
          path.resolve(__dirname, '..', 'dist', 'tinydoc-plugin-yard-api.js')
        );

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        stats['yard-api:' + config.routeName] = {
          apiCount: database.documents.length,
          objectCount: database.documents.reduce(function(acc, node) {
            return acc + node.entities.filter(isAPIObject).length
          }, 0),

          endpointCount: database.documents.reduce(function(acc, node) {
            return acc + node.entities.filter(isAPIEndpoint).length
          }, 0),
        };

        done();
      });
    }
  };
}

module.exports = YardAPIPlugin;