var path = require('path');

module.exports = function(userConfig) {
  return {
    name: 'tinydoc-layout',

    run: function(compiler) {
      var config = compiler.utils.getWithDefaults(userConfig, require('./config'));

      compiler.on('write', function(done) {
        compiler.assets.addPluginScript(path.resolve(__dirname, '../dist/tinydoc-layout.js'));
        compiler.assets.addPluginRuntimeConfig('tinydoc-layout', config);

        done();
      });
    }
  };
};