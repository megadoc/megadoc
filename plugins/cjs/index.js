var path = require('path');
var scan = require('./scan');
var indexEntities = require('./indexEntities');
var generateStats = require('./generateStats');
var merge = require('lodash').merge;
var assert = require('assert');

/**
 * @module Plugins.CJS.Config
 * @preserveOrder
 */
var defaults = {
  /**
   * @property {String}
   *           The relative URL to reach the JavaScript documentation at.
   *           A value of `"js"` would make the modules available at `/js`.
   */
  routeName: 'js',

  /**
   * @property {String}
   *           Text to use for the navigation link.
   */
  navigationLabel: 'JavaScripts',

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
};

/**
 * @namespace Plugins.CJS
 *
 * @param {Plugins.CJS.Config} userConfig
 */
function createCJSPlugin(userConfig) {
  var config = merge({}, defaults, userConfig);
  var parserConfig = {
    inferModuleIdFromFilename: config.inferModuleIdFromFilename,
    customTags: config.customTags,
    nodeAnalyzers: [],
    docstringProcessors: [],
    postProcessors: [],
  };

  return {
    name: 'CJSPlugin',

    defineCustomTag: function(tagName, definition) {
      assert(!parserConfig.customTags.hasOwnProperty(tagName),
        "Tag '" + tagName + "' already has a definition!"
      );

      parserConfig.customTags[tagName] = definition;
    },

    addNodeAnalyzer: function(analyzer) {
      parserConfig.nodeAnalyzers.push(analyzer);
    },

    addDocstringProcessor: function(processor) {
      parserConfig.docstringProcessors.push(processor);
    },

    addPostProcessor: function(postProcessor) {
      parserConfig.postProcessors.push(postProcessor);
    },

    run: function(compiler) {
      var database;

      compiler.on('scan', function(done) {
        scan(config, parserConfig, compiler.config.gitRepository, compiler.utils, function(err, _database) {
          if (err) {
            return done(err);
          }

          database = _database;
          done();
        });
      });

      compiler.on('index', function(registry, done) {
        indexEntities(database).forEach(function(index) {
          registry.add(index.path, index.index);
        });

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        stats[config.routeName] = generateStats(database);
        done();
      });

      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(path.resolve(__dirname, 'ui', 'css', 'index.less'));
        compiler.assets.addPluginScript('plugins/cjs.js');
        compiler.assets.addPluginRuntimeConfig('cjs', merge({}, config, {
          database: database
        }));

        done();
      });
    }
  };
}

module.exports = createCJSPlugin;