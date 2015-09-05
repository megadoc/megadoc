var path = require('path');
var scan = require('./scan');
var indexEntities = require('./indexEntities');
var write = require('./write');

function MarkdownPlugin(emitter, cssCompiler, config, globalConfig, utils) {
  var database;

  cssCompiler.addStylesheet(path.resolve(__dirname, '..', '..', 'ui', 'plugins', 'markdown', 'css', 'index.less'));

  globalConfig.scripts.push('plugins/markdown-config.js');
  globalConfig.pluginScripts.push('plugins/markdown.js');

  emitter.on('scan', function(compilation, done) {
    scan(config, utils, globalConfig, function(err, _database) {
      if (err) {
        return done(err);
      }

      database = _database;
      done();
    });
  });

  emitter.on('index', function(compilation, registry, done) {
    if (compilation.scanned) {
      var indices = indexEntities(database, config);

      Object.keys(indices).forEach(function(indexPath) {
        registry.add(indexPath, indices[indexPath]);
      });

      done();
    }
    else {
      done();
    }
  });

  emitter.on('write', function(compilation, done) {
    if (compilation.scanned) {
      write(database, config, utils, done);
    }
    else {
      done();
    }
  });
}

MarkdownPlugin.$inject = [
  'emitter',
  'cssCompiler',
  'config.markdown',
  'config',
  'utils'
];

MarkdownPlugin.defaults = {
  markdown: {
    gitStats: true,
    name: 'articles',
    title: 'Articles',
    source: 'doc/articles/**/*.md',
    icon: 'icon-book',
    exclude: [],
    fullFolderTitles: true,
    fullFolderTitleDelimiter: ' - ',
    allowLeadingSlashInLinks: true,
    discardIdPrefix: null
  }
};

module.exports = MarkdownPlugin;