const InspectorOutlet = require('./outlets/InspectorOutlet');
const ModuleOutlet = require('./outlets/ModuleOutlet');
const ModuleEntitiesOutlet = require('./outlets/ModuleEntitiesOutlet');
const ModuleHeaderOutlet = require('./outlets/ModuleHeaderOutlet');
const ModuleIndexOutlet = require('./outlets/ModuleIndexOutlet');
const ModuleBodyOutlet = require('./outlets/ModuleBodyOutlet');
const ClassBrowserOutlet = require('./outlets/ClassBrowserOutlet');
const NamespaceIndexOutlet = require('./outlets/NamespaceIndexOutlet');

exports.outlets = [
  'JS::Browser',
  'JS::Module',
  'JS::ModuleEntities',
  'JS::ModuleHeader',
  'JS::ModuleHeader::Type',
  'JS::ModuleIndex',
  'JS::ModuleBody',
  'JS::Namespace',
  'JS::Tag',
  'JS::ExampleTags',
  'JS::ExampleTag',
];

exports.name = 'megadoc-plugin-js';
exports.outletOccupants = [
  { name: 'Core::Inspector', component: InspectorOutlet, },
  { name: 'JS::Module', component: ModuleOutlet, },
  { name: 'JS::ModuleEntities', component: ModuleEntitiesOutlet, },
  { name: 'JS::ModuleHeader', component: ModuleHeaderOutlet, },
  { name: 'JS::ModuleIndex', component: ModuleIndexOutlet, },
  { name: 'JS::ModuleBody', component: ModuleBodyOutlet, },
  { name: 'JS::Browser', component: ClassBrowserOutlet, },
  { name: 'JS::Namespace', component: NamespaceIndexOutlet, },
]