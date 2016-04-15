var path = require('path');
var config = {
  assetRoot: path.resolve(__dirname, '..'),

  title: 'tinydoc',
  home: '/readme',
  outputDir: 'doc/compiled',
  // readme: 'README.md',
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
      'packages/(?!tinydoc)/lib/**/*.js',
      'packages/(?!tinydoc)/ui/**/*.js',
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

  require('tinydoc-plugin-static')({
    url: '/readme',
    outlet: 'SinglePageLayout::ContentPanel',
    source: 'README.md',
    anchorableHeadings: true,
  }),

  require('tinydoc-plugin-markdown')({
    source: [
      'CHANGES.md'
    ]
  }),

  require('tinydoc-layout-single-page')({}),
  require('tinydoc-theme-qt')({}),
];

module.exports = config;