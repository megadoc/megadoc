var Logger = require('../../lib/Logger');
var Parser = require('./Parser');
var parseGitStats = require('../../lib/utils/parseGitStats');
var findCommonPrefix = require('../../lib/utils/findCommonPrefix');
var Promise = require('bluebird');
var where = require('lodash').where;
var pluck = require('lodash').pluck;
var uniq = require('lodash').uniq;

module.exports = function(config, gitRepository, utils, done) {
  var database;
  var console = new Logger('cjs');
  var svc = Promise.resolve();
  var files = utils.globAndFilter(config.source, config.exclude);

  console.log('Parsing docs from %d files.', files.length);

  var commonPrefix = findCommonPrefix(files, '/');
  var parser = new Parser();

  files.forEach(function(filePath) {
    parser.parseFile(filePath, config, commonPrefix);
  });

  parser.postProcess();
  database = parser.toJSON();

  if (config.gitStats) {
    console.log("Parsing git stats...");

    // cuz some files might have been filtered, so stat only what we actually
    // parsed
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
