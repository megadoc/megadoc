var path = require('path');
var write = require('./write');
var parseGitStats = require('../../lib/utils/parseGitStats');
var Promise = require('bluebird');
var merge = require('lodash').merge;

/**
 * @module Core.Config
 * @preserveOrder
 */
var defaults = {
  /**
   * @property {String} outputDir
   *
   * Path to where the built assets (index.html and friends) will be saved to.
   *
   * Note that most scanner plugins will implicitly use this path to save their
   * own assets so that they're accessible relative from the index.html entry
   * file.
   */
  outputDir: '${ROOT}/doc/www',

  /**
   * @property {String}
   *
   * Starting window title.
   */
  title: "tinydoc",

  /**
   * @property {String}
   *
   * Path to where a favicon can be found. Clear this if you don't want any.
   */
  favicon: null,

  /**
   * @property {String} [readme]
   *
   * You can point this to a markdown (or text) file and it will be displayed
   * as the landing/home page.
   */
  readme: null,

  /**
   * @property {String}
   *
   * An array of paths to files you want to copy to the output directory.
   * They will be found under `assets/` with their **full source path**.
   *
   * For example:
   *
   *     exports.assets = [ 'app/images/box.png' ];
   *
   * Will be found at:
   *
   *     /assets/app/images/box.png
   *
   */
  assets: [],

  /**
   * @property {Boolean}
   *
   * Turn this off if you want to use the HTML5 History location, but then
   * you must ensure your server is configured to rewrite any URL that
   * doesn't match an actual file to /index.html so the router can take
   * care of it.
   */
  useHashLocation: true,

  /**
   * @property {String}
   *
   * The path at which the files will be hosted. A value of `/` means
   * all the tinydoc generated files will be found at `/*`, like `/index.html`
   * for example.
   *
   * If you're serving tinydoc from a sub-folder, like `/doc`, then you
   * should tune this parameter accordingly.
   */
  publicPath: "/",

  /**
   * @property {String}
   *
   * Absolute path to a .css or .less file to include in the CSS bundle.
   * If you provide a .less file, you can (re)use the variables that the
   * UI's stock stylesheets use.
   *
   * If you want to override the variables, say for custom branding,
   * look at the @styleOverrides parameter.
   *
   * Example:
   *
   *     exports.stylesheet = "doc/tiny.less";
   *
   */
  stylesheet: null,

  /**
   * @property {String}
   *
   * Absolute path to a .less stylesheet file that re-defines variables
   * used in the stock UI's stylesheets. This allows for complete theming
   * without messing with the source files, or having to use !important
   * directives, etc.
   *
   * Example:
   *
   *     exports.styleOverrides = "doc/tiny/overrides.less";
   *
   */
  styleOverrides: null,

  /**
   * @property {Boolean}
   *
   * Turn this on if you want to parse git stats for the README file,
   * like last commit date and the file's authors.
   */
  gitStats: false,

  /**
   * @property {String}
   *
   * A small message (can be Markdown) to display at the bottom of the app.
   *
   * Set this to an empty string, or null, if you don't want the footer
   * to be shown.
   */
  footer: 'Made with &#9829; using [tinydoc](https://github.com/tinydoc).',

  /**
   * The "Hot Item" feature configuration.
   *
   * An item could be marked as "hot" if its last commit timestamp falls
   * within a certain interval you specify below. This is useful for
   * readers to easily tell which items have changed recently so that
   * they should check them out.
   */
  hotness: {
    /**
     * @property {Number}
     *
     * The number of [interval] (like days or weeks) that we should consider
     * an item to be hot.
     */
    count: 1,

    /**
     * @property {days|weeks|months|years}
     *
     * The actual interval. Works with @count defined above.
     */
    interval: "weeks"
  },

  /**
   * @property {Object}
   *
   * disqus configuration if you want the ability for users to comment.
   * Get this stuff from https://disqus.com/.
   */
  disqus: {
    enabled: false,
    shortname: '',
    baseUrl: 'http://localhost'
  },

  /**
   * @property {Boolean}
   *
   * Whether links to external sites should be opened in new tabs.
   */
  launchExternalLinksInNewTabs: true
};

exports.name = 'UIPlugin';
exports.run = function(compiler) {
  var config = merge({}, defaults, compiler.config);
  var utils = compiler.utils;
  var readmeGitStats;

  compiler.assets.addStyleSheet(
    path.resolve(__dirname, '..', '..', 'ui', 'app', 'css', 'index.less')
  );

  compiler.on('scan', function(done) {
    var svc = Promise.resolve();

    if (config.gitStats && config.readme) {
      var filePaths = [ utils.getAssetPath(config.readme) ];

      svc = parseGitStats(config.gitRepository, filePaths).then(function(stats) {
        readmeGitStats = stats[0];
      });
    }

    svc.then(function() { done(); }, done);
  });

  compiler.on('write', function(done) {
    write(config, compiler, readmeGitStats, done);
  });
};
