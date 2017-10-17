const R = require('ramda');
const async = require('async');
const glob = require('glob');
const listOf = x => Array.isArray(x) ? x : [].concat(x || [])

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
module.exports = function scanSources({ include, exclude, rootDir }, done) {
  const globOptions = {
    nodir: true,
    absolute: true,
    cwd: rootDir || process.cwd(),
    ignore: listOf(exclude)
  };

  async.map(
    listOf(include),
    (sources, callback) => glob(sources, globOptions, callback),
    function(err, results) {
      if (err) {
        done(err);
      }
      else {
        done(null, R.uniq(R.flatten(results)));
      }
    }
  )
}
