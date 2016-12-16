const sinon = require('sinon');
const { assert } = require('chai');

sinon.assert.expose(assert, { prefix: "" });

module.exports = function sinonSuite(mochaSuite) {
  var sandbox = sinon.sandbox.create();

  mochaSuite.beforeEach(function() {
    sandbox.restore();
  });

  mochaSuite.afterEach(function() {
    sandbox.restore();
  });

  return sandbox;
};