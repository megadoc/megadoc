var path = require('path');

module.exports = function() {
  return {
    name: 'tinydoc-layout-multi-page',

    run: function(compiler) {
      compiler.on('write', function() {
        compiler.assets.addPluginScript(path.resolve(__dirname, '../dist/tinydoc-layout-multi-page.js'));
      });
    }
  };
};