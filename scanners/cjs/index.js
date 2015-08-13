#!/usr/bin/env node

var glob = require('glob');
var Logger = require('../../lib/Logger');
var DoxParser = require('./parsers/DoxParser');

module.exports = function(tiny, config, tinyConfig/*, utils*/) {
  var console = new Logger('cjs scanner');
  var doxParser = new DoxParser();

  glob(tinyConfig.root + '/' + config.source, { nodir: true }, function (err, files) {
    var matchedFiles;

    if (err) {
      console.warn('omg');
      return;
    }

    matchedFiles = files.filter(function(filePath) {
      if (config.exclude) {
        return !filePath.match(config.exclude);
      }
      else {
        return true;
      }
    });

    console.log('Parsing docs from %d files (%d filtered).',
      matchedFiles.length,
      files.length - matchedFiles.length
    );

    var entries = matchedFiles.reduce(function(entries, filePath) {
      return entries.concat(doxParser.parse(filePath));
    }, []);

    tiny.done(entries);
  });
};
