var path = require('path');
var scan = require('./scan');
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
    fullFolderTitleDelimiter: ' - '
  }
};

module.exports = MarkdownPlugin;