module.exports = [
  // index pages, no sidebar, only content panel
  {
    match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
    regions: [
      {
        name: 'Layout::Content',
        options: { framed: true },
        outlets: [
          { name: 'Markdown::Document' },
          { name: 'Layout::Content' },
        ]
      },
      {
        name: 'Layout::Sidebar',
        outlets: [
          { name: 'Markdown::Browser' },
          { name: 'Layout::Sidebar' }
        ]
      }
    ]
  },

  // within our namespace, we'll show the sidebar:
  {
    match: { by: 'type', on: [ 'Namespace' ] },
    regions: [
      {
        name: 'Layout::Sidebar',
        outlets: [{ name: 'Markdown::Browser' }]
      }
    ]
  }
];