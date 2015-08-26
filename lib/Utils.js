var path = require('path');
var fs = require('fs-extra');
var glob = require('glob');
var arrayWrap = require('./utils/arrayWrap');
var console = require('./Logger')('tinydoc');

module.exports = function(config) {
  return {
    assetPath: function(relativePath) {
      if (arguments.length > 1) {
        var fragments = [].slice.call(arguments);
        fragments.unshift(config.assetRoot);
        return path.resolve.apply(path, fragments);
      }

      return path.resolve(config.assetRoot, relativePath);
    },

    writeAsset: function(fileName, contents) {
      var filePath = this.assetPath(config.outputDir, fileName);
      var dirPath = path.dirname(filePath);

      fs.ensureDirSync(dirPath);
      fs.writeFileSync(filePath, contents);

      console.log('Written asset to ' + filePath);
    },

    /**
     * Glob a bunch of source paths for files and optionally filter them.
     *
     * @param  {String|String[]} sourcePatterns
     *         Minimatch-style patterns of source files. These paths are
     *         expected to be relative to the assetRoot. See [#assetPath]().
     *
     * @param  {String[]|RegExp[]} rawFilters
     *         Patterns to filter the globbed file paths by.
     *
     * @return {String[]}
     *         A list of matched files.
     */
    globAndFilter: function(sourcePatterns, rawFilters) {
      var utils = this;
      var files = arrayWrap(sourcePatterns).reduce(function(sources, pattern) {
        return sources.concat(glob.sync(utils.assetPath(pattern), { nodir: true }));
      }, []);

      var filters = arrayWrap(rawFilters);

      return files.filter(function(filePath) {
        return !filters.some(function(filter) {
          return filePath.match(filter);
        });
      });
    }
  };
};
