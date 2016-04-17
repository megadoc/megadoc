var path = require('path');
var scan = require('./scan');
var Indexer = require('./Indexer');
var resolveLink = require('./resolveLink');
var generateStats = require('./generateStats');
var render = require('./render');
var merge = require('lodash').merge;
var assign = require('lodash').assign;
var assert = require('assert');
var defaults = require('./config');

/**
 * @namespace Plugins.CJS
 *
 * @param {Plugins.CJS.Config} userConfig
 */
function createCJSPlugin(userConfig) {
  var config = merge({}, defaults, userConfig);
  var parserConfig = {
    inferModuleIdFromFileName: config.inferModuleIdFromFileName,
    customTags: config.customTags,
    namespaceDirMap: config.namespaceDirMap,
    alias: config.alias,
    parse: config.parse,
    parserOptions: config.parserOptions,
    nodeAnalyzers: [],
    docstringProcessors: [],
    tagProcessors: [],
    postProcessors: [],
  };

  assert(typeof config.routeName === 'string',
    "You must specify a @routeName string to the tinydoc-plugin-js plugin."
  );

  var plugin = {
    name: 'tinydoc-plugin-js',
    id: config.routeName,

    routeName: config.routeName,

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

      compiler.on('scan', function(done) {
        scan(config, parserConfig, compiler.config.gitRepository, compiler.utils, function(err, _database) {
          if (err) {
            return done(err);
          }

          database = _database.map(function(doc) {
            return assign({}, doc, {
              href: doc.isModule ?
                plugin.id + '/modules/' + encodeURIComponent(doc.id) :
                plugin.id + '/modules/' + encodeURIComponent(doc.receiver) + '/' + encodeURIComponent(doc.ctx.symbol + doc.name)
            });
          });

          compiler.linkResolver.use(resolveLink.bind(null, database));

          done();
        });
      });

      compiler.on('index', function(registry, done) {
        Indexer.generateIndices(database, registry, config).forEach(function(index) {
          registry.add(index.path, index.index);
        });

        Indexer.generateSearchTokens(database, registry, config).forEach(function(token) {
          registry.addSearchToken(token);
        });

        done();
      });

      compiler.on('render', function(renderMarkdown, linkify, done) {
        render(database, renderMarkdown, linkify);

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        stats['js:' + config.routeName] = generateStats(database);

        done();
      });

      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(
          path.resolve(__dirname, '..', 'ui', 'css', 'index.less')
        );

        compiler.assets.addPluginScript(
          path.resolve(__dirname, '..', 'dist', plugin.name + '.js')
        );

        compiler.assets.addPluginRuntimeConfig(plugin.name, merge({}, config, {
          database: database
        }));

        done();
      });
    }
  };

  return plugin;
}

module.exports = createCJSPlugin;