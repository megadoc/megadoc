var path = require('path');
var fs = require('fs-extra');
var root = path.resolve(__dirname, '..', 'tmp');
var tmpFileId = 0;
var tmpFiles = [];

exports.contentBase = root;

exports.getInlineString = require('multiline-slash');

exports.sinonSuite = function(suite) {
  var sinon = require('sinon');
  var sandbox;

  suite.beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  suite.afterEach(function() {
    sandbox.restore();
  });

  return function getSandbox() {
    return sandbox;
  }
};

exports.createCompiler = function(config) {
  var merge = require('lodash').merge;
  var Compiler = require('./Compiler');

  return new Compiler(merge({
    tmpDir: path.join(root, '.junk'),
    outputDir: path.join(root, 'compiled'),
    assetRoot: path.join(root, 'src'),
  }, config));
};

exports.createFile = function(contents, fileName) {
  var assetRoot = path.join(root, 'src');
  var filePath;

  fileName = fileName || '~file--' + (tmpFileId++);
  filePath = path.resolve(assetRoot, fileName);

  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, contents);

  tmpFiles.push(filePath);

  return filePath;
};

exports.removeFiles = function() {
  tmpFiles.forEach(function(filePath) {
    fs.removeSync(filePath);
  });

  tmpFiles = [];
}