var path = require('path');
var config = {
  assetRoot: path.resolve(__dirname, '..'),

  title: 'megadoc',
  outputDir: '/srv/http/docs/megadoc',
  useHashLocation: true,
  publicPath: '',
  stylesheet: 'doc/theme.less',
  disqus: false,
  showSettingsLinkInBanner: false,
  tooltipPreviews: false,
  corpus: {
    indexByFilepath: true,
  },

  assets: [
    { 'packages/megadoc-corpus/doc/corpus-resolver.png': 'images/corpus-resolver.png' },
  ],

  alias: {
    'md__megadoc-plugin-markdown/readme': 'megadoc-plugin-markdown',
    'md__megadoc-plugin-js/readme': 'megadoc-plugin-js',
    'md__megadoc-plugin-git/readme': 'megadoc-plugin-git',
    'md__megadoc-plugin-lua/readme': 'megadoc-plugin-lua',
    'md__megadoc-plugin-yard-api/readme': 'megadoc-plugin-yard-api',
  },

  layoutOptions: {
    rewrite: {
      'README.md': '/index.html',
      'CHANGES.md': '/changes.html',
    },

    bannerLinks: [
      {
        text: 'Usage',
        href: '/usage/readme',
      },

      {
        text: 'Plugins',
        links: [
          {
            text: 'Dot (graphs)',
            href: '/plugins/megadoc-plugin-dot/readme.html',
          },

          {
            text: 'Git',
            href: '/plugins/megadoc-plugin-git/readme.html',
          },

          {
            text: 'JavaScript',
            href: '/plugins/megadoc-plugin-js/readme.html',
          },
          {
            text: 'JavaScript React',
            href: '/plugins/megadoc-plugin-react/readme.html',
          },

          {
            text: 'Markdown',
            href: '/plugins/megadoc-plugin-markdown/readme.html',
          },

          {
            text: 'Lua',
            href: '/plugins/megadoc-plugin-lua/readme.html',
          },

          {
            text: 'YARD-API',
            href: '/plugins/megadoc-plugin-yard-api/readme.html',
          },

          {
            text: 'Reference Graph',
            href: '/plugins/megadoc-plugin-reference-graph/readme.html',
          },

          {
            text: 'Theme - Qt',
            href: '/plugins/megadoc-theme-qt/readme.html',
          },

          {
            text: 'Theme - gitbooks.io',
            href: '/plugins/megadoc-theme-qt/readme.html',
          },
        ]
      },

      {
        text: 'Developers',
        links: [
          {
            text: 'Plugins',
            href: '/dev/plugins/readme.html',
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
        match: { by: 'uid', on: [ 'md__core/readme', 'md__core/changes' ] },
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
    ]
  },

};

config.plugins = [
  require('megadoc-plugin-js')({
    id: 'js__core',
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
      'ui/': 'Core.UI',
    }
  }),

  require('megadoc-plugin-markdown')({
    id: 'md__core',
    title: 'Documents',
    source: [ 'README.md', 'CHANGES.md' ],
  }),

  // @url: /usage
  require('megadoc-plugin-markdown')({
    id: 'md__usage',
    baseURL: '/usage',
    source: [ 'doc/usage/**/*.md' ],
    title: 'Usage',
    fullFolderTitles: false,
  }),

  // @url: /dev/plugins
  require('megadoc-plugin-markdown')({
    id: 'md__plugins',
    baseURL: '/dev/plugins',
    source: [ 'doc/dev/**/*.md', 'doc/dev-cookbook/**/*.md' ],
    title: 'Plugin Development',
    fullFolderTitles: false,
    discardIdPrefix: 'dev-',
  }),

  require('megadoc-theme-qt')({}),
  require('megadoc-plugin-dot')({}),

];

addPackageDocumentation('megadoc-corpus', {
  url: '/dev/corpus'
});

addPackageDocumentation('megadoc-plugin-dot', { withJS: false });
addPackageDocumentation('megadoc-plugin-git');
addPackageDocumentation('megadoc-plugin-js');
addPackageDocumentation('megadoc-plugin-lua');
addPackageDocumentation('megadoc-plugin-markdown');
addPackageDocumentation('megadoc-plugin-react');
addPackageDocumentation('megadoc-plugin-reference-graph');
addPackageDocumentation('megadoc-plugin-yard-api');
addPackageDocumentation('megadoc-theme-gitbooks');
addPackageDocumentation('megadoc-theme-qt');

module.exports = config;

function addPackageDocumentation(pluginName, options) {
  var url = (options && options.url) || '/plugins/' + pluginName;
  var withJS = !options || options.withJS !== false;

  if (withJS) {
    config.plugins.push(require('megadoc-plugin-js')({
      id: 'js__' + pluginName,
      url: url,
      title: pluginName,
      useDirAsNamespace: false,
      inferModuleIdFromFileName: true,
      source: [
        'packages/' + pluginName + '/**/*.js'
      ],

      exclude: [ /__tests__/, /vendor/, /node_modules/ ],
    }));
  }

  config.plugins.push(require('megadoc-plugin-markdown')({
    id: 'md__' + pluginName,
    title: pluginName,
    source: [ 'packages/' + pluginName + '/**/*.md' ],
    exclude: [ /node_modules/, /__tests__/ ],
    baseURL: url,
  }));

  config.layoutOptions.customLayouts.push({
    match: { by: 'url', on: url },
    regions: [
      {
        name: 'Layout::Sidebar',
        outlets: [
          { name: 'Markdown::Browser', using: 'md__' + pluginName },
          { name: 'Layout::SidebarHeader', options: { text: 'API' } },
          withJS && { name: 'CJS::ClassBrowser', using: 'js__' + pluginName },
        ].filter(truthy)
      },
      {
        name: 'Layout::Content',
        options: { framed: true },
        outlets: [
          {
            name: 'Markdown::Document',
            match: { by: 'namespace', on: [ 'md__' + pluginName ] },
          },
          withJS && {
            name: 'CJS::Module',
            match: { by: 'namespace', on: [ 'js__' + pluginName ] },
          }
        ].filter(truthy)
      },
    ]
  });
}

function truthy(x) {
  return !!x;
}