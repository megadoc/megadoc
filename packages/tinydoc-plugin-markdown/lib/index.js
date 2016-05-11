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
      var documents;
      var database;

      compiler.on('scan', function(done) {
        scan(config, compiler.utils, function(err, _documents) {
          if (err) {
            return done(err);
          }

          documents = _documents;

          done();
        });
      });

      compiler.on('index', function(registry, done) {
        database = b.namespace({
          id: config.routeName,
          name: 'tinydoc-plugin-markdown',
          title: config.corpusContext,
          documents: documents.map(function(doc) {
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

        compiler.corpus.add(database);

        done();
      });

      compiler.on('render', function(md, linkify, done) {
        database.documents.forEach(function(documentNode) {
          var doc = documentNode.properties;
          var compiled = md.withTOC(linkify({
            text: doc.source,
            contextNode: documentNode
          }), {
            baseURL: documentNode.meta.href
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
          count: database.documents.length
        };

        done();
      });
    }
  };
}

module.exports = MarkdownPlugin;