const path = require('path');

module.exports = {
  metaKey: 'references',
  sealFnPath: require.resolve('./seal.js'),
  serializerOptions: {
    html: {
      styleSheets: [
        path.resolve(__dirname, '..', 'ui', 'css', 'index.less'),
      ],

      pluginScripts: [
        path.resolve(__dirname, '..', 'dist', 'megadoc-plugin-reference-graph.js')
      ],
    }
  }
}
