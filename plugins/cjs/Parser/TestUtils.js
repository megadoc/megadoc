var ASTParser = require('./');

function parseInline(strGenerator, options, filePath) {
  var parser = new ASTParser();
  var body = TestUtils.getInlineString(strGenerator);

  parser.parseString(body, options || {}, filePath || '__test__');
  parser.postProcess();

  return parser.toJSON();
}

function parseFile(filePath, config, commonPrefix) {
  var parser = new ASTParser();

  parser.parseFile(filePath, config || {}, commonPrefix);
  parser.postProcess();

  return parser.toJSON();
}

exports.parseInline = parseInline;
exports.parseFile = parseFile;