var log = require('git-log-parser');
var omit = require('lodash').omit;
var IDENTITY = function(v) { return v; };

var NON_PARSE_KEYS = [ 'ignore', 'transform' ];

module.exports = function(repoPath, pluginConfig, done) {
  var config = pluginConfig.recentCommits;
  var ignore = config.ignore || [];
  var transform = config.transform || IDENTITY;

  var parse = log.parse(omit(config, NON_PARSE_KEYS), { cwd: repoPath });
  var commits = [];


  parse.on('data', function(commit) {
    var filtered = ignore.some(function(pattern) {
      return commit.subject.match(pattern);
    });

    if (!filtered) {
      commit.body = transform(commit.body);
      commits.push(commit);
    }
  });

  parse.on('end', function() {
    done(null, commits);
  });

  parse.on('error', done);
  parse.on('close', function(exitCode) {
    if (exitCode !== 0) {
      done('parsing latest git activity failed with exit code ' + exitCode);
    }
  });
};
