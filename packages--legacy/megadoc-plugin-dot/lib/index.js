var path = require('path');
var ROOT = path.resolve(__dirname, '..');

module.exports = function(userConfig) {
  return {
    // This is the only required export for megadoc to use our plugin.
    run: function(compiler) {
      var config = compiler.utils.getWithDefaults(userConfig, require('./config'));
      //
      compiler.renderer.addCodeBlockRenderer('dot', require('./render')(compiler, config));

      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(path.join(ROOT, 'ui/css/index.less'));
        compiler.assets.addPluginScript(path.join(ROOT, 'dist/megadoc-plugin-dot.js'));

        done();
      });
    }
  }
};
