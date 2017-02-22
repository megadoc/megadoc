const chai = require('chai');
const sinon = require('sinon');

window.CONFIG = {
  pluginConfigs: {}
};

require('./ui');

sinon.assert.expose(chai.assert, { prefix: "" });

tap(require.context('./ui', true, /.test.js$/), function(x) {
  x.keys().forEach(x);
});

tap(require.context('../megadoc-plugin-markdown/ui', true, /.test.js$/), function(x) {
  x.keys().forEach(x);
});

tap(require.context('../megadoc-plugin-js/ui', true, /.test.js$/), function(x) {
  x.keys().forEach(x);
});

it('gives us something', function() {
  chai.assert.ok(true);
});

function tap(x, fn) {
  fn(x);
}