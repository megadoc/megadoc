var glob = require('glob');
var Logger = require('../../lib/Logger');
var arrayWrap = require('../../lib/utils/arrayWrap');
var doxParser = require('./parsers/DoxParser');
var parseGitStats = require('../../lib/utils/parseGitStats');
var where = require('lodash').where;

module.exports = function(config, gitRepository, utils, done) {
  var console = new Logger('cjs scanner');
  var sourcePatterns = arrayWrap(config.source);

  var files = sourcePatterns.reduce(function(sources, pattern) {
    return sources.concat(glob.sync(utils.assetPath(pattern), { nodir: true }));
  }, []);

  var filters = arrayWrap(config.exclude || []);

  var matchedFiles = files.filter(function(filePath) {
    return !filters.some(function(filter) {
      return filePath.match(filter);
    });
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
};
