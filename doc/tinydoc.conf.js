var path = require('path');
var config = {
  assetRoot: path.resolve(__dirname, '..'),

  title: 'tinydoc',
  outputDir: 'doc/compiled',
  readme: 'README.md',
  useHashLocation: true,
  publicPath: '',
  stylesheet: 'doc/theme.less',
  disqus: false,
};

config.plugins = [
  require('tinydoc-plugin-js')({
    navigationLabel: 'API',

    source: [
      'lib/**/*.js',
      'ui/**/*.js',
    ],

    exclude: [
      /\.test\.js$/,
      'ui/app/vendor',
    ],

    inferModuleIdFromFileName: true,

    useDirAsNamespace: false,

    namespaceDirMap: {
      'lib': 'Core',
      'lib/utils': 'Core.Utils',
      'ui/shared/core': 'UI.Core',
    }
  }),

  require('tinydoc-plugin-markdown')({
    source: [
      'CHANGES.md'
    ]
  })
];

module.exports = config;