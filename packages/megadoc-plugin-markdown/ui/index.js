const BrowserOutlet = require('./outlets/BrowserOutlet');
const DocumentOutlet = require('./outlets/DocumentOutlet');
const DocumentTOCOutlet = require('./outlets/DocumentTOCOutlet');
const InspectorOutlet = require('./outlets/InspectorOutlet');

module.exports = {
  name: 'megadoc-plugin-lua',
  outlets: [
    'Markdown::Document',
    'Markdown::DocumentTOC',
    'Markdown::Browser',
  ],

  outletOccupants: [
    { name: 'Markdown::Document', component: DocumentOutlet, },
    { name: 'Markdown::DocumentTOC', component: DocumentTOCOutlet, },
    { name: 'Markdown::Browser', component: BrowserOutlet, },
    { name: 'Core::Inspector', component: InspectorOutlet, },
  ]
};