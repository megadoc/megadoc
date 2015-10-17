var fs = require('fs');
var path = require('path');
var findCommonPrefix = require('../../lib/utils/findCommonPrefix');
var pluck = require('lodash').pluck;
var uniq = require('lodash').uniq;
var where = require('lodash').where;
var console = require('../../lib/Logger')('markdown');
var parseGitStats = require('../../lib/utils/parseGitStats');
var parseTitle = require('./scan/parseTitle');
var Promise = require('bluebird');
var normalizeHeading = require('../../lib/Renderer/Utils').normalizeHeading;
var strHumanize = require('../../lib/utils/strHumanize');

function scan(config, utils, globalConfig, done) {
  var files = utils.globAndFilter(config.source, config.exclude);
  var database = files.map(function(filePath) {
    return {
      filePath: filePath,
      source: fs.readFileSync(filePath, 'utf-8')
    };
  }, []);

  var commonPrefix = findCommonPrefix(pluck(database, 'filePath'), '/');

  database.forEach(function(entry) {
    var fileName;
    var filePath = entry.filePath;

    entry.filePath = utils.getRelativeAssetPath(filePath);

    fileName = entry.filePath.split('/');
    fileName = fileName[fileName.length-1]
      .replace(/\.[\w]{1,3}$/, '')
      .replace(/\W/g, '-')
    ;

    entry.id = normalizeHeading(filePath.replace(commonPrefix, ''));
    entry.sortingId = entry.filePath;

    entry.title = parseTitle(entry.source);

    if (config.generateMissingHeadings && !entry.title) {
      entry.title = strHumanize(fileName);
      entry.source = '# ' + entry.title + '\n\n' + entry.source;
    }

    entry.plainTitle = normalizeHeading(entry.title);

    entry.fileName = fileName;
    entry.folder = path.dirname(entry.filePath);

    if (config.discardIdPrefix) {
      entry.id = entry.id.replace(config.discardIdPrefix, '');
    }
  });

  config.commonPrefix = commonPrefix;

  var svc = Promise.resolve();

  if (config.gitStats) {
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
}

module.exports = function(config, utils, globalConfig, done) {
  scan(config, utils, globalConfig, function(err, database) {
    if (err) {
      done(err);
    }
    else {
      done(null, database);
    }
  });
};