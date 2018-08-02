/* eslint-env node */
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const glob = require('glob');
const root = path.resolve(__dirname)

const manifests = glob.sync(path.join(root, 'packages/*/.megadoc.yml')).map(file => {
  return {
    name: path.basename(path.dirname(file)),
    spec: yaml.safeLoad(fs.readFileSync(file, 'utf8'))
  }
})

const config = {
  assetRoot: path.resolve(__dirname),

  title: 'megadoc',
  outputDir: path.resolve(__dirname, 'doc/compiled'),
  disqus: false,
  showSettingsLinkInBanner: false,
  tooltipPreviews: false,
  // corpus: {
  //   indexByFilepath: true,
  // },

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
  {
    id: 'md__core',
    title: 'Documents',
    include: [ 'README.md', 'CHANGELOG.md' ],
    processor: [ 'megadoc-plugin-markdown', {
      url: '/',
    }],
    decorators: ['megadoc-git-stats', 'megadoc-plugin-reference-graph'],
    tags: [ 'readme' ],
  },

  // @url: /usage
  {
    id: 'md__usage',
    title: 'Documents',
    include: [ 'doc/usage/**/*.md' ],
    processor: [ 'megadoc-plugin-markdown', {
      url: '/usage',
      title: 'Usage',
      fullFolderTitles: false,
    }],
    decorators: ['megadoc-git-stats', 'megadoc-plugin-reference-graph'],
    tags: [ 'usage' ]
  },

  // @url: /dev/handbook
  {
    id: 'md__plugins',
    include: [ 'doc/dev/**/*.md', 'doc/dev-cookbook/**/*.md' ],
    processor: [ 'megadoc-plugin-markdown', {
      url: '/dev',
      title: 'Plugin Development',
      fullFolderTitles: false,
      discardIdPrefix: 'dev-',
    }],
    decorators: ['megadoc-git-stats', 'megadoc-plugin-reference-graph'],
  },
];

