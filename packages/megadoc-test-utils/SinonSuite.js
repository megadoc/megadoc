const sinon = require('sinon');
const chai = require('chai');

sinon.assert.expose(chai.assert, { prefix: "" });

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