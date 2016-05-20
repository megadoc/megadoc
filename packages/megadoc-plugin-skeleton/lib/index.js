var path = require('path');
var ROOT = path.resolve(__dirname, '..');
var defaults = require('./config');

module.exports = function(userConfig) {
  return {
    // This is the only required export for megadoc to use our plugin.
    run: function(compiler) {
      var config = compiler.utils.assignWithDefaults(userConfig, defaults);

      compiler.on('scan', function(done) {
        done();
      });

      compiler.on('write', function(done) {
        // Register our CSS for compilation (this will happen at compile-time.)
        compiler.assets.addStyleSheet(
          path.join(ROOT, 'ui', 'index.less')
        );

        // Register our JS
        compiler.assets.addPluginScript(
          path.join(ROOT, 'dist', 'megadoc-plugin-skeleton.js')
        );

        // Perform any necessary writing needed.

        // Be sure to call done() when you're done!
        done();
      });
    }
  }
}