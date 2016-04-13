var path = require('path');
var root = path.resolve(__dirname, '..');

module.exports = function() {
  return {
    run: function(compiler) {
      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(path.join(root, 'ui/index.less'));
        compiler.assets.addPluginScript(path.join(root, 'dist/tinydoc-theme-qt.js'));

        done();
      });
    }
  }
}