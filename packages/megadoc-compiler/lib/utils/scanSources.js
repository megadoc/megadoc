const glob = require('glob');
const wrapArray = require('./wrapArray');
const R = require('ramda')

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
module.exports = function globAndFilter(pattern, include, _exclude, rootDir) {
  const globOptions = { nodir: true, absolute: true, cwd: rootDir || process.cwd() };
  const exclude = wrapArray(_exclude);

  return R.uniq(
    wrapArray(include)
      .reduce(function(fileList, sourceEntry) {
        return fileList.concat(glob.sync(sourceEntry, globOptions))
      }, [])
      .filter(function(filePath) {
        if (pattern && !filePath.match(pattern)) {
          return false;
        }
        else if (exclude && exclude.some(x => filePath.match(x))) {
          return false;
        }
        else {
          return true;
        }
      })
  );
}
