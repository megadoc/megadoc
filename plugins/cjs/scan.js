var glob = require('glob');
var Logger = require('../../lib/Logger');
var doxParser = require('./parsers/DoxParser');
var parseGitStats = require('../../lib/utils/parseGitStats');
var where = require('lodash').where;

module.exports = function(config, gitRepository, utils, done) {
  var console = new Logger('cjs scanner');

  glob(utils.assetPath(config.source), { nodir: true }, function (err, files) {
    var matchedFiles;

    if (err) {
      return done(err);
    }

    matchedFiles = files.filter(function(filePath) {
      if (config.exclude) {
        return !filePath.match(config.exclude);
      }
      else {
        return true;
      }
    });

    console.log('Parsing docs from %d files (%d were filtered).',
      matchedFiles.length,
      files.length - matchedFiles.length
    );

    var database = matchedFiles.reduce(function(database, filePath) {
      return database.concat(doxParser(filePath, config));
    }, []);

    if (config.gitStats) {
      console.log("Parsing git stats...");

      Promise.all(
        matchedFiles.map(function(filePath) {
          return parseGitStats(gitRepository, filePath).then(function(stats) {
            where(database, { filePath: filePath }).forEach(function(entry) {
              entry.git = stats;
            });
          });
        })
      ).then(
        function() {
          done(null, database);
        },
        function(err) {
          done(err);
        })
      ;
    }
    else {
      done(null, database);
    }
  });
};
