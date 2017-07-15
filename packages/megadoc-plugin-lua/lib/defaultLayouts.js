module.exports = [
  {

    match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
    regions: [
      {
        name: 'Layout::Content',
        options: { framed: true },
        outlets: [
          { name: 'Lua::Module' },
          { name: 'Layout::Content' }
        ]
      },
      {
        name: 'Layout::Sidebar',
        outlets: [
          { name: 'Lua::Browser' },
          { name: 'Layout::Sidebar' }
        ]
      }
    ]
  },
  {
    match: { by: 'type', on: [ 'Namespace' ] },
    regions: [
      {
        name: 'Layout::Content',
        options: { framed: true },
        outlets: [
          { name: 'Lua::Index' },
          { name: 'Layout::Content' }
        ]
      },
      {
        name: 'Layout::Sidebar',
        outlets: [
          { name: 'Lua::Browser' },
          { name: 'Layout::Sidebar' }
        ]
      }
    ]
  },
]