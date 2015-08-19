var path = require('path');
var write = require('./write');
var parseGitStats = require('../../lib/utils/parseGitStats');

function UIPlugin(emitter, cssCompiler, config, utils) {
  cssCompiler.addStylesheet(path.resolve(__dirname, '..', '..', 'ui', 'app', 'css', 'index.less'));

  var readmeGitStats;

  emitter.on('scan', function(compilation, done) {
    if (config.gitStats && config.readme) {
      parseGitStats(config.gitRepository, utils.assetPath(config.readme)).then(
        function(stats) {
          readmeGitStats = stats;
          done();
        },
        function(err) {
          done(err);
        })
      ;
    }
    else {
      done();
    }
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