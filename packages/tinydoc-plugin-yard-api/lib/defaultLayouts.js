module.exports = [
  {
    match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
    regions: [
      {
        name: 'Layout::Content',
        outlets: [
          { name: 'YARD-API::Controller' }
        ]
      },
      {
        name: 'Layout::Sidebar',
        outlets: [
          { name: 'YARD-API::Browser' }
        ]
      }
    ]
  }
]