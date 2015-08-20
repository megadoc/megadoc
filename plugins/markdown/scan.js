var glob = require('glob');
var fs = require('fs');
var findCommonPrefix = require('../../lib/utils/findCommonPrefix');
var strHumanize = require('../../lib/utils/strHumanize');
var pluck = require('lodash').pluck;
var uniq = require('lodash').uniq;
var where = require('lodash').where;
var console = require('../../lib/Logger')('markdown');
var parseGitStats = require('../../lib/utils/parseGitStats');
var parseTitle = require('./scan/parseTitle');
var parseSections = require('./scan/parseSections');

function scanCollection(collectionConfig, utils, markdownConfig, globalConfig, done) {
  var pattern = utils.assetPath(collectionConfig.source);
  var filters = collectionConfig.exclude || [];

  if (!Array.isArray(filters)) {
    filters = [ filters ];
  }

  glob(pattern, { nodir: true }, function (err, files) {
    var matchedFiles, database;

    if (err) {
      console.error(err);
      return done(err, null);
    }

    if (filters.length) {
      matchedFiles = files.filter(function(fileName) {
        return !filters.some(function(filter) {
          return fileName.match(filter);
        });
      });
    }

    database = matchedFiles.map(function(filePath) {
      return {
        filePath: filePath,
        source: fs.readFileSync(filePath, 'utf-8')
      };
    }, []);

    var commonPrefix = findCommonPrefix(pluck(database, 'filePath'));
    var id;

    database.forEach(function(entry) {
      if (commonPrefix && commonPrefix.length) {
        id = entry.filePath.replace(commonPrefix, '');
      }
      else {
        id = entry.filePath;
      }

      var fileName = entry.filePath.replace(commonPrefix || '', '').split('/');
      fileName = fileName[fileName.length-1].replace(/\.[\w]{1,3}$/, '').replace(/\W/g, '-');

      // remove the extension
      entry.id = id.replace(/\.[\w]{1,3}$/, '').replace(/\W/g, '-');
      entry.title = parseTitle(entry.source, fileName);
      entry.sections = parseSections(entry.source);
      entry.folder = strHumanize(
        id.indexOf('/') > -1 ?
          id.split('/')[0] :
          'root'
      );
    });

    console.debug(JSON.stringify(database.map(function(e) { return e.id; })));

    var svc = Promise.resolve();

    if (markdownConfig.gitStats) {
      console.log("Parsing git stats...");

      var filePaths = uniq(pluck(database, 'filePath'));

      svc = parseGitStats(globalConfig.gitRepository, filePaths).then(function(stats) {
        stats.forEach(function(fileStats) {
          where(database, { filePath: fileStats.filePath }).forEach(function(entry) {
            entry.git = fileStats;
          });
        });
      });
    }

    svc.then(function() { done(null, database); }, done);
  });
}

module.exports = function(config, utils, globalConfig, done) {
  var aggregateDatabase = {};

  config.collections.map(function(collection) {
    scanCollection(collection, utils, config, globalConfig, function(err, database) {
      if (err) {
        done(err);
      }
      else {
        aggregateDatabase[collection.name] = database;

        if (Object.keys(aggregateDatabase).length === config.collections.length) {
          done(null, aggregateDatabase);
        }
      }
    });
  });
};