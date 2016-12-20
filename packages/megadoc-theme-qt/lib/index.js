const path = require('path');
const root = path.resolve(__dirname, '..');

module.exports = {
  options: {
    invertedSidebar: false
  },

  pluginScripts: [
    path.join(root, 'dist/megadoc-theme-qt.js')
  ],

  styleSheets: [
    path.join(root, 'ui/index.less'),
  ],

  styleOverrides: require('../ui/styleOverrides'),
};