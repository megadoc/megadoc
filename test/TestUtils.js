var fs = require('fs');
var path = require('path');

exports.getFixturePath = function(fileName) {
  return path.resolve(__dirname, 'fixtures', fileName);
};

exports.loadFixture = function(fileName) {
  return fs.readFileSync(exports.getFixturePath(fileName), 'utf-8');
};