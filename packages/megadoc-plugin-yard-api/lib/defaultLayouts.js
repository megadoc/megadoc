module.exports = [
  {
    match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
    regions: [
      {
        name: 'Core::Content',
        options: { framed: true },
        outlets: [
          { name: 'YARD-API::Controller' },
          { name: 'Core::Content' },
        ]
      },
      {
        name: 'Core::Sidebar',
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
        name: 'Core::Sidebar',
        outlets: [
          { name: 'YARD-API::Browser' }
        ]
      }
    ]
  }
]