var glob = require('glob');
var Logger = require('../../lib/Logger');
var arrayWrap = require('../../lib/utils/arrayWrap');
var DoxParser = require('./parsers/DoxParser');
var parseGitStats = require('../../lib/utils/parseGitStats');
var Promise = require('bluebird');
var where = require('lodash').where;
var pluck = require('lodash').pluck;
var uniq = require('lodash').uniq;

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
    return database.concat(DoxParser.parseFile(filePath, config));
  }, []);

  DoxParser.postProcess(database);

  var svc = Promise.resolve();

  if (config.gitStats) {
    console.log("Parsing git stats...");

    // cuz some files might have been filtered, we don't want to use
    // matchedFiles - stat only what we actually parsed
    var filePaths = uniq(pluck(database, 'filePath'));

    svc = parseGitStats(gitRepository, filePaths).then(function(stats) {
      stats.forEach(function(fileStats) {
        where(database, { filePath: fileStats.filePath }).forEach(function(entry) {
          entry.git = fileStats;
        });
      })
    });
  }

  svc.then(function() { done(null, database); }, done);
};
