var path = require('path');
var scan = require('./scan');
var write = require('./write');
var indexEntities = require('./indexEntities');
var generateStats = require('./generateStats');

/**
 * @module CJSPlugin
 */
function CJSPlugin(emitter, cssCompiler, config, globalConfig, utils) {
  var database;

  cssCompiler.addStylesheet(path.resolve(__dirname, 'ui', 'css', 'index.less'));

  globalConfig.scripts.push('plugins/cjs-config.js');
  globalConfig.pluginScripts.push('plugins/cjs.js');

  emitter.on('scan', function(compilation, done) {
    scan(config, globalConfig.gitRepository, utils, function(err, _database) {
      if (err) {
        return done(err);
      }

      database = _database;
      done();
    });
  });

  emitter.on('write', function(compilation, done) {
    if (compilation.scanned) {
      write(database, config, utils, done);
    }
    else {
      done();
    }
  });

  emitter.on('index', function(compilation, registry, done) {
    indexEntities(database).forEach(function(index) {
      registry.add(index.path, index.index);
    });

    done();
  });

  emitter.on('generateStats', function(compilation, stats, done) {
    if (compilation.scanned) {
      stats.js = generateStats(database);
      done();
    }
    else {
      done();
    }
  });
}

CJSPlugin.$inject = [
  'emitter',
  'cssCompiler',
  'config.cjs',
  'config',
  'utils'
];

CJSPlugin.defaults = {
  /**
   * @module CJSPlugin.Config
   */
  cjs: {
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
  }
};

module.exports = CJSPlugin;