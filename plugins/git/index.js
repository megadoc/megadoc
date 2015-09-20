var path = require('path');
var extend = require('lodash').extend;
var parseLatestActivity = require('./parseLatestActivity');
var parseHistory = require('./parseHistory');
var console = require('../../lib/Logger')('git');
var Promise = require('bluebird');
var merge = require('lodash').merge;

/**
 * @module Plugins.Git.Config
 * @preserveOrder
 */
var defaults = {
  /**
   * @property {String}
   *
   * The relative URL to reach the git activity page at.
   */
  routePath: 'activity',

  /**
   * @property {Boolean}
   *
   * Whether to use .mailmap (if found) for resolving coaelescing emails/names.
   */
  useMailMap: true,

  /**
   * @property {Object}
   *
   * Tuning for the "Recent Commits" section.
   */
  recentCommits: {
    /**
     * @property {String}
     *
     * Indicates the time threshold for filtering recent activity.
     */
    since: '3 days ago',

    /**
     * @property {String[]}
     */
    ignore: [],

    /**
     * @property {Function}
     */
    transform: null
  }
};

/**
 * @namespace Plugins.Git
 *
 * @param {Config} userConfig
 */
function createGitPlugin(userConfig) {
  var stats = {};
  var config = merge({}, defaults, userConfig);

  return {
    run: function(compiler) {
      var gitRepository = compiler.config.gitRepository;

      compiler.on('scan', function(done) {
        console.log('analyzing commit history...');

        Promise.all([
          parseLatestActivity(gitRepository, config.recentCommits).then(function(commits) {
            stats.recentCommits = commits;
          }),

          parseHistory(gitRepository, config).then(function(history) {
            stats.history = history;
          })
        ]).then(function() { done(); }, done);
      });

      compiler.on('write', function(done) {
        var runtimeConfig = extend({}, config, { stats: stats });

        compiler.assets.addStyleSheet(path.resolve(__dirname, 'ui', 'css', 'index.less'));
        compiler.assets.addPluginScript('plugins/git.js');
        compiler.assets.addPluginRuntimeConfig('git', runtimeConfig);

        done();
      });
    }
  };
}

module.exports = createGitPlugin;