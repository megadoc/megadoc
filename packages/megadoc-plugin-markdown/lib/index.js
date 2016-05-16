var path = require('path');
var scan = require('./scan');
var reduce = require('./reduce');
var assign = require('lodash').assign;
var defaults = require('./config');

function MarkdownPlugin(userConfig) {
  var config = assign({}, defaults, userConfig);

  return {
    id: config.id,
    name: 'megadoc-plugin-markdown',

    run: function(compiler) {
      var database;

      compiler.on('scan', function(done) {
        scan(config, compiler.utils, function(err, documents) {
          if (err) {
            return done(err);
          }

          database = compiler.corpus.add(reduce(compiler, config, documents));

          done();
        });
      });

      compiler.on('render', function(md, linkify, done) {
        if (config.withFolders) {
          database.documents.forEach(function(folderNode) {
            folderNode.documents.forEach(render);
          });
        }
        else {
          database.documents.forEach(render);
        }

        function render(documentNode) {
          var doc = documentNode.properties;
          var compiled = md.withTOC(linkify({
            text: doc.source,
            contextNode: documentNode
          }), {
            baseURL: documentNode.meta.href,
            sanitize: config.sanitize !== false,
          });

          doc.source = compiled.html;
          doc.sections = compiled.toc;
        }

        done();
      });

      compiler.on('write', function(done) {
        var runtimeConfig = config;

        compiler.assets.addStyleSheet(
          path.resolve(__dirname, '..', 'ui', 'css', 'index.less')
        );

        compiler.assets.addPluginScript(
          path.resolve(__dirname, '..', 'dist', 'megadoc-plugin-markdown.js')
        );

        compiler.assets.addPluginRuntimeConfig('megadoc-plugin-markdown', runtimeConfig);

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        if (config.withFolders) {
          stats['megadoc-plugin-markdown:' + config.id] = {
            count: database.documents.reduce(function(acc, folder) {
              return acc + folder.documents.length;
            }, 0)
          };
        }
        else {
          stats['megadoc-plugin-markdown:' + config.id] = {
            count: database.documents.length
          };
        }

        done();
      });
    }
  };
}

module.exports = MarkdownPlugin;

