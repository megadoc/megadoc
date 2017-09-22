var path = require('path');
var config = {
  assetRoot: path.resolve(__dirname),

  title: 'megadoc',
  outputDir: '/srv/http/docs/megadoc',
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
  strict: true,

  alias: {
    'megadoc-plugin-markdown': 'md__megadoc-plugin-markdown/readme',
    'megadoc-plugin-js': 'md__megadoc-plugin-js/readme',
    'megadoc-plugin-git': 'md__megadoc-plugin-git/readme',
    'megadoc-plugin-lua': 'md__megadoc-plugin-lua/readme',
    'megadoc-plugin-yard-api': 'md__megadoc-plugin-yard-api/readme',
    'CorpusUIDs': 'md__megadoc-corpus/readme#uids',
  },

};

config.sources = [
  {
    id: 'js__core',
    url: '/dev/api',
    title: 'API',

    include: [
      'lib/**/*.js',
      'ui/**/*.js',
    ],

    exclude: [
      '**/__tests__/**',
      '**/vendor/**',
    ],

    processor: [ 'megadoc-plugin-js', {
      useDirAsNamespace: false,

      namespaceDirMap: {
        'ui/': 'UI',
      }
    }]
  },
  {
    id: 'md__core',
    title: 'Documents',
    include: [ 'README.md', 'CHANGES.md' ],
    processor: [ 'megadoc-plugin-markdown', {
      baseURL: '/',
    }]
  },

  // @url: /usage
  {
    id: 'md__usage',
    title: 'Documents',
    include: [ 'doc/usage/**/*.md' ],
    processor: [ 'megadoc-plugin-markdown', {
      baseURL: '/usage',
      title: 'Usage',
      fullFolderTitles: false,
    }]
  },

  // @url: /dev/handbook
  {
    id: 'md__plugins',
    include: [ 'doc/dev/**/*.md', 'doc/dev-cookbook/**/*.md' ],
    processor: [ 'megadoc-plugin-markdown', {
      baseURL: '/dev/handbook',
      title: 'Plugin Development',
      fullFolderTitles: false,
      discardIdPrefix: 'dev-',
    }]
  },
  // require('megadoc-plugin-dot')({}),

];

config.serializer = [ 'megadoc-html-serializer', {
  redirect: {
    '/index.html': '/readme.html'
  },
  theme: [ 'megadoc-theme-minimalist' ],

  linkResolver: {
    schemes: [ 'Megadoc', 'GitHub Wiki' ],
    ignore: {
      'md__core/changes': true
    },
  },

  rewrite: {
    // 'README.md': '/index.html',
    // 'CHANGES.md': '/changes.html',
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
          href: '/plugins/megadoc-theme-gitbooks/readme.html',
        },
      ]
    },

    {
      text: 'Developers',
      links: [
        {
          text: 'Handbook',
          href: '/dev/handbook/readme.html',
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
  ],
}]

addPackageDocumentation('megadoc-corpus', {
  url: '/dev/corpus'
});

addPackageDocumentation('megadoc-compiler');
addPackageDocumentation('megadoc-linter');
addPackageDocumentation('megadoc-html-serializer');
addPackageDocumentation('megadoc-docstring');
addPackageDocumentation('megadoc-config-utils');
addPackageDocumentation('megadoc-test-utils');
addPackageDocumentation('megadoc-plugin-dot');
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
  var url = options && options.url || ('/plugins/' + pluginName);
  var withJS = !options || options.withJS !== false;

  if (withJS) {
    config.sources.push({
      id: 'js__' + pluginName,
      include: [
        'packages/' + pluginName + '/{lib,defs}**/*.js'
      ],
      exclude: [
        '**/__tests__/**'
      ],
      processor: [ 'megadoc-plugin-js', {
        baseURL: url,
        title: pluginName,
        useDirAsNamespace: false,
        inferModuleIdFromFileName: true,

        namespaceDirMap: {
          'ui/': 'UI',
        },

      }]
    });
  }

  config.sources.push({
    id: 'md__' + pluginName,
    include: [ 'packages/' + pluginName + '/**/*.md' ],
    exclude: [ '**/node_modules/**', '**/__tests__/**' ],
    processor: [ 'megadoc-plugin-markdown', {
      title: pluginName,
      baseURL: url,
    }]
  });

  // config.serializer[1].customLayouts.push({
  //   match: { by: 'url', on: url },
  //   regions: [
  //     {
  //       name: 'Layout::Sidebar',
  //       outlets: [
  //         {
  //           name: 'Markdown::Browser',
  //           using: 'md__' + pluginName,
  //           options: { flat: true }
  //         },
  //         withJS && { name: 'Layout::SidebarHeader', options: { text: 'API' } },
  //         withJS && {
  //           name: 'CJS::ClassBrowser',
  //           using: 'js__' + pluginName,
  //           options: { flat: true },
  //         },
  //       ].filter(truthy)
  //     },
  //     {
  //       name: 'Layout::Content',
  //       options: { framed: true },
  //       outlets: [
  //         {
  //           name: 'Markdown::Document',
  //           match: { by: 'namespace', on: [ 'md__' + pluginName ] },
  //         },
  //         withJS && {
  //           name: 'CJS::Module',
  //           match: { by: 'namespace', on: [ 'js__' + pluginName ] },
  //         }
  //       ].filter(truthy)
  //     },

  //     {
  //       name: 'Layout::NavBar',
  //       options: { framed: true },
  //       outlets: [
  //         {
  //           name: 'Markdown::DocumentTOC',
  //           match: { by: 'namespace', on: [ 'md__' + pluginName ] },
  //         },
  //         withJS && {
  //           name: 'CJS::ModuleEntities',
  //           match: { by: 'namespace', on: [ 'js__' + pluginName ] },
  //         }
  //       ]
  //     }
  //   ]
  // });
}

function truthy(x) {
  return !!x;
}