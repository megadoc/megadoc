var assert = require('assert');
var defaults = require('./config');

module.exports = function configure(userOptions) {
  var config = Object.assign({}, defaults, userOptions);
  var parserConfig = {
    inferModuleIdFromFileName: config.inferModuleIdFromFileName,
    inferNamespaces: config.inferNamespaces,
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
    verbose: config.verbose,
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

  return Object.assign({}, config, {
    // baseURL: config.baseURL || config.id,
    parserConfig: parserConfig,
  });
};
