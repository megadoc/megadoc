var path = require('path');
var ROOT = path.resolve(__dirname, '..');

module.exports = function(userConfig) {

  return {
    // This is the only required export for tinydoc to use our plugin.
    run: function(compiler) {
      compiler.on('scan', function(done) {
        done();
      });

      compiler.on('write', function(done) {
        // Register our CSS for compilation (this will happen at compile-time.)
        compiler.assets.addStyleSheet(
          path.join(ROOT, 'ui', 'css', 'index.less')
        );

        // Register our JS
        compiler.assets.addPluginScript(
          path.join(ROOT, 'dist', 'tinydoc-plugin-skeleton.js')
        );

        // Everything we might need at run-time to render (like our data) should
        // be registered through this hook. Later on in our UI, we can retrieve
        // this config and deal with it.
        //
        // tinydoc will ensure it is available by the time the UI gets booted
        // up.
        compiler.assets.addPluginRuntimeConfig('skeleton', {
          userConfig: userConfig
        });

        // Perform any necessary writing needed.


        // Be sure to call done() when you're done!
        done();
      });
    }
  }
}