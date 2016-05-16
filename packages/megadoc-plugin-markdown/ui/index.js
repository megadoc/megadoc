const Database = require('./Database');
const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_GROUP_BY_FOLDER, true);

megadoc.outlets.define('Markdown::Document');
megadoc.outlets.define('Markdown::DocumentTOC');
megadoc.outlets.define('Markdown::Browser');

megadoc.use('megadoc-plugin-markdown', function MarkdownPlugin(api, configs) {
  require('./outlets/BrowserOutlet');
  require('./outlets/DocumentOutlet');
  require('./outlets/DocumentTOCOutlet');
  require('./outlets/InspectorOutlet');
});