config.serializer = [ 'megadoc-html-serializer', {
  redirect: {
    '/index.html': '/readme.html'
  },
  rewrite: {
    '/dev/api.html': '/dev/api/index.html'
  },
  theme: 'megadoc-theme-minimalist',

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
      links: [
        {
          text: 'Command Line Interface',
          href: '/cli/readme.html'
        }
      ]
    },

    {
      text: 'Plugins',
      links: [
        {
          text: 'Dot (graphs)',
          href: '/plugins/dot/readme.html',
        },

        {
          text: 'Git',
          href: '/plugins/git-stats/readme.html',
        },

        {
          text: 'JavaScript',
          href: '/plugins/js/readme.html',
        },

        {
          text: 'Markdown',
          href: '/plugins/markdown/readme.html',
        },

        {
          text: 'Lua',
          href: '/plugins/lua/readme.html',
        },

        {
          text: 'Ruby on Rails (YARD API)',
          href: '/plugins/yard-api/readme.html',
        },

        {
          text: 'Theme - Qt',
          href: '/themes/qt/readme.html',
        },

        {
          text: 'Theme - Minimalist',
          href: '/themes/minimalist/readme.html',
        },
      ]
    },

    {
      text: 'Developers',
      links: [
        {
          text: 'Handbook',
          href: '/dev/readme.html',
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
      match: { by: 'namespace', on: [ 'md__core' ] },
      regions: [
        {
          name: 'Core::Content',
          options: { framed: true },
          outlets: [
            { name: 'Markdown::Document' },
            { name: 'ReferenceGraph' },
            { name: 'GitStats' },
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
    {
      match: { by: 'url', on: '/dev/*' },
      regions: [
        {
          name: 'Core::Content',
          options: { framed: true },
          outlets: [
            { name: 'Markdown::Document', match: { by: 'plugin', on: 'megadoc-plugin-markdown' } },
            { name: 'JS::ModuleHeader', match: { by: 'plugin', on: 'megadoc-plugin-js' } },
            { name: 'JS::ModuleIndex', match: { by: 'plugin', on: 'megadoc-plugin-js' } },
            { name: 'JS::ModuleBody', match: { by: 'plugin', on: 'megadoc-plugin-js' } },
            { name: 'ReferenceGraph' },
            { name: 'GitStats' }
          ]
        },

        {
          name: 'Core::Sidebar',
          options: { framed: true },
          outlets: [
            {
              name: 'Markdown::Browser',
              using: 'md__plugins'
            },

            {
              name: 'Core::SidebarHeader',
              options: {
                text: 'Corpus',
              }
            },
            {
              name: 'Markdown::Browser',
              using: 'md__megadoc-corpus'
            },
            {
              name: 'JS::Browser',
              using: 'js__megadoc-corpus'
            },

            {
              name: 'Core::SidebarHeader',
              options: {
                text: 'Compiler',
              }
            },
            {
              name: 'Markdown::Browser',
              using: 'md__megadoc-compiler'
            },
            {
              name: 'JS::Browser',
              using: 'js__megadoc-compiler'
            },

            {
              name: 'Core::SidebarHeader',
              options: {
                text: 'HTML',
              }
            },
            {
              name: 'Markdown::Browser',
              using: 'md__megadoc-html-serializer'
            },
            {
              name: 'JS::Browser',
              using: 'js__megadoc-html-serializer'
            },

            {
              name: 'Core::SidebarHeader',
              options: {
                text: 'Linter',
              }
            },
            {
              name: 'Markdown::Browser',
              using: 'md__megadoc-linter'
            },
            {
              name: 'JS::Browser',
              using: 'js__megadoc-linter'
            },

            {
              name: 'Core::SidebarHeader',
              options: {
                text: 'Docstring',
              }
            },
            {
              name: 'Markdown::Browser',
              using: 'md__megadoc-docstring'
            },
            {
              name: 'JS::Browser',
              using: 'js__megadoc-docstring'
            },

            {
              name: 'Core::SidebarHeader',
              options: {
                text: 'Config Utils',
              }
            },
            {
              name: 'Markdown::Browser',
              using: 'md__megadoc-config-utils'
            },
            {
              name: 'JS::Browser',
              using: 'js__megadoc-config-utils'
            },

            {
              name: 'Core::SidebarHeader',
              options: {
                text: 'Test Utils',
              }
            },
            {
              name: 'Markdown::Browser',
              using: 'md__megadoc-test-utils'
            },
            {
              name: 'JS::Browser',
              using: 'js__megadoc-test-utils'
            },

            {
              name: 'Core::SidebarHeader',
              options: {
                text: 'Regression Tests',
              }
            },
            {
              name: 'Markdown::Browser',
              using: 'md__megadoc-regression-tests'
            },
          ]
        }
      ]
    }
  ],
}]

manifests.forEach(({ name, spec }) => {
  addPackageDocumentation(name, {
    url: spec.url,
    withJS: spec.js !== false,
    layouts: spec.layouts !== false
  })
})

// addPackageDocumentation('megadoc-cli', {
//   url: '/cli',
//   layouts: false,
// });

// addPackageDocumentation('megadoc-corpus', {
//   url: '/dev/corpus',
//   layouts: false,
// });

// addPackageDocumentation('megadoc-compiler', {
//   url: '/dev/megadoc-compiler',
//   layouts: false,
// });

// addPackageDocumentation('megadoc-linter', {
//   url: '/dev/megadoc-linter',
//   layouts: false,
// });

// addPackageDocumentation('megadoc-html-serializer', {
//   url: '/dev/megadoc-html-serializer',
//   layouts: false,
//   // js: {
//   //   parserOptions: {
//   //     presets: [
//   //       path.resolve(__dirname, 'packages/megadoc-html-serializer/node_modules/babel-preset-es2015'),
//   //       path.resolve(__dirname, 'packages/megadoc-html-serializer/node_modules/babel-preset-react'),
//   //     ],
//   //   },
//   // }
// });

// addPackageDocumentation('megadoc-docstring', {
//   url: '/dev/megadoc-docstring',
//   layouts: false,
// });

// addPackageDocumentation('megadoc-config-utils', {
//   url: '/dev/megadoc-config-utils',
//   layouts: false,
// });

// addPackageDocumentation('megadoc-test-utils', {
//   url: '/dev/megadoc-test-utils',
//   layouts: false,
// });

// addPackageDocumentation('megadoc-regression-tests', {
//   withJS: false,
//   url: '/dev/megadoc-regression-tests',
//   layouts: false,
// });

// addPackageDocumentation('megadoc-html-dot');
// addPackageDocumentation('megadoc-plugin-git');
// addPackageDocumentation('megadoc-plugin-js');
// addPackageDocumentation('megadoc-plugin-lua');
// addPackageDocumentation('megadoc-plugin-markdown');
// addPackageDocumentation('megadoc-plugin-yard-api');
// addPackageDocumentation('megadoc-theme-minimalist');
// addPackageDocumentation('megadoc-theme-qt');

module.exports = config;

function addPackageDocumentation(pluginName, options = {}) {
  var url = options.url || ('/plugins/' + pluginName);
  var withJS = options.withJS;

  if (withJS) {
    config.sources.push({
      id: 'js__' + pluginName,
      include: [
        'packages/' + pluginName + '/{lib,ui,defs}/**/*.js'
      ],
      exclude: [
        '**/__tests__/**',
        '**/vendor/**',
      ],

      processor: [ 'megadoc-plugin-js', Object.assign({
        url: url,
        title: pluginName,
        useDirAsNamespace: false,
        inferModuleIdFromFileName: true,
        inferNamespaces: false,

        builtInTypes: [
          {
            name: 'Glob',
            href: 'https://github.com/isaacs/node-glob'
          }
        ],

        namespaceDirMap: {
          'ui/': 'UI',
        },

        parserOptions: {
          presets: [
            path.resolve(__dirname, 'packages/megadoc-html-serializer/node_modules/babel-preset-es2015'),
            path.resolve(__dirname, 'packages/megadoc-html-serializer/node_modules/babel-preset-react'),
          ],
        },
      }, options.js)],

      decorators: [
        [ 'megadoc-html-dot', {
          allowLinks: true
        }],
        [ 'megadoc-git-stats' ],
        [ 'megadoc-plugin-reference-graph' ],
      ],

      tags: [ pluginName ],
    });
  }

  config.sources.push({
    id: 'md__' + pluginName,
    include: [ 'packages/' + pluginName + '/**/*.md' ],
    exclude: [ '**/node_modules/**', '**/__tests__/**' ],
    processor: [ 'megadoc-plugin-markdown', {
      title: pluginName,
      url: url,
    }],
    decorators: [
      [ 'megadoc-html-dot', {
        allowLinks: true
      }],

      'megadoc-git-stats',
      'megadoc-plugin-reference-graph',
    ],
    tags: [ pluginName ],
  });

  if (options.layouts) {
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
            },
            { name: 'ReferenceGraph' },
            { name: 'GitStats' },
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
}

function truthy(x) {
  return !!x;
}