var path = require('path');
var config = {
  assetRoot: path.resolve(__dirname, '..'),

  title: 'tinydoc',
  outputDir: '/srv/http/docs/tinydoc',
  useHashLocation: true,
  publicPath: '',
  stylesheet: 'doc/theme.less',
  disqus: false,
  showSettingsLinkInBanner: false,
  tooltipPreviews: false,

  layoutOptions: {
    rewrite: {
      '/articles/readme.html': '/index.html',
      '/articles/changes.html': '/changes.html',
    },

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
            href: '/plugins/tinydoc-plugin-git/readme.html',
          },

          {
            text: 'JavaScript',
            href: '/plugins/tinydoc-plugin-js/readme.html',
          },
          {
            text: 'JavaScript React',
            href: '/plugins/tinydoc-plugin-react/readme.html',
          },

          {
            text: 'Markdown',
            href: '/plugins/tinydoc-plugin-markdown/readme.html',
          },

          {
            text: 'Lua',
            href: '/plugins/tinydoc-plugin-lua/readme.html',
          },

          {
            text: 'Static',
            href: '/plugins/tinydoc-plugin-static/readme.html',
          },

          {
            text: 'YARD-API',
            href: '/plugins/tinydoc-plugin-yard-api/readme.html',
          },

          {
            text: 'Reference Graph',
            href: '/plugins/tinydoc-plugin-reference-graph/readme.html',
          },

          {
            text: 'Theme - Qt',
            href: '/plugins/tinydoc-theme-qt/readme.html',
          },

          {
            text: 'Theme - gitbooks.io',
            href: '/plugins/tinydoc-theme-qt/readme.html',
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
            href: '/dev/corpus/readme.html',
          },
        ]
      },

      {
        text: 'Changes',
        href: '/changes',
      },

    ],

    customLayouts: [
      {
        match: { by: 'url', on: '/changes.html' },
        regions: [
          {
            name: 'Layout::Content',
            options: { framed: true },
            outlets: [
              { name: 'Markdown::Document' }
            ]
          },
          {
            name: 'Layout::Sidebar',
            outlets: [
              { name: 'Markdown::DocumentTOC' }
            ]
          }

        ]
      },
      {
        match: { by: 'url', on: '/dev/corpus/readme.html' },
        regions: [
          {
            name: 'Layout::Content',
            options: { framed: true },
            outlets: [
              { name: 'Markdown::Document' }
            ]
          },
          {
            name: 'Layout::Sidebar',
            outlets: [
              { name: 'Markdown::DocumentTOC', using: '/dev/corpus/readme' },
              { name: 'CJS::ClassBrowser', using: 'corpus-js' },
            ]
          }

        ]
      },
      {
        match: { by: 'url', on: '/dev/corpus/(?!readme)' },
        regions: [
          {
            name: 'Layout::Content',
            options: { framed: true },
            outlets: [
              { name: 'CJS::Module' }
            ]
          },
          {
            name: 'Layout::Sidebar',
            outlets: [
              { name: 'Markdown::DocumentTOC', using: '/dev/corpus/readme' },
              { name: 'CJS::ClassBrowser', using: 'corpus-js' },
            ]
          }

        ]
      }
    ]
  },

};

config.plugins = [
  require('tinydoc-plugin-js')({
    id: 'core-js',
    url: '/dev/api',
    title: 'API',
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

  require('tinydoc-plugin-markdown')({
    title: 'Documents',
    source: [ 'README.md', 'CHANGES.md' ],
  }),

  // @url: /dev/plugins
  require('tinydoc-plugin-markdown')({
    routeName: '/dev/plugins',
    source: [ 'doc/plugins/**/*.md' ],
    title: 'Plugins',
    fullFolderTitles: false,
  }),

  // @url: /usage
  require('tinydoc-plugin-markdown')({
    routeName: '/usage',
    source: [ 'doc/usage/**/*.md' ],
    title: 'Usage',
    fullFolderTitles: false,
  }),


  require('tinydoc-plugin-markdown')({
    title: 'Corpus',
    source: 'packages/tinydoc-corpus/README.md',
    routeName: '/dev/corpus',
    // outlet: 'CJS::Landing',
    // anchorableHeadings: false
  }),

  require('tinydoc-plugin-js')({
    id: 'corpus-js',
    url: '/dev/corpus',
    title: 'Corpus',
    useDirAsNamespace: false,
    inferModuleIdFromFileName: true,

    source: [
      'packages/tinydoc-corpus/defs/*.js',
      'packages/tinydoc-corpus/lib/**/*.js',
    ],

    exclude: [ /\.test\.js$/ ],
  }),

  require('tinydoc-theme-qt')({}),

];

[
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
    id: 'js-plugin-' + pluginName,
    url: '/plugins/' + pluginName,
    title: pluginName,
    useDirAsNamespace: false,
    inferModuleIdFromFileName: true,

    source: [
      'packages/' + pluginName + '/lib/**/*.js',
      'packages/' + pluginName + '/ui/**/*.js',
    ],

    exclude: [ /\.test\.js$/, /vendor/ ],
  }));

  config.plugins.push(require('tinydoc-plugin-markdown')({
    title: pluginName,
    source: 'packages/' + pluginName + '/README.md',
    routeName: '/plugins/' + pluginName,
    // outlet: 'CJS::Landing',
    // anchorableHeadings: false
  }));
})

module.exports = config;