var path = require('path');
var write = require('./write');
var parseGitStats = require('../../lib/utils/parseGitStats');
var Promise = require('bluebird');
var merge = require('lodash').merge;

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
  assets: [],

  /**
   * @property {String} [readme]
   *
   * You can point this to a markdown (or text) file and it will be displayed
   * as the landing/home page.
   */
  readme: null,

  useHashLocation: true,

  publicPath: '/',

  stylesheet: null,
  styleOverrides: null,

  gitStats: false,

  footer: 'Made with &#9829; using [tinydoc](https://github.com/tinydoc).',

  hotness: {
    count: 1,
    interval: 'weeks'
  },

  disqus: {
    enabled: true,
    shortname: '',
    baseUrl: 'http://localhost'
  },

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
