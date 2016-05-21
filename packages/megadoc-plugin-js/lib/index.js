var path = require('path');
var scan = require('./scan');
var generateStats = require('./generateStats');
var render = require('./render');
var assign = require('lodash').assign;
var assert = require('assert');
var defaults = require('./config');
var reduceDocuments = require('./reduce');

/**
 * @param {Config} userConfig
 */
function Plugin(userConfig) {
  var config = assign({}, defaults, userConfig);
  var parserConfig = {
    inferModuleIdFromFileName: config.inferModuleIdFromFileName,
    customTags: config.customTags,
    namespaceDirMap: config.namespaceDirMap,
    alias: config.alias,
    parse: config.parse,
    parserOptions: config.parserOptions,
    namedReturnTags: config.namedReturnTags,
    nodeAnalyzers: [],
    docstringProcessors: [],
    tagProcessors: [],
    postProcessors: [],
  };

  assert(typeof config.id === 'string',
    "You must specify an @id to the megadoc-plugin-js plugin."
  );

  var plugin = {
    id: config.id,

    name: 'megadoc-plugin-js',

    /**
     * Add a custom-tag definition.
     *
     * @param {String} tagName
     * @param {Object} definition
     *
     * @param {String[]} definition.attributes
     *           A whitelist of all the custom attributes the tag defines.
     *
     *           Attempting to define an attribute that is not listed here
     *           will raise an error.
     *
     * @param {Boolean} [definition.withTypeInfo=false]
     *           Whether the tag is expected to have type info, like:
     *
     *               @tag {types} [name=defaultValue]
     */
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

    addTagProcessor: function(processor) {
      parserConfig.tagProcessors.push(processor);
    },

    addPostProcessor: function(postProcessor) {
      parserConfig.postProcessors.push(postProcessor);
    },

    run: function(compiler) {
      var database;
      var documents;

      compiler.on('scan', function(done) {
        scan({
          config: config,
          parserConfig: parserConfig,
          utils: compiler.utils,
          assetRoot: compiler.config.assetRoot,
        }, function(err, _documents) {
          if (err) {
            return done(err);
          }

          documents = _documents;
          database = reduceDocuments({
            documents: documents,
            namespaceId: config.id,
            namespaceTitle: config.title || config.corpusContext,
            baseURL: config.url,
            config: config
          });

          compiler.corpus.add(database);

          done();
        });
      });

      compiler.on('render', function(renderMarkdown, linkify, done) {
        render(compiler, database, renderMarkdown, linkify, config);

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        stats['js:' + config.id] = generateStats(database);

        done();
      });

      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(
          path.resolve(__dirname, '..', 'ui', 'css', 'index.less')
        );

        compiler.assets.addPluginScript(
          path.resolve(__dirname, '..', 'dist', plugin.name + '.js')
        );

        // compiler.assets.addPluginRuntimeConfig(plugin.name, config);

        done();
      });
    }
  };

  return plugin;
}

module.exports = Plugin;
