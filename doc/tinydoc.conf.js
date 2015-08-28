var path = require('path');
var config = {
  assetRoot: path.resolve(__dirname, '..'),

  title: 'tinydoc',
  outputDir: 'doc/compiled',
  readme: 'README.md',
  useHashLocation: true,
  publicPath: '',

  disqus: false
};

config.plugins = [
  require('../plugins/cjs'),
  require('../plugins/markdown')
];

config.cjs = {
  source: [
    // 'lib/Utils.js',
    'plugins/cjs/**/*.js',
    'lib/**/*.js',
    // 'plugins/**/*.js',
    // 'ui/app/**/*.js',
  ],

  exclude: [
    /plugins\/.*\/ui/,
    /\.test\.js$/,
    'ui/app/vendor',
  ],

  inferModuleIdFromFileName: true,

  useDirAsNamespace: false
};

config.markdown = {
  source: [
    'CHANGES.md',
    'plugins/**/*.md'
  ]
};

module.exports = config;