var path = require('path');
var write = require('./write');
var parseGitStats = require('../../lib/utils/parseGitStats');
var Promise = require('bluebird');

function UIPlugin(emitter, cssCompiler, config, utils) {
  cssCompiler.addStylesheet(path.resolve(__dirname, '..', '..', 'ui', 'app', 'css', 'index.less'));

  var readmeGitStats;

  emitter.on('scan', function(compilation, done) {
    var svc = Promise.resolve();

    if (config.gitStats && config.readme) {
      var filePaths = [ utils.getAssetPath(config.readme) ];

      svc = parseGitStats(config.gitRepository, filePaths).then(function(stats) {
        readmeGitStats = stats[0];
      });
    }

    svc.then(function() { done(); }, done);
  });

  emitter.on('write', function(compilation, done) {
    write(config, utils, readmeGitStats, done);
  });
}

UIPlugin.defaults = {
  ui: {
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
    scripts: [],
    pluginScripts: [],
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

    gitStats: true,

    footer: 'Made with &#9829; using [tinydoc](https://github.com/tinydoc).',

    hotness: {
      count: 1,
      interval: 'weeks'
    },

    disqus: {
      shortname: '',
      baseUrl: 'http://localhost'
    }
  }
};

UIPlugin.$inject = [ 'emitter', 'cssCompiler', 'config', 'utils' ];

module.exports = UIPlugin;