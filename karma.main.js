const chai = require('chai');
const sinon = require('sinon');

window.CONFIG = {
  pluginConfigs: {}
};

require('./ui');

sinon.assert.expose(chai.assert, { prefix: "" });

const CoreUITests = require.context('./ui', true, /.test.js$/);

CoreUITests.keys().forEach(CoreUITests);

it('gives us something', function() {
  chai.assert.ok(true);
});