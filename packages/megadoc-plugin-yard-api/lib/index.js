const path = require('path')

exports.configureFnPath = require.resolve('./configureFn')
exports.parseBulkFnPath = require.resolve('./parseBulkFn')
exports.reduceFnPath = require.resolve('./reduceFn')
exports.renderFnPath = require.resolve('./renderFn')
exports.reduceTreeFnPath = require.resolve('./reduceTreeFn')
exports.serializerOptions = {
  html: {
    defaultLayouts: require('./defaultLayouts'),

    pluginScripts: [
      path.resolve(__dirname, '..', 'dist/megadoc-plugin-yard-api.js'),
    ],

    styleSheets: [
      path.resolve(__dirname, '..', 'ui', 'css', 'index.less'),
    ],
  }
}
