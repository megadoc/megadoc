var path = require('path');
var root = path.resolve(__dirname, '..', 'tmp');

exports.contentBase = root;

exports.getInlineString = function(strGenerator, removePadding) {
  return strGenerator.toString()
    .replace(/^function\s*\(\)\s*\{|\}$/g, '')
    .replace(/^(\s+)\/\/[ ]?/mg, removePadding ? '' : '$1')
  ;
};

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