#!/usr/bin/env node

var glob = require('glob');
var fs = require('fs');
var findCommonPrefix = require('../lib/utils/findCommonPrefix');
var strHumanize = require('../lib/utils/strHumanize');
var pluck = require('lodash').pluck;

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
};

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
};

function scanCollection(config, done) {
  glob(config.source, { nodir: true }, function (err, files) {
    var matchedFiles, database;

    if (err) {
      console.warn('omg');
      return;
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

    console.log(database);

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
    });

    done(database);
  });
};

module.exports = function(tiny, config/*, tinyConfig, utils*/) {
  var aggregateDatabase = {};

  config.collections.map(function(collection) {
    scanCollection(collection, function(database) {
      aggregateDatabase[collection.name] = database;

      if (Object.keys(aggregateDatabase).length === config.collections.length) {
        tiny.done(aggregateDatabase);
      }
    });
  });
};