var fs = require('fs');
var path = require('path');

exports.getFixturePath = function(fileName) {
  return path.resolve(__dirname, 'fixtures', fileName);
};

exports.loadFixture = function(fileName) {
  return fs.readFileSync(exports.getFixturePath(fileName), 'utf-8');
};

exports.getInlineString = function(strGenerator) {
  return strGenerator.toString()
    .replace(/^function\s*\(\)\s*\{|\}$/g, '')
    .replace(/^(\s+)\/\//mg, '$1')
  ;
};
