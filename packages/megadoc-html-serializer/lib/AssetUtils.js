var path = require('path');
var fs = require('fs-extra');

function pathJoin(basePath, fragments) {
  return path.resolve.apply(path, [ basePath ].concat(fragments));
}

/**
 * @module AssetUtils
 *
 * A bunch of utilities for dealing with asset files.
 *
 * @param {Object} config
 *        [[megadoc-compiler config | packages/megadoc-compiler/lib/config.js]].
 */
module.exports = function AssetUtils(config) {
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

    getOutputPath: function(/*relativePath*/) {
      return pathJoin(config.outputDir, [].slice.call(arguments));
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

      if (fs.existsSync(filePath)) {
        if (fs.statSync(filePath).isDirectory()) {
          console.error(
            "ERROR: you are attempting to overwrite a directory destination! " +
            "This is most likely a configuration error, like using a rewrite " +
            "condition.\n\n" +
            "Destination: " + filePath
          );

          return 'ERR_FILE_EXISTS';
        }

        if (config.verbose) {
          console.warn("Overwriting existing asset at '%s'...", filePath);
        }
      }

      if (fs.existsSync(dirPath) && !fs.statSync(dirPath).isDirectory()) {
        console.error(
          "ERROR: A file exists at '%s' but is NOT a directory - it is not " +
          "possible to write to '%s'.",
          dirPath, filePath
        );

        return 'ERR_NOT_WRITABLE';
      }

      fs.ensureDirSync(dirPath);
      fs.writeFileSync(filePath, contents);

      if (config.verbose) {
        console.log('Written asset to ' + filePath);
      }
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
    removeAsset: function(fileName, callback) {
      const filePath = utils.getAssetPath(config.outputDir, fileName);

      if (fs.existsSync(filePath)) {
        fs.remove(filePath, callback);
      }
      else {
        callback();
      }
    },

    fs: fs,
  };

  return utils;
};

function arrayWrap(value) {
  return Array.isArray(value) ? value : value !== undefined ? [ value ] : [];
}

module.exports.arrayWrap = arrayWrap;