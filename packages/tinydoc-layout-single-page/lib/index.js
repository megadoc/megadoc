var path = require('path');

module.exports = function(userConfig) {
  var config = userConfig || {};

  return {
    name: 'tinydoc-layout-single-page',

    run: function(compiler) {
      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(path.resolve(__dirname, '../ui/index.less'));
        compiler.assets.addPluginScript(path.resolve(__dirname, '../dist/tinydoc-layout-single-page.js'));
        compiler.assets.addPluginRuntimeConfig('tinydoc-layout-single-page', {
          allowUserSettings: config.allowUserSettings
        });

        done();
      });
    }
  };
};