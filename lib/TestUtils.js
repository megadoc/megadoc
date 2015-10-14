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
  var path = require('path');
  var Compiler = require('./Compiler');

  var root = path.resolve(__dirname, '..', 'tmp');

  return new Compiler(merge({
    tmpDir: path.join(root, '.junk'),
    outputDir: path.join(root, 'compiled'),
    assetRoot: path.join(root, 'src'),
  }, config));
};