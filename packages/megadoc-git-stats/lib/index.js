const path = require('path');

module.exports = {
  services: [
    {
      name: 'git-blamed',
      type: 'shell',
      up: {
        command: path.resolve(__dirname, 'git-blamed.rb'),
        args: [ ],
        env: {
          PORT: 17654
        }
      },

      down: {
        signal: 'SIGINT',
      }
    }
  ],

  metaKey: 'git',
  parseFnPath: require.resolve('./parseFile.js'),
  serializerOptions: {
    html: {
      styleSheets: [
        path.resolve(__dirname, '..', 'ui', 'css', 'index.less'),
      ],

      pluginScripts: [
        path.resolve(__dirname, '..', 'dist', 'megadoc-git-stats.js')
      ],
    }
  }
}
