const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_EXPAND_ALL, false);

tinydoc.outlets.define('YARD-API::Controller');
tinydoc.outlets.define('YARD-API::Browser');

tinydoc.use('yard-api', function YARDAPIPlugin(api, configs) {
  require('./outlets/ControllerOutlet');
});