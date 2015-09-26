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
      'plugins/cjs/**/*.js',
      'plugins/ui/**/*.js',
      'plugins/git/**/*.js',
      'ui/app/**/*.js',
    ],

    exclude: [
      /plugins\/.*\/ui/,
      /\.test\.js$/,
      'ui/app/vendor',
    ],

    inferModuleIdFromFileName: true,

    useDirAsNamespace: false
  }),

  require('../plugins/markdown')({
    source: [
      'CHANGES.md',
      'plugins/**/*.md'
    ]
  })
];

module.exports = config;