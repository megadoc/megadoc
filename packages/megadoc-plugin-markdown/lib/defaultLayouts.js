module.exports = [
  // index pages, no sidebar, only content panel
  {
    match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
    regions: [
      {
        name: 'Core::Content',
        options: { framed: true },
        outlets: [
          { name: 'Markdown::Document' },
          { name: 'Core::Content' },
        ]
      },
      {
        name: 'Core::Sidebar',
        outlets: [
          { name: 'Markdown::Browser' },
          { name: 'Core::Sidebar' }
        ]
      }
    ]
  },

  // within our namespace, we'll show the sidebar:
  {
    match: { by: 'type', on: [ 'Namespace' ] },
    regions: [
      {
        name: 'Core::Sidebar',
        outlets: [{ name: 'Markdown::Browser' }]
      }
    ]
  }
];