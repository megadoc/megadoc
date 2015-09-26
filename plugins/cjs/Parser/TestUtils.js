var TestUtils = require('../../../lib/TestUtils');
var ASTParser = require('./');

function parseInline(strGenerator, options, filePath) {
  var parser = new ASTParser();
  var body = TestUtils.getInlineString(strGenerator);

  parser.parseString(body, options || {}, filePath || '__test__');
  parser.postProcess();

  return parser.toJSON();
}

function parseFiles(filePaths, config, commonPrefix) {
  var parser = new ASTParser();

  filePaths.forEach(function(filePath) {
    parser.parseFile(filePath, config || {}, commonPrefix);
  });

  parser.postProcess();

  return parser.toJSON();
}

function parseFile(filePath, config, commonPrefix) {
  return parseFiles([ filePath ], config, commonPrefix);
}

exports.parseInline = parseInline;
exports.parseFile = parseFile;
exports.parseFiles = parseFiles;