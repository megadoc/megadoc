module.exports = [
  {
    match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
    regions: [
      {
        name: 'Layout::Content',
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
  }
]