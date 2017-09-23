module.exports = [
  {

    match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
    regions: [
      {
        name: 'Core::Content',
        options: { framed: true },
        outlets: [
          { name: 'Lua::Module' },
          { name: 'Core::Content' }
        ]
      },
      {
        name: 'Core::Sidebar',
        outlets: [
          { name: 'Lua::Browser' },
          { name: 'Core::Sidebar' }
        ]
      }
    ]
  },
  {
    match: { by: 'type', on: [ 'Namespace' ] },
    regions: [
      {
        name: 'Core::Content',
        options: { framed: true },
        outlets: [
          { name: 'Lua::Index' },
          { name: 'Core::Content' }
        ]
      },
      {
        name: 'Core::Sidebar',
        outlets: [
          { name: 'Lua::Browser' },
          { name: 'Core::Sidebar' }
        ]
      }
    ]
  },
]