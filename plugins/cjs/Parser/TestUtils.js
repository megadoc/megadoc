var TestUtils = require('../../../lib/TestUtils');
var ASTParser = require('./');

function parseInline(strGenerator, config, filePath) {
  var parser = new ASTParser();
  var body = TestUtils.getInlineString(strGenerator);
  var database;

  config = config || {};

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

function parseFiles(filePaths, config, commonPrefix) {
  var parser = new ASTParser();
  var database;

  config = config || {};

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