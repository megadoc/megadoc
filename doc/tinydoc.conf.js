var path = require('path');
var config = {
  assetRoot: path.resolve(__dirname, '..'),

  title: 'tinydoc',
  outputDir: 'doc/compiled',
  readme: 'README.md',
  useHashLocation: true,
  publicPath: '',
  stylesheet: 'doc/theme.less',
  styleOverride: 'doc/theme-variables.less',
  disqus: false,
};

config.plugins = [
  require('../plugins/cjs')({
    navigationLabel: 'API',

    source: [
      'lib/**/*.js',
      'plugins/core/**/*.js',
      'plugins/cjs/**/*.js',
      'plugins/markdown/**/*.js',
      'plugins/git/**/*.js',
      'ui/**/*.js',
    ],

    exclude: [
      /plugins\/.*\/ui/,
      /\.test\.js$/,
      'ui/app/vendor',
    ],

    inferModuleIdFromFileName: true,

    useDirAsNamespace: false,

    namespaceDirMap: {
      'lib': 'Core',
      'lib/utils': 'Core.Utils',
      'plugins/cjs/Parser': 'Plugins.CJS.Parser'
    }
  }),

  require('../plugins/markdown')({
    source: [
      'CHANGES.md',
      'plugins/**/*.md'
    ]
  })
];

module.exports = config;