var Parser = require('./Parser');
var parseGitStats = require('tinydoc/lib/utils/parseGitStats');
var where = require('lodash').where;
var pluck = require('lodash').pluck;
var uniq = require('lodash').uniq;

module.exports = function scan(params, done) {
  var config = params.config;
  var parserConfig = params.parserConfig;
  var gitRepository = params.gitRepository;
  var utils = params.utils;
  var database;
  var files = utils.globAndFilter(config.source, config.exclude);

  if (config.verbose) {
    console.log('tinydoc-plugin-js[%s]: Parsing docs from %d files.', config.routeName, files.length);
  }

  var parser = new Parser();

  files.forEach(function(filePath) {
    parser.parseFile(filePath, parserConfig, params.assetRoot);
  });

  parser.seal(parserConfig);

  database = parser.toJSON();

  if (parserConfig.postProcessors) {
    parserConfig.postProcessors.forEach(function(postProcessor) {
      postProcessor(database);
    });
  }

  if (config.gitStats) {
    console.log("Parsing git stats...");

    // cuz some files might have been filtered, so stat only what we actually
    // parsed
    var filePaths = uniq(pluck(database, 'filePath'));

    parseGitStats(gitRepository, filePaths, function(err, stats) {
      if (err) {
        return done(err);
      }

      stats.forEach(function(fileStats) {
        where(database, { filePath: fileStats.filePath }).forEach(function(entry) {
          entry.git = fileStats;
        });
      });

      done(null, database);
    });
  }
  else {
    done(null, database);
  }
};
