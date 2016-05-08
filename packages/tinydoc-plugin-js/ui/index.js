const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_SHOW_PRIVATE, false);

tinydoc.outlets.define('CJS::Landing');
tinydoc.outlets.define('CJS::ModuleBody');
tinydoc.outlets.define('CJS::ModuleHeader::Type');
tinydoc.outlets.define('CJS::Tag');
tinydoc.outlets.define('CJS::ExampleTags');
tinydoc.outlets.define('CJS::ExampleTag');

tinydoc.use('tinydoc-plugin-js', function CJSPlugin(api, configs) {
  configs.forEach(function(config) {
    require('./outlets/InspectorOutlet')(api, config);
  });

  require('./outlets/ModuleOutlet')(api);
  require('./outlets/ClassBrowserOutlet')(api);
});
