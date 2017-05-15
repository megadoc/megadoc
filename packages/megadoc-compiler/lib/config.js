var os = require('os');

/**
 * @module Config
 * @preserveOrder
 */
module.exports = {
  /**
   * @property {String} [assetRoot]
   *
   * Absolute path to the root directory from which all files should be located.
   * This is automatically set to the directory containing megadoc.conf.js when
   * you run the compiler.
   */
  assetRoot: null,

  /**
   * @property {String} outputDir
   *
   * Path to where the built assets (index.html and friends) will be saved to.
   *
   * Note that most scanner plugins will implicitly use this path to save their
   * own assets so that they're accessible relative from the index.html entry
   * file.
   */
  outputDir: 'doc/compiled',

  tmpDir: os.tmpdir(),

  lintRules: {},

  debug: false,
  strict: false,
  verbose: false,
  serializer: null,
  sources: null,
};
