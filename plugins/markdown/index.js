var path = require('path');
var scan = require('./scan');
var indexEntities = require('./indexEntities');
var merge = require('lodash').merge;

var defaults = {
  gitStats: false,
  name: 'articles',
  title: 'Articles',
  source: [ 'doc/**/*.md' ],
  icon: 'icon-book',
  exclude: [],
  fullFolderTitles: true,
  fullFolderTitleDelimiter: ' - ',
  allowLeadingSlashInLinks: true,
  discardIdPrefix: null
};

function MarkdownPlugin(userConfig) {
  var config = merge({}, defaults, userConfig);

  return {
    run: function(compiler) {
      var database;

      compiler.on('scan', function(done) {
        scan(config, compiler.utils, compiler.config, function(err, _database) {
          if (err) {
            return done(err);
          }

          database = _database;
          done();
        });
      });

      compiler.on('index', function(registry, done) {
        var indices = indexEntities(database, config);

        Object.keys(indices).forEach(function(indexPath) {
          registry.add(indexPath, indices[indexPath]);
        });

        done();
      });

      compiler.on('write', function(done) {
        var runtimeConfig = merge({}, config, { database: database });

        compiler.assets.addStyleSheet(path.resolve(__dirname, 'ui', 'css', 'index.less'));
        compiler.assets.addPluginScript(
          path.resolve(__dirname, 'ui/dist/tinydoc-plugin-markdown.js')
        );
        compiler.assets.addPluginRuntimeConfig('markdown', runtimeConfig);

        done();
      });
    }
  };
}

module.exports = MarkdownPlugin;