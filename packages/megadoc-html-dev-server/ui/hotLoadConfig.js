const { exports } = window;

exports['megadoc__config'] = require('megadoc-config-file');

if (module.hot) {
  module.hot.accept('megadoc-config-file', function() {
    const nextConfig = require('megadoc-config-file');

    exports['megadoc__config'] = nextConfig;
    exports['megadoc'].startApp(exports['megadoc__config'], {
      startingDocumentUID: window.startingDocumentUID,
      startingDocumentHref: window.startingDocumentHref,
      plugins: window.MEGADOC_PLUGINS,
    });
  })
}