var log = require('git-log-parser');

module.exports = function(repoPath, config) {

  return new Promise(function(resolve, reject) {
    var ignore = config.ignore || [];
    delete config.ignore;

    var parse = log.parse(config, { cwd: repoPath });
    var commits = [];

    parse.on('data', function(commit) {
      var filtered = ignore.some(function(pattern) {
        return commit.subject.match(pattern);
      });

      if (!filtered) {
        commits.push(commit);
      }
    });

    parse.on('end', function(commit) {
      resolve(commits);
    });
  });
};
