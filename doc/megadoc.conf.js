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

  alias: {
    'md__tinydoc-plugin-markdown/readme': 'tinydoc-plugin-markdown',
    'md__tinydoc-plugin-js/readme': 'tinydoc-plugin-js',
    'md__tinydoc-plugin-git/readme': 'tinydoc-plugin-git',
    'md__tinydoc-plugin-lua/readme': 'tinydoc-plugin-lua',
    'md__tinydoc-plugin-yard-api/readme': 'tinydoc-plugin-yard-api',
  },

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
              { name: 'Markdown::DocumentTOC', using: 'md__corpus/readme' },
              { name: 'CJS::ClassBrowser', using: 'js__corpus' },
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
              { name: 'Markdown::DocumentTOC', using: 'md__corpus/readme' },
              { name: 'CJS::ClassBrowser', using: 'js__corpus' },
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

    source: [
      'lib/**/*.js',
      'ui/**/*.js',
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
    id: 'md__plugins',
    baseURL: '/dev/plugins',
    source: [ 'doc/plugins/**/*.md' ],
    title: 'Plugins',
    fullFolderTitles: false,
  }),

  // @url: /usage
  require('tinydoc-plugin-markdown')({
    id: 'md__usage',
    baseURL: '/usage',
    source: [ 'doc/usage/**/*.md' ],
    title: 'Usage',
    fullFolderTitles: false,
  }),


  require('tinydoc-plugin-markdown')({
    id: 'md__corpus',
    title: 'Corpus',
    source: 'packages/tinydoc-corpus/README.md',
    baseURL: '/dev/corpus',
    // outlet: 'CJS::Landing',
    // anchorableHeadings: false
  }),

  require('tinydoc-plugin-js')({
    id: 'js__corpus',
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
  'tinydoc-plugin-yard-api',
  'tinydoc-theme-gitbooks',
  'tinydoc-theme-qt',
].forEach(function(pluginName) {
  config.plugins.push(require('tinydoc-plugin-js')({
    id: 'js__' + pluginName,
    url: '/plugins',
    title: pluginName,
    useDirAsNamespace: false,
    inferModuleIdFromFileName: true,
    namespaceDirMap: {
      'lib': pluginName,
      'ui': pluginName,
    },
    source: [
      'packages/' + pluginName + '/lib/**/*.js',
      'packages/' + pluginName + '/ui/**/*.js',
    ],

    exclude: [ /\.test\.js$/, /vendor/ ],
  }));

  config.plugins.push(require('tinydoc-plugin-markdown')({
    id: 'md__' + pluginName,
    title: pluginName,
    source: 'packages/' + pluginName + '/**/*.md',
    exclude: /node_modules/,
    baseURL: '/plugins/' + pluginName,
    // outlet: 'CJS::Landing',
    // anchorableHeadings: false
  }));
})

module.exports = config;