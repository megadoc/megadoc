require('megadoc-styles-file');

module.hot.accept('megadoc-styles-file', function() {
  var styleNode = window.document.querySelector('link[rel="stylesheet"]')
  var hash = require('megadoc-styles-file');

  styleNode.setAttribute('href', styleNode.href.replace(/\?v=(.+)$/, '') + '?v=' + hash)
})
