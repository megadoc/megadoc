var glob = require('glob');
var fs = require('fs');
var findCommonPrefix = require('../../lib/utils/findCommonPrefix');
var strHumanize = require('../../lib/utils/strHumanize');
var pluck = require('lodash').pluck;
var console = require('../../lib/Logger')('markdown');

var RE_EXTRACT_TITLE = /^(#{2,3})\s+([^\n]+)|^([^\n]+)\n([\-]{3,})\n/gm;

function scanForTitle(article, id) {
  var hashTitleMatcher = article.match(/^\#\s([^\n]+)/);

  if (hashTitleMatcher) {
    return hashTitleMatcher[1];
  }
  else {
    var strokedTitleMatcher = article.match(/^([^\n]+)\n[\=]{3,}\n/m);

    if (strokedTitleMatcher) {
      return strokedTitleMatcher[1];
    }
    else {
      return strHumanize(id);
    }
  }
}

function scanForSections(article) {
  var sections = [];

  article.replace(RE_EXTRACT_TITLE, function(match, hLevel, hTitle, sTitle, sSymbol) {
    if (hLevel && hTitle) {
      sections.push({
        level: hLevel.length,
        title: hTitle
      });
    }
    else if (sTitle && sSymbol) {
      sections.push({
        level: 2,
        title: sTitle
      });
    }

    return match;
  });

  return sections;
}

function scanCollection(config, utils, done) {
  var pattern = utils.assetPath(config.source);

  glob(pattern, { nodir: true }, function (err, files) {
    var matchedFiles, database;

    if (err) {
      console.error(err);
      return done(err, null);
    }

    matchedFiles = files.filter(function(fileName) {
      if (config.exclude) {
        return !fileName.match(config.exclude);
      }
      else {
        return true;
      }
    });

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

      // remove the extension
      entry.id = id.replace(/\.[\w]{1,3}$/, '').replace(/\W/g, '-');
      entry.title = scanForTitle(entry.source, entry.id);
      entry.sections = scanForSections(entry.source);
      entry.folder = strHumanize(
        id.indexOf('/') > -1 ?
          id.split('/')[0] :
          'root'
      );

      console.log(JSON.stringify({
        id: entry.id,
        title: entry.title,
        folder: entry.folder,
        filePath: entry.filePath
      }));
    });

    done(null, database);
  });
}

module.exports = function(config, utils, done) {
  var aggregateDatabase = {};

  config.collections.map(function(collection) {
    scanCollection(collection, utils, function(err, database) {
      if (err) {
        done(err);
      }
      else {
        aggregateDatabase[collection.name] = database;

        if (Object.keys(aggregateDatabase).length === config.collections.length) {
          done();
        }
      }
    });
  });
};