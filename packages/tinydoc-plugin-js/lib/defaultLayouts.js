module.exports = [];
module.exports.push({
  match: { by: 'type', on: 'Namespace' },
  regions: [
    {
      name: 'Layout::Sidebar',
      outlets: [{ name: 'CJS::ClassBrowser' }]
    },

    {
      name: 'Layout::Content',
      options: { framed: true },
      outlets: [
        { name: 'CJS::ModuleHeader' },
        { name: 'CJS::NamespaceIndex' },
        { name: 'Layout::Content' },
      ]
    }
  ]
});

module.exports.push({
  match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
  regions: [
    {
      name: 'Layout::Content',
      options: { framed: true },
      outlets: [
        { name: 'CJS::ModuleHeader' },
        { name: 'CJS::ModuleIndex' },
        { name: 'CJS::ModuleBody' },
        { name: 'Layout::Content' },
      ]
    },
    {
      name: 'Layout::Sidebar',
      outlets: [{ name: 'CJS::ClassBrowser' }]
    }
  ]
});