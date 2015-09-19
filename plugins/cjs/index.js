var path = require('path');
var scan = require('./scan');
var indexEntities = require('./indexEntities');
var generateStats = require('./generateStats');
var merge = require('lodash').merge;

/**
 * @module CJSPlugin.Config
 */
var defaults = {
  routeName: 'js',
  navigationLabel: 'JavaScripts',

  /**
   * @property {String|String[]} source
   *
   * The source files to parse.
   */
  source: [ '**/*.js' ],
  exclude: null,
  gitStats: false,
  useDirAsNamespace: true,
  classifyDoc: null,
  liveExamples: {}
};

/**
 * @module CJSPlugin
 */
function createCJSPlugin(userConfig) {
  var config = merge({}, defaults, userConfig);

  return {
    name: 'CJSPlugin',
    run: function(compiler) {
      var database;

      compiler.on('scan', function(done) {
        scan(config, compiler.config.gitRepository, compiler.utils, function(err, _database) {
          if (err) {
            return done(err);
          }

          database = _database;
          done();
        });
      });

      compiler.on('index', function(registry, done) {
        indexEntities(database).forEach(function(index) {
          registry.add(index.path, index.index);
        });

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        stats[config.routeName] = generateStats(database);
        done();
      });

      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(path.resolve(__dirname, 'ui', 'css', 'index.less'));
        compiler.assets.addPluginScript('plugins/cjs.js');
        compiler.assets.addPluginRuntimeConfig('cjs', merge({}, config, {
          database: database
        }));

        done();
      });
    }
  };
}

module.exports = createCJSPlugin;