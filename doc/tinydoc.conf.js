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
  showSettingsLinkInBanner: false,
};

config.plugins = [
  require('tinydoc-plugin-js')({
    routeName: 'dev/api',
    // navigationLabel: 'API',

    source: [
      'lib/**/*.js',
      'ui/**/*.js',
      // 'packages/(?!tinydoc)/lib/**/*.js',
      // 'packages/(?!tinydoc)/ui/**/*.js',
    ],

    exclude: [
      /\.test\.js$/,
      'ui/app/vendor',
    ],

    useDirAsNamespace: false,

    namespaceDirMap: {
      'lib': 'Core',
      'lib/utils': 'Core.Utils',
      'ui/shared/core': 'UI.Core',
    }
  }),

  require('tinydoc-plugin-static')({
    url: '/readme',
    source: 'README.md',
    anchorableHeadings: true,
  }),

  require('tinydoc-plugin-static')({
    source: 'CHANGES.md',
    url: '/changes',
    anchorableHeadings: true
  }),

  // @url: /dev/plugins
  require('tinydoc-plugin-markdown')({
    routeName: 'dev/plugins',
    source: [ 'doc/plugins/**/*.md' ],
    title: false,
    fullFolderTitles: false,
    discardFileExtension: true,
    corpusContext: 'Plugins',
  }),

  // @url: /usage
  require('tinydoc-plugin-markdown')({
    routeName: 'usage',
    source: [ 'doc/usage/**/*.md' ],
    title: false,
    fullFolderTitles: false,
    discardFileExtension: true,
    corpusContext: 'Usage',
  }),

  require('tinydoc-layout-multi-page')({
    bannerLinks: [
      {
        text: 'Usage',
        href: '/usage/readme',
      },

      {
        text: 'Plugins',
        href: '/plugins',
        links: [
          {
            text: 'Git',
            href: '/plugins/tinydoc-plugin-git',
          },

          {
            text: 'JavaScript',
            href: '/plugins/tinydoc-plugin-js',
          },
          {
            text: 'JavaScript React',
            href: '/plugins/tinydoc-plugin-react',
          },

          {
            text: 'Markdown',
            href: '/plugins/tinydoc-plugin-markdown',
          },

          {
            text: 'Lua',
            href: '/plugins/tinydoc-plugin-lua',
          },

          {
            text: 'Static',
            href: '/plugins/tinydoc-plugin-static',
          },

          {
            text: 'YARD-API',
            href: '/plugins/tinydoc-plugin-yard-api',
          },

          {
            text: 'Reference Graph',
            href: '/plugins/tinydoc-plugin-reference-graph',
          },

          {
            text: 'Layout - Single-Page',
            href: '/plugins/tinydoc-layout-single-page',
          },

          {
            text: 'Layout - Multi-Page',
            href: '/plugins/tinydoc-layout-multi-page',
          },

          {
            text: 'Theme - Qt',
            href: '/plugins/tinydoc-theme-qt',
          },

          {
            text: 'Theme - gitbooks.io',
            href: '/plugins/tinydoc-theme-qt',
          },
        ]
      },

      {
        text: 'Developers',
        links: [
          {
            text: 'Plugins',
            href: '/dev/plugins/readme',
          },

          {
            text: 'API',
            href: '/dev/api',
          },

          {
            text: 'Corpus',
            href: '/dev/corpus',
          },
        ]
      },

      {
        text: 'Changes',
        href: '/changes',
      },

    ]
  }),

  require('tinydoc-theme-qt')({}),

  require('tinydoc-plugin-static')({
    source: 'packages/tinydoc-corpus/README.md',
    url: '/dev/corpus',
    outlet: 'CJS::Landing',
    anchorableHeadings: false
  }),

  require('tinydoc-plugin-js')({
    routeName: 'dev/corpus',
    corpusContext: 'Corpus',
    useDirAsNamespace: false,
    inferModuleIdFromFileName: true,

    source: [
      'packages/tinydoc-corpus/defs/*.js',
      'packages/tinydoc-corpus/lib/**/*.js',
    ],

    exclude: [ /\.test\.js$/ ],
  })
];

[
  'tinydoc-layout-multi-page',
  'tinydoc-layout-single-page',
  'tinydoc-plugin-git',
  'tinydoc-plugin-js',
  'tinydoc-plugin-lua',
  'tinydoc-plugin-markdown',
  'tinydoc-plugin-react',
  'tinydoc-plugin-reference-graph',
  'tinydoc-plugin-static',
  'tinydoc-plugin-yard-api',
  'tinydoc-theme-gitbooks',
  'tinydoc-theme-qt',
].forEach(function(pluginName) {
  config.plugins.push(require('tinydoc-plugin-js')({
    routeName: 'plugins/' + pluginName,
    corpusContext: pluginName,
    useDirAsNamespace: false,
    inferModuleIdFromFileName: true,

    source: [
      'packages/' + pluginName + '/lib/**/*.js',
      'packages/' + pluginName + '/ui/**/*.js',
    ],

    exclude: [ /\.test\.js$/, /vendor/ ],
  }));

  config.plugins.push(require('tinydoc-plugin-static')({
    source: 'packages/' + pluginName + '/README.md',
    url: '/plugins/' + pluginName,
    outlet: 'CJS::Landing',
    anchorableHeadings: false
  }));
})

module.exports = config;