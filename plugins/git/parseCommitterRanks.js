var path = require('path');
var exec = require('child_process').exec;
var findWhere = require('lodash').findWhere;

function parseCommitterRanks(repoPath) {
  return new Promise(function(resolve, reject) {
    var git = exec('git shortlog --summary --numbered --email < /dev/tty', {
      cwd: repoPath
    });

    git.stdout.on('data', function(buffer) {
      var leaderboard = buffer.toString().trim().split("\n").map(function(line) {
        var columns = line.match(/^\s*(\d+)\s+(.+)\s<([^>]+)>$/);

        return {
          commitCount: parseInt(columns[1], 10),
          name: columns[2],
          email: columns[3]
        };
      });

      resolve(leaderboard);
    });

    git.stderr.on('data', function(err) {
      reject('An error occured while parsing the commit history:\n' + err.toString());
    });

    git.on('close', function(code) {
      if (code !== 0) {
        reject('git commit history parsing failed mysteriously');
      }
      else {
        resolve();
      }
    });
  });
}

module.exports = parseCommitterRanks;