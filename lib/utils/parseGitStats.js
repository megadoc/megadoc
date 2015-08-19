var path = require('path');
var spawn = require('child_process').spawn;
var findWhere = require('lodash').findWhere;

function parseLastCommitDate(repoPath, filePath) {
  return new Promise(function(resolve, reject) {
    var git = spawn('git', [ 'log', '-1', '--format=%cd', filePath ], {
      cwd: path.dirname(repoPath)
    });

    var buffer = '';

    git.stdout.on('data', function(chunk) {
      buffer += chunk;
    });

    git.stderr.on('data', function(err) {
      reject('An error occured while parsing the last commit date for ' + filePath + ':\n' + err.toString());
    });

    git.stdout.on('end', function() {
      resolve(buffer.toString());
    });

    git.on('close', function(code) {
      if (code !== 0) {
        reject('git commit date parsing failed');
      }
      else {
        resolve();
      }
    });
  });
}

function parseAuthors(repoPath, filePath) {
  return new Promise(function(resolve, reject) {
    var git = spawn('git', [ 'blame', '-c', '-p', filePath ], {
      cwd: path.dirname(repoPath)
    });

    var buffer = '';

    git.stderr.on('data', function(err) {
      reject('An error occured while parsing git stats for ' + filePath + ':\n' + err.toString());
    });

    git.stdout.on('data', function(chunk) {
      buffer += chunk;
    });

    git.stdout.on('end', function() {
      var lines = buffer.toString().split("\n");
      var committers = [];

      lines.forEach(function(line, index) {
        var capture;
        var name, email;

        if ((capture = line.match(/committer (.*)/))) {
          name = capture[1];
          email = lines[index+1].match(/committer\-mail <(.*)>/)[1];

          if (!findWhere(committers, { email: email })) {
            committers.push({ name: name, email: email });
          }
        }
      });

      resolve(committers);
    });

    git.on('close', function(code) {
      if (code !== 0) {
        reject('git command failed');
      }
      else {
        resolve();
      }
    });
  });
}

module.exports = function(repoPath, filePath) {
  var stats = {};

  return Promise.all([
    parseAuthors(repoPath, filePath).then(function(committers) {
      stats.committers = committers;
    }),

    parseLastCommitDate(repoPath, filePath).then(function(date) {
      stats.lastCommittedAt = date;
    })
  ]).then(function() {
    return stats;
  });
};