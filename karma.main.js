const chai = require('chai');
const sinon = require('sinon');

window.CONFIG = {
  pluginConfigs: {}
};

require('./ui');

sinon.assert.expose(chai.assert, { prefix: "" });

const CoreUITests = require.context('./ui', true, /.test.js$/);

CoreUITests.keys().forEach(CoreUITests);

tap(require.context('./packages/megadoc-plugin-markdown/ui', true, /.test.js$/), function(x) {
  x.keys().forEach(x);
});

it('gives us something', function() {
  chai.assert.ok(true);
});

function tap(x, fn) {
  fn(x);
}