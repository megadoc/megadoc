var path = require('path');
var fs = require('fs');
var extend = require('lodash').extend;
var parseLatestActivity = require('./parseLatestActivity');
var parseHistory = require('./parseHistory');
var parseGitStats = require('./parseGitStats');
var merge = require('lodash').merge;
var partial = require('lodash').partial;
var async = require('async');
var assert = require('assert');

var defaults = require('./config');

/**
 * @namespace Plugins.Git
 *
 * @param {Config} userConfig
 */
function createGitPlugin(userConfig) {
  var stats = {
    // recentCommits: arrayOf(shape({
    // })),
    //
    // history: shape({
    //   commitCount: number,
    //
    //   people: shape({
    //     $NAME: shape({
    //       commitCount: number,
    //       email: string,
    //       firstCommitAt: number,
    //       lastCommitAt: number,
    //       name: string,
    //       reviewCount: number,
    //       superStarIndex: number
    //     })
    //   }),
    //
    //   teams: arrayOf(shape({
    //     age: number,
    //     commitCount: number,
    //     firstCommitAt: number,
    //     lastCommitAt: number,
    //     memberCount: number,
    //     name: string,
    //     reviewCount: number,
    //   }))
    // })
  };

  var config = merge({}, defaults, userConfig);

  return {
    stats: stats,

    run: function(compiler) {
      var gitRepository = config.repository || compiler.config.gitRepository;
      var files = {};

      assert(gitRepository,
        "You must specify the path to the .git repository to parse."
      );

      assert(fs.existsSync(gitRepository) && fs.statSync(gitRepository).isDirectory(),
        "The path you specified does not seem to point to a git repository directory."
      );

      compiler.corpus.visit({
        Document: function(node) {
          if (node.filePath) {
            var filePath = compiler.utils.getAssetPath(node.filePath);

            if (!files[filePath]) {
              files[filePath] = [];
            }

            files[filePath].push(node.uid);
          }
        }
      });

      compiler.on('scan', function(done) {
        async.parallel([
          partial(parseLatestActivity, gitRepository, config),
          partial(parseHistory, gitRepository, config),
        ], function(err, resultSet) {
          if (err) {
            return done(err);
          }

          stats.recentCommits = resultSet[0];
          stats.history = resultSet[1];

          done();
        });
      });

      compiler.on('render', function(md, linkify, done) {
        async.parallel([
          function(next) {
            var filePaths = Object.keys(files);

            parseGitStats(gitRepository, filePaths, function(err, allFileStats) {
              if (err) {
                return next(err);
              }

              allFileStats.forEach(function(fileStats) {
                var nodeUIDs = files[fileStats.filePath];

                nodeUIDs.forEach(function(uid) {
                  compiler.corpus.get(uid).meta.gitStats = fileStats;
                });
              });

              next();
            });
          },

          function(next) {
            stats.recentCommits.forEach(function(commit) {
              commit.renderedSubject = md('**'+commit.subject+'**');
              commit.renderedBody = commit.body && commit.body.length > 0 ?
                md(commit.body) :
                null
              ;
            });

            next();
          }
        ], done);
      });

      compiler.on('generateStats', function(compilerStats, done) {
        compilerStats['git:' + config.routeName] = {
          teamCount: stats.history.teams.length,
          peopleCount: Object.keys(stats.history.people).length,
          totalCommitCount: stats.history.commitCount,
          recentCommitCount: stats.recentCommits.length,
        };

        done();
      });

      compiler.on('write', function(done) {
        var runtimeConfig = extend({}, config, { stats: stats });

        compiler.assets.addStyleSheet(
          path.resolve(__dirname, '..', 'ui', 'css', 'index.less')
        );

        compiler.assets.addPluginScript(
          path.resolve(__dirname, '..', 'dist', 'tinydoc-plugin-git.js')
        );

        compiler.assets.addPluginRuntimeConfig('git', runtimeConfig);

        done();
      });
    }
  };
}

module.exports = createGitPlugin;