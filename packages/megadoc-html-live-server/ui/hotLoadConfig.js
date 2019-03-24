var exports = window.exports;
var config = require('megadoc-config-file');

Object.defineProperty(exports, 'megadoc__config', {
  configurable: false,
  enumerable: true,
  get: function() { return config; },
  set: function() {}
})

if (module.hot) {
  module.hot.accept('megadoc-config-file', function() {
    config = require('megadoc-config-file');

    exports['megadoc'].startApp(config, {
      startingDocumentUID: window.startingDocumentUID,
      startingDocumentHref: window.startingDocumentHref,
    });
  })
}