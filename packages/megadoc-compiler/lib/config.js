/**
 * @module Config
 *
 * Megadoc compiler configuration.
 *
 * @typedef {Config~Tuple}
 *
 * The "tuple" value is used anywhere a plugin can be specified. The value may
 * either be a string - the name of the plugin - or an array of that string
 * followed by the configuration object.
 *
 * This pattern is commonly found in megadoc's configuration, so anywhere a
 * tuple is referenced, you know you can supply either value.
 *
 * For example:
 *
 *     { processor: 'megadoc-plugin-markdown' },
 *
 *     {
 *       processor: [ 'megadoc-plugin-markdown', {
 *         // plugin options go here
 *       }]
 *     }
 */
module.exports = {
  /**
   * @property {String}
   *
   * Absolute path to the root directory from which all files should be located.
   * When omitted, this is set to the directory containing megadoc.conf.js when
   * you run the compiler.
   */
  assetRoot: null,

  /**
   * @property {String}
   *
   * Path to where the built assets (index.html and friends) will be saved to.
   */
  outputDir: 'doc/compiled',

  /**
   * @property {String}
   *
   * Path to where megadoc will get to store any intermediary build files.
   * By default, we let the OS give us a directory.
   */
  tmpDir: null,

  /**
   * @property {Object}
   *
   * Linting rules. With this interface, you can disable certain rules as
   * needed by setting them to `0`.
   *
   * For example, to turn off the `js/no-orphans` rule:
   *
   *     {
   *       lintRules: {
   *         'js/no-orphans': 0
   *       }
   *     }
   */
  lintRules: {},

  /**
   * @property {Number}
   *
   * How often (in milliseconds) should the linter check for messages to be
   * printed to the console.
   *
   * Normally, you wouldn't have to care about this.
   */
  lintReportingFrequency: 50,

  /**
   * @property {Boolean}
   *
   * Enable this to get diagnostic information printed to the console. But this
   * may get too noisy.
   */
  verbose: false,

  /**
   * @property {Config~Serializer}
   *
   * The output serializer to use, like HTML. See the list of available
   * serializer plugins.
   *
   * @typedef {Config~Serializer}
   *
   *
   */
  serializer: null,

  /**
   * @property {Array.<Config~Source>}
   *
   * @typedef {Config~Source}
   *
   * A set of files to be processed into documentation by a specific [[processor
   * | ~Processor]].
   *
   * @property {String?} id
   *
   * A unique identifier for this source that can be used for [[linking |
   * doc/usage/linking.md]]. When omitted, megadoc will generate a unique
   * identifier if you don't need this functionality (e.g. to link using
   * filepaths only.)
   *
   * @property {Array.<Glob>} include
   *
   * The set of files to process. Example value:
   *
   *     [
   *       'lib/*.js',
   *       'addon/**\/*.js'
   *     ]
   *
   * @property {Array.<Glob>} exclude
   *
   * Files *not* to process. This takes precedence over the included files.
   * The structure is similar.
   *
   * @property {Config~Processor} processor
   *
   * The processor plugin to use. See the available plugins.
   *
   * @property {Array.<Config~Decorator>} decorators
   *
   * Decorator plugins to apply to the parsed source files, like parsing git
   * meta information for example. See the available plugins.
   *
   * @typedef {Config~Processor}
   * @type {String|Array.<String,Object>}
   *
   * The plugin to use for producing documentation from source files.
   *
   * The structure can either be a simple string with the name of the plugin if
   * you don't need to configure it, otherwise it's an array with the name of
   * the plugin followed by an object containing the configuration.
   *
   * For example:
   *
   *     // no configuration
   *     {
   *       processor: 'megadoc-plugin-js'
   *     }
   *
   *     {
   *       processor: [ 'megadoc-plugin-js', {
   *         // plugin configuration goes here:
   *         title: ':allthethings:'
   *       }]
   *     }
   *
   *
   * @typedef {Config~Decorator}
   *
   * A plugin to use for adding meta-data to the processed documents.
   *
   * Similar to the [[processor | ~Processor]], here you get to enable any
   * number of decorators to be applied to the source.
   *
   *     {
   *       decorators: [
   *         'megadoc-git-stats',
   *
   *         [ 'megadoc-html-dot', {
   *           fontSize: 16
   *         }],
   *
   *         'megadoc-plugin-reference-graph'
   *       ]
   *     }
   */
  sources: null,

  threads: 1,
  concurrency: 5,

  corpus: {
    alias: {},
    anchoredFilePathIndices: true
  }
};
