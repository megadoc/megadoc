module.exports = [];
module.exports.push({
  match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
  regions: [
    {
      name: 'Core::Content',
      options: { framed: true },
      outlets: [
        { name: 'JS::ModuleHeader' },
        { name: 'JS::ModuleIndex' },
        { name: 'JS::ModuleBody' },
        { name: 'Core::Content' },
      ]
    },
    {
      name: 'Core::Sidebar',
      outlets: [{ name: 'JS::ClassBrowser' }]
    }
  ]
});

module.exports.push({
  match: { by: 'type', on: 'Namespace' },
  regions: [
    {
      name: 'Core::Sidebar',
      outlets: [{ name: 'JS::ClassBrowser' }]
    },

    {
      name: 'Core::Content',
      options: { framed: true },
      outlets: [
        { name: 'JS::ModuleHeader' },
        { name: 'JS::Namespace' },
        { name: 'Core::Content' },
      ]
    }
  ]
});