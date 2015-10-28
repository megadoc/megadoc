var path = require('path');
var scan = require('./scan');
var indexEntities = require('./indexEntities');
var resolveLink = require('./resolveLink');
var merge = require('lodash').merge;

var defaults = {
  gitStats: false,
  routeName: 'articles',
  title: 'Articles',
  source: [ 'doc/**/*.md' ],
  icon: null,
  exclude: [],
  fullFolderTitles: true,
  fullFolderTitleDelimiter: ' - ',
  allowLeadingSlashInLinks: true,
  generateMissingHeadings: true,
  discardIdPrefix: null
};

function MarkdownPlugin(userConfig) {
  var config = merge({}, defaults, userConfig);

  return {
    run: function(compiler) {
      var database;

      compiler.on('scan', function(done) {
        console.log('MARKDOWN[%s] SCANNING', config.routeName);

        scan(config, compiler.utils, compiler.config, function(err, _database) {
          if (err) {
            return done(err);
          }

          database = _database;

          compiler.linkResolver.use(resolveLink.bind(null, database));

          done();
        });
      });

      compiler.on('index', function(registry, done) {
        var indices = indexEntities(database, config.routeName, config);

        Object.keys(indices).forEach(function(indexPath) {
          registry.add(indexPath, indices[indexPath]);
        });

        done();
      });

      compiler.on('render', function(md, linkify, done) {
        console.log('RENDERING');

        database.forEach(function(doc) {
          console.log('Compiling "%s"', doc.id);

          var compiled = md.withTOC(linkify(doc.source), {
            baseURL: '/' + config.routeName + '/' + encodeURIComponent(doc.id)
          });

          doc.source = compiled.html;
          doc.sections = compiled.toc;
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