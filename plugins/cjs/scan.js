var Logger = require('../../lib/Logger');
var DoxParser = require('./parsers/DoxParser');
var parseGitStats = require('../../lib/utils/parseGitStats');
var Promise = require('bluebird');
var where = require('lodash').where;
var pluck = require('lodash').pluck;
var uniq = require('lodash').uniq;


module.exports = function(config, gitRepository, utils, done) {
  var database;
  var console = new Logger('cjs scanner');
  var svc = Promise.resolve();
  var files = utils.globAndFilter(config.source, config.exclude);

  console.log('Parsing docs from %d files.', files.length);

  database = files.reduce(function(docs, filePath) {
    return docs.concat(DoxParser.parseFile(filePath, config));
  }, []);

  DoxParser.postProcess(database);

  if (config.gitStats) {
    console.log("Parsing git stats...");

    // cuz some files might have been filtered, we don't want to use
    // files - stat only what we actually parsed
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
