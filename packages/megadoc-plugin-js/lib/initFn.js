var assert = require('assert');
var EventEmitter = require('events');
var Parser = require('jsdoc-parser-extended').Parser;
var defaults = require('./config');

module.exports = function init(compilation) {
  var config = Object.assign({}, defaults, compilation.options);
  var commonOptions = compilation.commonOptions;
  var emitter = new EventEmitter();
  var parserConfig = {
    strict: config.strict || commonOptions.strict,
    inferModuleIdFromFileName: config.inferModuleIdFromFileName,
    customTags: config.customTags,
    namespaceDirMap: config.namespaceDirMap,
    moduleMap: config.moduleMap,
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

  return {
    emitter: emitter,
    parser: new Parser({ emitter: emitter }),
    parserConfig: parserConfig,
  };
};
