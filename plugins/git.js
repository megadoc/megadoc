var path = require('path');
var glob = require('glob');
var fs = require('fs-extra');
var extend = require('lodash').extend;
var parseLatestActivity = require('./git/parseLatestActivity');
var parseHistory = require('./git/parseHistory');
var console = require('../lib/Logger')('git');

function GitPlugin(emitter, cssCompiler, config, globalConfig, utils) {
  var stats = {};

  cssCompiler.addStylesheet(path.resolve(__dirname, '..', 'ui', 'plugins', 'git', 'css', 'index.less'));

  globalConfig.scripts.push('plugins/git-config.js');
  globalConfig.pluginScripts.push('plugins/git.js');

  emitter.on('scan', function(compilation, done) {
    console.log('analyzing commit history...');

    Promise.all([
      parseLatestActivity(globalConfig.gitRepository, config.recentCommits).then(function(commits) {
        stats.recentCommits = commits;
      }),

      parseHistory(globalConfig.gitRepository, config).then(function(history) {
        stats.history = history;
      })
    ]).then(function() { done(); }, done);
  });

  emitter.on('write', function(compilation, done) {
    if (compilation.scanned) {
      var runtimeConfig = extend({}, config, { stats: stats });

      utils.writeAsset(
        'plugins/git-config.js',
        'window["git-config"]=' + JSON.stringify(runtimeConfig) + ';'
      );
    }

    done();
  });
}

GitPlugin.$inject = [
  'emitter',
  'cssCompiler',
  'config.git',
  'config',
  'utils'
];

GitPlugin.defaults = {
  path: 'stats'
};

module.exports = GitPlugin;