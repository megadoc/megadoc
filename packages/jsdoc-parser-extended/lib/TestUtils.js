const multiline = require('multiline-slash');
const ASTParser = require('./');
const { NullLinter } = require('megadoc-linter');

exports.parseNode = function(strGenerator, config, filePath) {
  var parser = createParser();
  var body = typeof strGenerator === 'function' ? multiline(strGenerator) : strGenerator;

  config = config || {};
  config.alias = config.alias || {};

  parser.parseString(body, config, filePath || '__test__');

  return parser.registry.docs;
}

function parseInline(strGenerator, config, filePath, fn) {
  var parser = createParser();
  var body = typeof strGenerator === 'function' ? multiline(strGenerator) : strGenerator;
  var database;

  config = config || {};
  config.alias = config.alias || {};

  if (fn) {
    fn(parser);
  }

  parser.parseString(body, config, filePath || '__test__');

  database = parser.toJSON();

  return database;
}

function parseFiles(filePaths, config, commonPrefix) {
  var parser = createParser();
  var database;

  config = config || {};
  config.alias = config.alias || {};

  filePaths.forEach(function(filePath) {
    parser.parseFile(filePath, config || {}, commonPrefix || __dirname);
  });

  database = parser.toJSON();

  return database;
}

function parseFile(filePath, config, commonPrefix) {
  return parseFiles([ filePath ], config, commonPrefix);
}

exports.parseInline = parseInline;
exports.parseFile = parseFile;
exports.parseFiles = parseFiles;
exports.createParser = createParser;

function createParser() {
  return new ASTParser({ linter: NullLinter });
}