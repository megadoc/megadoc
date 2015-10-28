var path = require('path');
var fs = require('fs');
var extend = require('lodash').extend;
var parseLatestActivity = require('./parseLatestActivity');
var render = require('./render');
var parseHistory = require('./parseHistory');
var console = require('../../lib/Logger')('git');
var merge = require('lodash').merge;
var runAll = require('../../lib/utils/runAll');
var assert = require('assert');

var defaults = require('./config');

/**
 * @namespace Plugins.Git
 *
 * @param {Config} userConfig
 */
function createGitPlugin(userConfig) {
  var stats = {};
  var config = merge({}, defaults, userConfig);

  return {
    stats: stats,

    run: function(compiler) {
      var gitRepository = config.repository || compiler.config.gitRepository;

      assert(gitRepository,
        "You must specify the path to the .git repository to parse."
      );

      assert(fs.existsSync(gitRepository) && fs.statSync(gitRepository).isDirectory(),
        "The path you specified does not seem to point to a git repository directory."
      );

      compiler.on('scan', function(done) {
        runAll([ parseLatestActivity, parseHistory, ], [ gitRepository, config ], function(err, resultSet) {
          if (err) {
            return done(err);
          }

          stats.recentCommits = resultSet[0];
          stats.history = resultSet[1];

          done();
        });
      });

      compiler.on('render', function(md, linkify, done) {
        render(stats, md, linkify);
        done();
      });

      compiler.on('write', function(done) {
        var runtimeConfig = extend({}, config, { stats: stats });

        compiler.assets.addStyleSheet(path.resolve(__dirname, 'ui', 'css', 'index.less'));
        compiler.assets.addPluginScript(
          path.resolve(__dirname, 'ui/dist/tinydoc-plugin-git.js')
        );
        compiler.assets.addPluginRuntimeConfig('git', runtimeConfig);

        done();
      });
    }
  };
}

module.exports = createGitPlugin;