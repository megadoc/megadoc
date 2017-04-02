const Storage = require('core/Storage');
const K = require('constants');
Storage.register(K.CFG_CLASS_BROWSER_GROUP_BY_FOLDER, true);

const BrowserOutlet = require('./outlets/BrowserOutlet');
const DocumentOutlet = require('./outlets/DocumentOutlet');
const DocumentTOCOutlet = require('./outlets/DocumentTOCOutlet');

module.exports = {
  name: 'megadoc-plugin-lua',
  outlets: [
    'Markdown::Document',
    'Markdown::DocumentTOC',
    'Markdown::Browser',
  ],

  outletOccupants: [
    {
      name: 'Markdown::Document',
      component: DocumentOutlet,
    },
    {
      name: 'Markdown::DocumentTOC',
      component: DocumentTOCOutlet,
      match: DocumentTOCOutlet.match,
    },
    {
      name: 'Markdown::Browser',
      component: BrowserOutlet,
    },
  ]
};