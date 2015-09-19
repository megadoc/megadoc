var path = require('path');
var extend = require('lodash').extend;
var parseLatestActivity = require('./parseLatestActivity');
var parseHistory = require('./parseHistory');
var console = require('../../lib/Logger')('git');
var Promise = require('bluebird');
var merge = require('lodash').merge;

var defaults = {
  routePath: 'activity',
  useMailMap: true,
  recentCommits: {
    since: '3 days ago',
    ignore: [],
    transform: null
  }
};

function GitPlugin(userConfig) {
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

module.exports = GitPlugin;