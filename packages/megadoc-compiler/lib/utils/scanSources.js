const glob = require('glob');
const wrapArray = require('./wrapArray');
const R = require('ramda')

/**
 * Glob a bunch of (relative) source paths for files and optionally filter
 * them.
 *
 * @param {!Array.<String|RegExp>} include
 *        Minimatch patterns of files to include.
 *
 * @param {?Array.<String|RegExp>} exclude
 *        Minimatch patterns of directories (or files) to exclude. These take
 *        precedence over inclusion rules.
 *
 * @return {String[]}
 *         A list of matched files.
 */
module.exports = function globAndFilter(pattern, include, exclude, rootDir) {
  const globOptions = {
    nodir: true,
    absolute: true,
    cwd: rootDir || process.cwd(),
    ignore: wrapArray(exclude)
  };

  return R.uniq(wrapArray(include).reduce(function(fileList, sourceEntry) {
    return fileList.concat(glob.sync(sourceEntry, globOptions))
  }, []));
}
