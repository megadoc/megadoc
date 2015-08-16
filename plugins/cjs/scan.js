var glob = require('glob');
var Logger = require('../../lib/Logger');
var doxParser = require('./parsers/DoxParser');

module.exports = function(config, utils, done) {
  var console = new Logger('cjs scanner');

  glob(utils.assetPath(config.source), { nodir: true }, function (err, files) {
    var matchedFiles;

    if (err) {
      return done(err);
    }

    matchedFiles = files.filter(function(filePath) {
      if (config.exclude) {
        return !filePath.match(config.exclude);
      }
      else {
        return true;
      }
    });

    console.log('Parsing docs from %d files (%d were filtered).',
      matchedFiles.length,
      files.length - matchedFiles.length
    );

    var entries = matchedFiles.reduce(function(entries, filePath) {
      return entries.concat(doxParser(filePath, config));
    }, []);

    done(null, entries);
  });
};
