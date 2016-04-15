var path = require('path');
var root = path.resolve(__dirname, '..');

module.exports = function(userConfig) {
  return {
    name: 'tinydoc-plugin-reference-graph',

    // This is the only required export for tinydoc to use our plugin.
    run: function(compiler) {
      var database = [];

      compiler.linkResolver.on('lookup', function(e) {
        if (e.link && e.source) {
          if (userConfig && userConfig.verbose) {
            console.log('Link to "%s" from "%s"',
              e.objectPath,
              e.source.title.trim()
            );
          }

          database.push(e);
        }
      });

      compiler.on('write', function() {
        compiler.assets.addStyleSheet(path.join(root, 'ui/css/index.less'));
        compiler.assets.addPluginScript(path.join(root, 'dist/tinydoc-plugin-reference-graph.js'));
        compiler.assets.addPluginRuntimeConfig('tinydoc-plugin-reference-graph', {
          database: database
        });
      });
    }
  }
}