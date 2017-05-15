const Storage = require('core/Storage');
const K = require('./constants');

Storage.register(K.CFG_CLASS_BROWSER_EXPAND_ALL, false);

megadoc.outlets.define('YARD-API::Controller');
megadoc.outlets.define('YARD-API::Browser');

megadoc.use('yard-api', function YARDAPIPlugin() {
  require('./outlets/ControllerOutlet');
  require('./outlets/BrowserOutlet');
});