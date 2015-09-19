var Logger = require('../../lib/Logger');
var Parser = require('./Parser');
var parseGitStats = require('../../lib/utils/parseGitStats');
var findCommonPrefix = require('../../lib/utils/findCommonPrefix');
var Promise = require('bluebird');
var where = require('lodash').where;
var pluck = require('lodash').pluck;
var uniq = require('lodash').uniq;

module.exports = function scan(config, gitRepository, utils, done) {
  var database;
  var console = new Logger('cjs');
  var svc;
  var files = utils.globAndFilter(config.source, config.exclude);

  console.log('Parsing docs from %d files.', files.length);

  var commonPrefix = findCommonPrefix(files, '/');
  var parser = new Parser();

  files.forEach(function(filePath) {
    parser.parseFile(filePath, config, commonPrefix);
  });

  parser.postProcess();
  database = parser.toJSON();

  svc = generateLiveExamples(database, config);

  if (config.gitStats) {
    console.log("Parsing git stats...");

    // cuz some files might have been filtered, so stat only what we actually
    // parsed
    var filePaths = uniq(pluck(database, 'filePath'));

    svc = svc.then(function() {
      parseGitStats(gitRepository, filePaths).then(function(stats) {
        stats.forEach(function(fileStats) {
          where(database, { filePath: fileStats.filePath }).forEach(function(entry) {
            entry.git = fileStats;
          });
        })
      });
    });
  }

  svc.then(function() { done(null, database); }, done);
};

function generateLiveExamples(database, config) {
  var entries = database.reduce(function(entries, doc) {
    doc.tags.forEach(function(tag) {
      if (tag.type === 'live_example') {
        entries.push({ tag: tag, doc: doc });
      }
    });

    return entries;
  }, []);

  if (entries.length === 0) {
    return Promise.resolve();
  }

  console.log('Processing ' + entries.length + ' @live_example tags.');

  return new Promise(function(resolve, reject) {
    function processTag(cursor) {
      var entry = entries[cursor];

      if (!entry) {
        return resolve();
      }

      var tag = entry.tag;
      var doc = entry.doc;

      var exampleType = tag.typeInfo.types[0];
      var processor = config.liveExamples[exampleType];

      if (processor) {
        processor(tag.string, doc, function(err, code) {
          if (err) {
            return reject(err);
          }

          tag.code = code;

          processTag(cursor + 1);
        });
      }
      else {
        console.warn('Found no processor for @live_example of type ' + exampleType);
        processTag(cursor + 1);
      }
    }

    processTag(0);
  });
}