const path = require('path');

module.exports = {
  initFnPath: path.resolve(__dirname, './initFn.js'),
  parseBulkFnPath: path.resolve(__dirname, './parseBulkFn.js'),
  reduceFnPath: path.resolve(__dirname, './reduceFn.js'),
  reduceTreeFnPath: path.resolve(__dirname, './reduceTreeFn.js'),
  serializerOptions: {
    html: {
      defaultLayouts: require('./defaultLayouts'),

      pluginScripts: [
        path.resolve(__dirname, '..', 'dist/megadoc-plugin-js.js'),
      ],

      styleSheets: [
        path.resolve(__dirname, '..', 'ui', 'css', 'index.less'),
      ],
    }
  }
};