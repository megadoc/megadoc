var assert = require('assert');
var fs = require('fs');
var path = require('path');
var defaults = require('./config');
var b = require('tinydoc-corpus').Types.builders;

module.exports = function(userConfig) {
  return {
    name: 'tinydoc-plugin-static',

    run: function(compiler) {
      var config = compiler.utils.getWithDefaults(userConfig, defaults);

      assert(typeof config.url === 'string',
        "tinydoc-plugin-static requires a @url parameter that points to where " +
        "the page should be located"
      );

      assert(typeof config.source === 'string',
        "tinydoc-plugin-static requires a @source parameter that points to a " +
        "markdown or text file."
      );

      var compiledFile;
      var filePath = compiler.utils.getAssetPath(config.source);
      var format = config.format || inferFormat(filePath);

      compiler.on('scan', function(done) {
        compiler.corpus.add(
          b.namespace({
            id: config.url.replace(/\//g, '-'),
            name: 'tinydoc-plugin-static',
            title: config.corpusContext || config.title,
            documents: [
              b.document({
                meta: {
                  href: config.url,
                },
                id: config.source,
                title: config.title
              })
            ]
          })
        );

        done();
      });

      compiler.on('render', function(renderMarkdown, linkify, done) {
        var fileContents = fs.readFileSync(filePath, 'utf-8');

        if (format === 'html') {
          compiledFile = {
            html: fileContents,
            toc: []
          };
        }
        else {
          compiledFile = renderMarkdown.withTOC(linkify(fileContents), {
            anchorableHeadings: config.anchorableHeadings,
            baseURL: config.url,
          });
        }

        done();
      });

      compiler.on('write', function(done) {
        compiler.assets.addPluginScript(path.resolve(__dirname, '../dist/tinydoc-plugin-static.js'));

        compiler.assets.addPluginRuntimeConfig('tinydoc-plugin-static', {
          url: config.url,
          outlet: config.outlet,
          anchorableHeadings: config.anchorableHeadings,
          disqus: config.disqusShortname,
          scrollToTop: config.scrollToTop,
          file: compiledFile,
          filePath: filePath,
          format: format
        });

        done();
      });
    }
  };
};

function inferFormat(filePath) {
  return path.extname(filePath).replace(/^\./, '');
}