var path = require('path');
var root = path.resolve(__dirname, '..');
var defaults = require('./config');

module.exports = function(userConfig) {
  return {
    run: function(compiler) {
      var config = compiler.utils.getWithDefaults(userConfig, defaults);

      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(path.join(root, 'ui/index.less'));
        compiler.assets.addStyleOverrides(require('../ui/styleOverrides'));
        compiler.assets.addPluginScript(path.join(root, 'dist/tinydoc-theme-qt.js'));
        compiler.assets.addPluginRuntimeConfig('tinydoc-theme-qt', config);

        done();
      });
    }
  }
}