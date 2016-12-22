const Storage = require('core/Storage');
const K = require('./constants');

Storage.register(K.CFG_CLASS_BROWSER_SHOW_PRIVATE, false);

exports.outlets = [
  'CJS::Landing',
  'CJS::ClassBrowser',
  'CJS::Module',
  'CJS::ModuleEntities',
  'CJS::ModuleHeader',
  'CJS::ModuleHeader::Type',
  'CJS::ModuleIndex',
  'CJS::ModuleBody',
  'CJS::NamespaceIndex',
  'CJS::Tag',
  'CJS::ExampleTags',
  'CJS::ExampleTag',
];

exports.name = 'megadoc-plugin-js';
exports.outletOccupants = [
  require('./outlets/InspectorOutlet'),
  require('./outlets/ModuleOutlet'),
  require('./outlets/ModuleEntitiesOutlet'),
  require('./outlets/ModuleHeaderOutlet'),
  require('./outlets/ModuleIndexOutlet'),
  require('./outlets/ModuleBodyOutlet'),
  require('./outlets/ClassBrowserOutlet'),
  require('./outlets/NamespaceIndexOutlet'),
]