var fs = require('fs');
var path = require('path');

var findCommonPrefix = require('tinydoc/lib/utils/findCommonPrefix');
var RendererUtils = require('tinydoc/lib/RendererUtils');

var parseTitle = require('./scan/parseTitle');
var strHumanize = require('./utils/strHumanize');

var pluck = require('lodash').pluck;

module.exports = function scan(config, utils, done) {
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
    var extName = path.extname(entry.filePath);

    entry.filePath = utils.getRelativeAssetPath(filePath);

    fileName = entry.filePath.split('/');
    fileName = path.basename(filePath)
      .replace(extName, '')
      .replace(/\W/g, '-')
    ;

    if (config.discardFileExtension) {
      entry.id = RendererUtils.normalizeHeading(
        filePath
          .replace(extName, '')
          .replace(commonPrefix, '')
      );
    }
    else {
      entry.id = RendererUtils.normalizeHeading(filePath.replace(commonPrefix, ''));
    }

    entry.sortingId = entry.filePath;

    entry.title = parseTitle(entry.source);
    entry.wordCount = entry.source.split(/\s+/).length;
    entry.summary = RendererUtils.extractSummary(entry.source, {
      plainText: true
    });

    if (config.generateMissingHeadings && !entry.title) {
      entry.title = strHumanize(fileName);
      entry.source = '# ' + entry.title + '\n\n' + entry.source;
    }

    entry.plainTitle = RendererUtils.markdownToText(entry.title);

    entry.fileName = fileName;
    entry.folder = path.dirname(entry.filePath);

    if (config.discardIdPrefix) {
      entry.id = entry.id.replace(config.discardIdPrefix, '');
    }
  });

  config.commonPrefix = commonPrefix;

  done(null, database);
};
