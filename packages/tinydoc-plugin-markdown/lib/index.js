var path = require('path');
var scan = require('./scan');
var indexEntities = require('./indexEntities');
var resolveLink = require('./resolveLink');
var assign = require('lodash').assign;
var defaults = require('./config');

function MarkdownPlugin(userConfig) {
  var config = assign({}, defaults, userConfig);

  return {
    name: 'tinydoc-plugin-markdown',
    id: config.routeName,

    run: function(compiler) {
      var database;

      compiler.on('scan', function(done) {
        console.log('MARKDOWN[%s] SCANNING', config.routeName);

        scan(config, compiler.utils, compiler.config, function(err, _database) {
          if (err) {
            return done(err);
          }

          database = _database.map(function(doc) {
            return assign({}, doc, {
              href: config.routeName + '/' + encodeURIComponent(doc.id)
            });
          });

          compiler.linkResolver.use(resolveLink.bind(null, database));

          done();
        });
      });

      compiler.on('index', function(registry, done) {
        var result = indexEntities(database, config.routeName, config);

        Object.keys(result.indices).forEach(function(indexPath) {
          registry.add(indexPath, result.indices[indexPath]);
        });

        result.searchTokens.forEach(function(token) {
          registry.addSearchToken(token);
        });

        done();
      });

      compiler.on('render', function(md, linkify, done) {
        database.forEach(function(doc) {
          var compiled = md.withTOC(linkify({
            text: doc.source,
            source: {
              href: doc.href,
              title: doc.plainTitle,
            }
          }), {
            baseURL: '/' + doc.href
          });

          doc.source = compiled.html;
          doc.sections = compiled.toc;
        });

        done();
      });

      compiler.on('write', function(done) {
        var runtimeConfig = assign({}, config, { database: database });

        compiler.assets.addStyleSheet(
          path.resolve(__dirname, '..', 'ui', 'css', 'index.less')
        );

        compiler.assets.addPluginScript(
          path.resolve(__dirname, '..', 'dist', 'tinydoc-plugin-markdown.js')
        );

        compiler.assets.addPluginRuntimeConfig('markdown', runtimeConfig);

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        stats['markdown:' + config.routeName] = {
          count: database.length
        };

        done();
      });
    }
  };
}

module.exports = MarkdownPlugin;