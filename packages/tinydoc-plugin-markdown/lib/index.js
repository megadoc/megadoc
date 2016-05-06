var path = require('path');
var scan = require('./scan');
var assign = require('lodash').assign;
var defaults = require('./config');
var b = require('tinydoc-corpus').Types.builders;

function MarkdownPlugin(userConfig) {
  var config = assign({}, defaults, userConfig);

  return {
    name: 'tinydoc-plugin-markdown',
    id: config.routeName,

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
        var namespace = b.namespace({
          id: config.routeName,
          corpusContext: config.corpusContext,
          documents: database.map(function(doc) {
            // omg omg, we're rendering everything twice now
            var compiled = compiler.renderer.withTOC(doc.source);

            // TODO: b.markdownDocument
            return b.document({
              id: doc.id,
              title: doc.plainTitle,
              summary: doc.summary,
              filePath: doc.filePath,
              properties: doc,
              entities: compiled.toc.map(function(section) {
                return b.documentEntity({
                  id: section.scopedId,
                  title: section.text,
                  properties: section
                })
              })
            })
          })
        });

        compiler.corpus.add(namespace);

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
        var runtimeConfig = config;

        compiler.assets.addStyleSheet(
          path.resolve(__dirname, '..', 'ui', 'css', 'index.less')
        );

        compiler.assets.addPluginScript(
          path.resolve(__dirname, '..', 'dist', 'tinydoc-plugin-markdown.js')
        );

        compiler.assets.addPluginRuntimeConfig('tinydoc-plugin-markdown', runtimeConfig);

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        stats['tinydoc-plugin-markdown:' + config.routeName] = {
          count: database.length
        };

        done();
      });
    }
  };
}

module.exports = MarkdownPlugin;