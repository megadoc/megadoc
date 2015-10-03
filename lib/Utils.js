var path = require('path');
var fs = require('fs-extra');
var glob = require('glob');
var arrayWrap = require('./utils/arrayWrap');
var console = require('./Logger')('tinydoc');

function pathJoin(basePath, fragments) {
  return path.resolve.apply(path, [ basePath ].concat(fragments));
}

var tmpFileId = 0;

/**
 * @namespace Core
 * @module Utils
 *
 * A bunch of utilities for dealing with asset files.
 *
 * **Do not instantiate this factory directly**, instead, use the
 * [Core.Compiler@utils compiler's instance]().
 *
 * @param  {Object} config
 *         tinydoc's runtime config.
 */
module.exports = function createUtils(config) {
  var utils = {
    /**
     * Convert a relative asset path into an absolute path.
     *
     * @param  {String} relativePath
     * @return {String}
     *
     * @example
     *
     *     getAssetPath("doc/*.md");
     *     // => "/path/to/project/doc/*.md"
     */
    getAssetPath: function(/*relativePath*/) {
      return pathJoin(config.assetRoot, [].slice.call(arguments));
    },

    getPublicAssetPath: function(/*relativePath*/) {
      return path.join.apply(path, [ '/assets' ].concat([].slice.call(arguments)));
    },

    /**
     * Convert a full asset path into one relative to the asset root.
     *
     * @param  {String} absolutePath
     * @return {String}
     *
     * @example
     *
     *     getRelativeAssetPath("/path/to/project/doc/something.md");
     *     // => "doc/something.md"
     */
    getRelativeAssetPath: function(absolutePath) {
      return absolutePath.replace(config.assetRoot + '/', '');
    },

    getOutputPath: function(/*relativePath*/) {
      return pathJoin(config.outputDir, [].slice.call(arguments));
    },

    getTmpDir: function() {
      return config.tmpDir;
    },

    /**
     * Copy a local file into the destination output directory.
     *
     * @param  {String} fileName
     *         Relative path to the output file. For example, if this is a JS
     *         script you need to require, this will be relative to
     *         `index.html`.
     *
     * @param  {String|Buffer} contents
     *         The contents of the file.
     */
    writeAsset: function(fileName, contents) {
      var filePath = utils.getAssetPath(config.outputDir, fileName);
      var dirPath = path.dirname(filePath);

      fs.ensureDirSync(dirPath);
      fs.writeFileSync(filePath, contents);

      console.log('Written asset to ' + filePath);
    },

    /**
     * Write some contents to an arbitrary temporary file and get a handle to
     * its filepath.
     */
    writeTmpFile: function(contents) {
      var fileName = '.file--' + (tmpFileId++);
      var filePath = path.join(config.tmpDir, fileName);

      fs.writeFileSync(filePath, contents);

      return filePath;
    },

    /**
     * Glob a bunch of (relative) source paths for files and optionally filter
     * them.
     *
     * @param  {String|String[]} sourcePatterns
     *         Minimatch-style patterns of source files. These paths are
     *         expected to be relative to the assetRoot. See [#getAssetPath]().
     *
     * @param  {String[]|RegExp[]} rawFilters
     *         Patterns to filter the globbed file paths by.
     *
     * @return {String[]}
     *         A list of matched files.
     */
    globAndFilter: function(sourcePatterns, rawFilters) {
      var globOpts = { nodir: true };
      var files = arrayWrap(sourcePatterns).reduce(function(sources, pattern) {
        return sources.concat(glob.sync(utils.getAssetPath(pattern), globOpts));
      }, []);

      var filters = arrayWrap(rawFilters);

      return files.filter(function(filePath) {
        return !filters.some(function(filter) {
          return filePath.match(filter);
        });
      });
    },

    fs: fs,
  };

  return utils;
};
