const path = require('path');

module.exports = {
  initFnPath: path.resolve(__dirname, './initFn.js'),
  parseFnPath: path.resolve(__dirname, './parseFn.js'),
  reduceFnPath: path.resolve(__dirname, './reduceFn.js'),
  refineFnPath: path.resolve(__dirname, './refineFn.js'),
  reduceTreeFnPath: path.resolve(__dirname, './reduceTreeFn.js'),
  renderFnPath: path.resolve(__dirname, './renderFn.js'),
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