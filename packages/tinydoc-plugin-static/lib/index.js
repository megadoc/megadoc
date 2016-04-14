var assert = require('assert');
var fs = require('fs');
var path = require('path');
var assign = require('lodash').assign;

/**
 * @module tinydoc-plugin-static.Config
 */
var defaults = {
  /**
   * @property {String}
   */
  url: null,

  /**
   * @property {String}
   */
  source: null,

  /**
   * @property {String}
   */
  outlet: null,

  /**
   * @property {Boolean}
   */
  anchorableHeadings: false,
};

module.exports = function(userConfig) {
  var config = assign({}, defaults, userConfig);

  assert(typeof config.url === 'string',
    "tinydoc-plugin-static requires a @url parameter that points to where " +
    "the page should be located"
  );

  assert(typeof config.source === 'string',
    "tinydoc-plugin-static requires a @source parameter that points to a " +
    "markdown or text file."
  );

  return {
    name: 'tinydoc-plugin-static',

    run: function(compiler) {
      var compiledFile;

      compiler.on('render', function(renderMarkdown, linkify, done) {
        compiledFile = renderMarkdown.withTOC(linkify(
          fs.readFileSync(compiler.utils.getAssetPath(config.source), 'utf-8')
        ), {
          anchorableHeadings: config.anchorableHeadings,
          baseURL: config.url
        });

        done();
      });

      compiler.on('write', function() {
        compiler.assets.addPluginScript(path.resolve(__dirname, '../dist/tinydoc-plugin-static.js'));

        compiler.assets.addPluginRuntimeConfig('tinydoc-plugin-static', {
          url: config.url,
          outlet: config.outlet,
          file: compiledFile,
        });
      });
    }
  };
};