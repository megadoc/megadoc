module.exports = [
  {
    match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
    regions: [
      {
        name: 'Layout::Content',
        options: { framed: true },
        outlets: [
          { name: 'YARD-API::Controller' },
          { name: 'Layout::Content' },
        ]
      },
      {
        name: 'Layout::Sidebar',
        outlets: [
          { name: 'YARD-API::Browser' }
        ]
      }
    ]
  },
  {
    match: { by: 'type', on: [ 'Namespace' ] },
    regions: [
      {
        name: 'Layout::Sidebar',
        outlets: [
          { name: 'YARD-API::Browser' }
        ]
      }
    ]
  }
]