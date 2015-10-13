var sinon = require('sinon');

exports.getInlineString = function(strGenerator, removePadding) {
  return strGenerator.toString()
    .replace(/^function\s*\(\)\s*\{|\}$/g, '')
    .replace(/^(\s+)\/\/[ ]?/mg, removePadding ? '' : '$1')
  ;
};

exports.sinonSuite = function(suite) {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  return function getSandbox() {
    return sandbox;
  }
};