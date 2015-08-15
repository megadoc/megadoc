var log = require('git-log-parser');

module.exports = function(repoPath, config) {
  return new Promise(function(resolve, reject) {
    var parse = log.parse(config, { cwd: repoPath });
    var commits = [];

    parse.on('data', function(commit) {
      commits.push(commit);
    });

    parse.on('end', function(commit) {
      resolve(commits);
    });
  });
}
