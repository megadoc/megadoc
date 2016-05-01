var multiline = require('multiline-slash');
var ASTParser = require('./');
var Registry = require('tinydoc/lib/Registry');

function parseInline(strGenerator, config, filePath) {
  var parser = new ASTParser();
  var body = multiline(strGenerator);
  var database;

  config = config || {};
  config.alias = config.alias || {};

  parser.parseString(body, config, filePath || '__test__');
  parser.seal();

  database = parser.toJSON();

  if (config.postProcessors) {
    config.postProcessors.forEach(function(postProcessor) {
      postProcessor(database);
    });
  }

  return database;
}

exports.buildRegistry = function(database, routeName) {
  var registry = new Registry();

  // Indexer.generateIndices(database, registry, { routeName: routeName || 'test' }).forEach(function(index) {
  //   registry.add(index.path, index.index);
  // });

  return registry;
};

function parseFiles(filePaths, config, commonPrefix) {
  var parser = new ASTParser();
  var database;

  config = config || {};
  config.alias = config.alias || {};

  filePaths.forEach(function(filePath) {
    parser.parseFile(filePath, config || {}, commonPrefix);
  });

  parser.seal();
  database = parser.toJSON();

  if (config.postProcessors) {
    config.postProcessors.forEach(function(postProcessor) {
      postProcessor(database);
    });
  }

  return database;
}

function parseFile(filePath, config, commonPrefix) {
  return parseFiles([ filePath ], config, commonPrefix);
}

exports.parseInline = parseInline;
exports.parseFile = parseFile;
exports.parseFiles = parseFiles;