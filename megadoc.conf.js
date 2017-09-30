var path = require('path');
var config = {
  assetRoot: path.resolve(__dirname),

  title: 'megadoc',
  outputDir: path.resolve(__dirname, 'doc/compiled'),
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
    'megadoc-regression-tests': 'md__megadoc-regression-tests/readme',
    'CorpusUIDs': 'md__megadoc-corpus/readme#uids',
  },

};

config.sources = [
  // {
  //   id: 'js__core',
  //   title: 'API',

  //   include: [
  //     'packages/megadoc-compiler/lib/**/*.js',
  //     'packages/megadoc-html-serializer/ui/**/*.js',
  //   ],

  //   exclude: [
  //     '**/__tests__/**',
  //     '**/vendor/**',
  //   ],

  //   processor: [ 'megadoc-plugin-js', {
  //     baseURL: '/dev/api',
  //     useDirAsNamespace: false,
  //     parserOptions: {
  //       presets: [
  //         path.resolve(__dirname, 'packages/megadoc-html-serializer/node_modules/babel-preset-es2015'),
  //         path.resolve(__dirname, 'packages/megadoc-html-serializer/node_modules/babel-preset-react'),
  //       ],
  //     },

  //     namespaceDirMap: {
  //       'ui/': 'UI',
  //     }
  //   }]
  // },
  {
    id: 'md__core',
    title: 'Documents',
    include: [ 'README.md', 'CHANGELOG.md' ],
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
];

config.serializer = [ 'megadoc-html-serializer', {
  redirect: {
    '/index.html': '/readme.html'
  },
  rewrite: {
    '/dev/handbook/api.html': '/dev/api/index.html'
  },
  theme: [ 'megadoc-theme-minimalist' ],

  linkResolver: {
    schemes: [ 'Megadoc', 'GitHub Wiki' ],
    ignore: {
      'md__core/changelog': true
    },
  },

  styleSheet: path.resolve(__dirname, 'doc/theme.less'),

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
          href: '/plugins/megadoc-html-dot/readme.html',
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
          text: 'Markdown',
          href: '/plugins/megadoc-plugin-markdown/readme.html',
        },

        {
          text: 'Lua',
          href: '/plugins/megadoc-plugin-lua/readme.html',
        },

        {
          text: 'Theme - Qt',
          href: '/plugins/megadoc-theme-qt/readme.html',
        },

        {
          text: 'Theme - Minimalist',
          href: '/plugins/megadoc-theme-minimalist/readme.html',
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
          href: '/dev/api/index.html',
        },

        {
          text: 'Corpus',
          href: '/dev/corpus/readme.html',
        },
      ]
    },

    {
      text: 'Changes',
      href: '/changelog.html',
    },

  ],

  customLayouts: [
    {
      match: { by: 'uid', on: [ 'md__core/readme', 'md__core/changelog' ] },
      regions: [
        {
          name: 'Core::Content',
          options: { framed: true },
          outlets: [
            { name: 'Markdown::Document' }
          ]
        },
        {
          name: 'Core::Sidebar',
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

addPackageDocumentation('megadoc-compiler', {
  url: '/dev/megadoc-compiler'
});

addPackageDocumentation('megadoc-linter', {
  url: '/dev/megadoc-linter'
});

addPackageDocumentation('megadoc-html-serializer', {
  url: '/dev/megadoc-html-serializer',
  js: {
    parserOptions: {
      presets: [
        path.resolve(__dirname, 'packages/megadoc-html-serializer/node_modules/babel-preset-es2015'),
        path.resolve(__dirname, 'packages/megadoc-html-serializer/node_modules/babel-preset-react'),
      ],
    },
  }
});

addPackageDocumentation('megadoc-docstring', {
  url: '/dev/megadoc-docstring'
});

addPackageDocumentation('megadoc-config-utils', {
  url: '/dev/megadoc-config-utils'
});

addPackageDocumentation('megadoc-test-utils', {
  url: '/dev/megadoc-test-utils'
});

addPackageDocumentation('megadoc-regression-tests', {
  withJS: false,
  url: '/dev/megadoc-regression-tests'
});

addPackageDocumentation('megadoc-html-dot');
addPackageDocumentation('megadoc-plugin-git');
addPackageDocumentation('megadoc-plugin-js');
addPackageDocumentation('megadoc-plugin-lua');
addPackageDocumentation('megadoc-plugin-markdown');
addPackageDocumentation('megadoc-theme-minimalist');
addPackageDocumentation('megadoc-theme-qt');

module.exports = config;

function addPackageDocumentation(pluginName, options = {}) {
  var url = options.url || ('/plugins/' + pluginName);
  var withJS = options.withJS !== false;

  if (withJS) {
    config.sources.push({
      id: 'js__' + pluginName,
      include: [
        'packages/' + pluginName + '/{lib,ui,defs}**/*.js'
      ],
      exclude: [
        '**/__tests__/**'
      ],
      processor: [ 'megadoc-plugin-js', Object.assign({
        baseURL: url,
        title: pluginName,
        useDirAsNamespace: false,
        inferModuleIdFromFileName: true,

        namespaceDirMap: {
          'ui/': 'UI',
        },
      }, options.js)],
      decorators: [
        [ 'megadoc-html-dot', {
          allowLinks: true
        }]
      ]
    });
  }

  config.sources.push({
    id: 'md__' + pluginName,
    include: [ 'packages/' + pluginName + '/**/*.md' ],
    exclude: [ '**/node_modules/**', '**/__tests__/**' ],
    processor: [ 'megadoc-plugin-markdown', {
      title: pluginName,
      baseURL: url,
    }],
    decorators: [
      [ 'megadoc-html-dot', {
        allowLinks: true
      }]
    ]
  });

  config.serializer[1].customLayouts.push({
    match: { by: 'url', on: url },
    regions: [
      {
        name: 'Core::Sidebar',
        outlets: [
          {
            name: 'Markdown::Browser',
            using: 'md__' + pluginName,
            options: { flat: true }
          },
          withJS && { name: 'Core::SidebarHeader', options: { text: 'API' } },
          withJS && {
            name: 'JS::Browser',
            using: 'js__' + pluginName,
            options: { flat: true },
          },
        ].filter(truthy)
      },
      {
        name: 'Core::Content',
        options: { framed: true },
        outlets: [
          {
            name: 'Markdown::Document',
            match: { by: 'namespace', on: 'md__' + pluginName },
          },
          withJS && {
            name: 'JS::Module',
            match: { by: 'namespace', on: 'js__' + pluginName },
          }
        ].filter(truthy)
      },

      {
        name: 'Core::NavBar',
        options: { framed: true },
        outlets: [
          {
            name: 'Markdown::DocumentTOC',
            match: {
              by: 'namespace',
              on: 'md__' + pluginName
            },
          },
          withJS && {
            name: 'JS::ModuleEntities',
            match: { by: 'namespace', on: 'js__' + pluginName },
          }
        ].filter(truthy)
      }
    ]
  });
}

function truthy(x) {
  return !!x;
}