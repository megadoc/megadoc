const sinon = require('sinon');

module.exports = function(suite) {
  let sandbox;

  sandbox = sinon.sandbox.create();

  suite.beforeEach(function() {
    sandbox.restore();
  });

  suite.afterEach(function() {
    sandbox.restore();
  });

  return sandbox;
};