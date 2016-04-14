var assert = require('assert');
var fs = require('fs');
var path = require('path');
var assign = require('lodash').assign;
var parseGitStats = require('tinydoc/lib/utils/parseGitStats');

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

  gitStats: true,

  disqusShortname: null,
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
      var gitStats;
      var filePath = compiler.utils.getAssetPath(config.source);

      compiler.on('scan', function(done) {
        if (config.gitStats) {
          parseGitStats(compiler.config.gitRepository, [ filePath ], function(err, stats) {
            if (err) {
              return done(err);
            }

            gitStats = stats[0];

            done();
          });
        }
        else {
          done();
        }
      });

      compiler.on('render', function(renderMarkdown, linkify, done) {
        compiledFile = renderMarkdown.withTOC(linkify(fs.readFileSync(filePath, 'utf-8')), {
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
          anchorableHeadings: config.anchorableHeadings,
          disqus: config.disqusShortname,
          gitStats: gitStats,
          file: compiledFile,
          filePath: filePath,
        });
      });
    }
  };
};