var assert = require('assert');
var fs = require('fs');
var path = require('path');
var defaults = require('./config');
var b = require('megadoc-corpus').Types.builders;

module.exports = function(userConfig) {
  return {
    name: 'megadoc-plugin-static',

    run: function(compiler) {
      var config = compiler.utils.getWithDefaults(userConfig, defaults);

      assert(typeof config.url === 'string',
        "megadoc-plugin-static requires a @url parameter that points to where " +
        "the page should be located"
      );

      assert(typeof config.source === 'string',
        "megadoc-plugin-static requires a @source parameter that points to a " +
        "markdown or text file."
      );

      var compiledFile;
      var filePath = compiler.utils.getAssetPath(config.source);
      var format = config.format || inferFormat(filePath);
      var database;

      compiler.on('scan', function(done) {
        database = compiler.corpus.add(
          b.namespace({
            id: config.url.replace(/\//g, '-'),
            name: 'megadoc-plugin-static',
            title: config.corpusContext || config.title,
            meta: {
              href: null,
              defaultLayouts: [
                {
                  match: { by: 'url', on: config.url },
                  regions: [
                    {
                      name: 'Layout::Content',
                      options: { framed: true },
                      outlets: [
                        { name: 'Static::Document' },
                        { name: 'Layout::Content' },
                      ]
                    },
                    {
                      name: 'Layout::Sidebar',
                      options: { framed: true },
                      outlets: [
                        { name: 'Markdown::DocumentTOC', using: config.url.replace(/\//g, '-') + '/' + config.source },
                        { name: 'Layout::Sidebar' },
                      ]
                    }
                  ]
                }
              ]
            },

            config: {
              url: config.url,
              anchorableHeadings: config.anchorableHeadings,
              disqus: config.disqusShortname,
              scrollToTop: config.scrollToTop,
              file: compiledFile,
              filePath: filePath,
              format: format,
            },

            documents: [
              b.document({
                id: config.source,
                title: config.title,
                meta: { href: config.url, },
                properties: {},
              })
            ]
          })
        );

        done();
      });

      compiler.on('render', function(md, linkify, done) {
        var documentNode = database.documents[0];
        var fileContents = fs.readFileSync(filePath, 'utf-8');

        if (format === 'html') {
          documentNode.properties = {
            html: fileContents,
            toc: []
          };
        }
        else {
          documentNode.properties = md.withTOC(
            linkify({ text: fileContents, contextNode: documentNode }),
            {
              anchorableHeadings: config.anchorableHeadings,
              baseURL: documentNode.meta.href,
            }
          );
        }

        done();
      });

      compiler.on('write', function(done) {
        compiler.assets.addPluginScript(path.resolve(__dirname, '../dist/megadoc-plugin-static.js'));

        done();
      });
    }
  };
};

function inferFormat(filePath) {
  return path.extname(filePath).replace(/^\./, '');
}