var multiline = require('multiline-slash');
var ASTParser = require('./');

exports.parseNode = function(strGenerator, config, filePath) {
  var parser = new ASTParser();
  var body = typeof strGenerator === 'function' ? multiline(strGenerator) : strGenerator;

  config = config || {};
  config.alias = config.alias || {};
  config.strict = true;

  parser.parseString(body, config, filePath || '__test__');

  return parser.registry.docs;
}

function parseInline(strGenerator, config, filePath) {
  var parser = new ASTParser();
  var body = typeof strGenerator === 'function' ? multiline(strGenerator) : strGenerator;
  var database;

  config = config || {};
  config.alias = config.alias || {};
  config.strict = true;

  parser.parseString(body, config, filePath || '__test__');
  parser.seal(config);

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
  config.alias = config.alias || {};

  filePaths.forEach(function(filePath) {
    parser.parseFile(filePath, config || {}, commonPrefix);
  });

  parser.seal(config);
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