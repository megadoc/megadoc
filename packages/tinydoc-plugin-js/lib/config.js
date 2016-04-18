/**
 * @module Config
 * @preserveOrder
 */
module.exports = {
  /**
   * @property {String}
   *           The relative URL to reach the JavaScript documentation at.
   *           A value of `"js"` would make the modules available at `/js`.
   */
  routeName: 'js',

  /**
   * @property {String[]} source
   *
   * A list of patterns to match the source files to parse.
   */
  source: [ '**/*.js' ],

  /**
   * @property {String[]}
   *
   * A list of patterns to exclude source files.
   */
  exclude: null,

  /**
   * @property {Boolean}
   *
   * Turn this on if you want to extract git stats for the files, like
   * the last commit timestamp and the authors of each file.
   *
   * This is needed if you want to use the "Hot Items" feature.
   */
  gitStats: false,

  /**
   * @property {Boolean}
   *
   * Turn this on if you want to use the file's folder name as its namespace.
   * This will be used only if the source file defines no @namespace tag.
   */
  useDirAsNamespace: true,

  inferModuleIdFromFileName: true,

  /**
   * @property {Function}
   *
   * You can implement this function if you need to perform any custom
   * decoration or transformation on a source file's doc entry.
   *
   * The parameter you receive is a Dox construct. Please refer to its
   * documentation for how that looks like.
   */
  analyzeNode: null,

  customTags: {},

  /**
   * @property {Boolean}
   *
   * Whether to show the file path the module was defined in.
   */
  showSourcePaths: true,

  sortModulesAlphabetically: true,

  verbose: false,

  corpusContext: 'JS',

  alias: {},

  parse: null,
  parserOptions: null,

  namespaceDirMap: {},
};