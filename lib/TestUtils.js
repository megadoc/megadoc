var path = require('path');
var fs = require('fs-extra');
var merge = require('lodash').merge;
var root = path.resolve(__dirname, '..', 'tmp');
var Compiler = require('./Compiler');

var TestUtils = exports;
var TEST_REPO_PATH = path.resolve(__dirname, '../tmp/test-repo');

exports.contentBase = root;

exports.getInlineString = require('multiline-slash');
exports.generateTestConfig = function(config) {
  return merge({
    tmpDir: path.join(TEST_REPO_PATH, '.tinydoc'),
    outputDir: path.join(TEST_REPO_PATH, 'doc/compiled'),
    assetRoot: TEST_REPO_PATH,
  }, config);
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
  return new Compiler(TestUtils.generateTestConfig(config));
};

exports.tempPath = function(fileName) {
  return path.resolve(TEST_REPO_PATH, interpolateGUID(fileName));
};

exports.tempDir = function(dirName) {
  if (dirName.length === 0) {
    return TEST_REPO_PATH;
  }

  var dirPath = exports.tempPath(dirName);

  fs.ensureDirSync(dirPath);

  return dirPath;
};

exports.createFile = function(contents, fileName) {
  var filePath = exports.tempPath(fileName || '~file--[guid]');

  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, 'utf-8');

  return {
    path: filePath,
    contents: contents
  };
};

exports.removeFiles = function() {
  exports.clearCache();
};

exports.clearCache = function() {
  fs.removeSync(TEST_REPO_PATH);
};

exports.IntegrationSuite = function(mochaSuite, timeout) {
  mochaSuite.timeout(process.env.TINYDOC_TEST_TIMEOUT ?
    parseInt(process.env.TINYDOC_TEST_TIMEOUT, 10) :
    (timeout || 2000)
  );

  mochaSuite.beforeEach(function() {
  });

  mochaSuite.afterEach(function() {
    if (process.env.TINYDOC_TEST_CACHE !== '1') {
      TestUtils.clearCache();
    }
  });
};

function interpolateGUID(string) {
  return string.replace('[guid]', guid());
}

// courtesy of http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}