const glob = require('glob');

/**
 * Glob a bunch of (relative) source paths for files and optionally filter
 * them.
 *
 * @param {?String|RegExp} pattern
 *        Minimatch-style patterns of source files.
 *
 * @param {!Array.<String|RegExp>} include
 *        Directories to search in.
 *
 * @param {?Array.<String|RegExp>} exclude
 *        Directories to exclude from or patterns to exclude by.
 *
 * @return {String[]}
 *         A list of matched files.
 */
module.exports = function globAndFilter(pattern, include, exclude) {
  const globOptions = { nodir: true };

  return include.reduce(function(fileList, sourceDir) {
    return fileList.concat(glob.sync(`${sourceDir}/**/*`, globOptions))
  }, []).filter(function(filePath) {
    if (pattern && !filePath.match(pattern)) {
      return false;
    }
    else if (exclude && exclude.some(x => filePath.match(x))) {
      return false;
    }
    else {
      return true;
    }
  });
}
