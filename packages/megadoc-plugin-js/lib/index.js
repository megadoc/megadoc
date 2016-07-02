var path = require('path');
var scan = require('./scan');
var generateStats = require('./generateStats');
var render = require('./render');
var assign = require('lodash').assign;
var assert = require('assert');
var defaults = require('./config');
var reduceDocuments = require('./reduce');
var EventEmitter = require('events');

/**
 * @param {Config} userConfig
 */
function Plugin(userConfig) {
  var config = assign({}, defaults, userConfig);
  var parserConfig = {
    strict: config.strict,
    inferModuleIdFromFileName: config.inferModuleIdFromFileName,
    customTags: config.customTags,
    namespaceDirMap: config.namespaceDirMap,
    alias: config.alias,
    parse: config.parse,
    parserOptions: config.parserOptions,
    namedReturnTags: config.namedReturnTags,
    nodeAnalyzers: config.nodeAnalyzers || [],
    docstringProcessors: config.docstringProcessors || [],
    tagProcessors: config.tagProcessors || [],
    postProcessors: config.postProcessors || [],
    tagAliases: config.tagAliases,
  };

  var emitter = new EventEmitter();

  assert(typeof config.id === 'string',
    "You must specify an @id to the megadoc-plugin-js plugin."
  );

  if (config.builtInTypes) {
    config.builtInTypes.forEach(function(x) {
      if (x && typeof x === 'object') {
        assert(typeof x.name === 'string',
          'An object for a built-in type must define a @name string.');

        assert(typeof x.href === 'string',
          'An object for a built-in type must specify @href with a URL to the built-in type documentation');
      }
      else {
        assert(typeof x === 'string',
          'Built-in type must be either a string or an object, not "' + typeof x + '"');
      }
    });
  }

  Object.keys(config.alias).forEach(function(key) {
    assert(Array.isArray(config.alias[key]),
      "megadoc-plugin-js: OptionError: expected alias '" + key + "' entry to " +
      " be an array, got '" + typeof config.alias[key] + "'."
    );

    config.alias[key].forEach(function(value) {
      assert(typeof value === 'string',
        "megadoc-plugin-js: OptionError: expected alias entry to be a string " +
        ", not '" + typeof value + "' (key '" + key + "')"
      );
    });
  });

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
      emitter.on('process-node', analyzer);
      // parserConfig.nodeAnalyzers.push(analyzer);
    },

    addDocstringProcessor: function(processor) {
      emitter.on('process-docstring', processor);
      // parserConfig.docstringProcessors.push(processor);
    },

    addTagProcessor: function(processor) {
      emitter.on('process-tag', processor);
      // parserConfig.tagProcessors.push(processor);
    },

    addPostProcessor: function(fn) {
      emitter.on('postprocess', fn);
      // parserConfig.postProcessors.push(postProcessor);
    },

    on: emitter.addListener.bind(emitter),
    off: emitter.removeListener.bind(emitter),

    run: function(compiler) {
      var database;
      var documents;

      compiler.on('scan', function(done) {
        scan({
          config: config,
          parserConfig: parserConfig,
          utils: compiler.utils,
          assetRoot: compiler.config.assetRoot,
          emitter: emitter,
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
