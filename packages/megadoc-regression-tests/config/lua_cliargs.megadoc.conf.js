exports.serializer = ['megadoc-html-serializer', {
  title: 'lua_cliargs',
  spotlight: false,
  fixedSidebar: true,
  collapsibleSidebar: true,
  banner: false,

  theme: 'megadoc-theme-minimalist',

  customLayouts: [
    {
      match: { by: 'namespace', on: 'lua' },
      regions: [
        {
          name: 'Core::Content',
          options: { framed: true },
          outlets: [
            {
              name: 'Lua::AllModules'
            }
          ]
        },
        {
          name: 'Core::Sidebar',
          outlets: [
            {
              name: 'Lua::Browser',
              options: {
                expanded: true
              }
            }
          ]
        }
      ]
    }
  ]
}]

exports.sources = [
  {
    id: 'lua',
    include: 'src/**/*.lua',
    processor: ['megadoc-plugin-lua', {
      title: 'lua_cliargs',
      url: '/'
    }],
  }
];