var path = require('path');
var scan = require('./scan');
var write = require('./write');
var indexEntities = require('./indexEntities');

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
      registry.add(index.path, index.context);
    });

    done();
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
  cjs: {
    source: '**/*.js',
    exclude: null,
    gitStats: true,
    useDirAsNamespace: true,
    classifyDoc: null,
  }
};

module.exports = CJSPlugin;