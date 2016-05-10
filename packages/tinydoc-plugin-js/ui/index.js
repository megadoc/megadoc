const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_SHOW_PRIVATE, false);

tinydoc.outlets.define('CJS::Landing');
tinydoc.outlets.define('CJS::ClassBrowser');
tinydoc.outlets.define('CJS::Module');
tinydoc.outlets.define('CJS::ModuleHeader');
tinydoc.outlets.define('CJS::ModuleHeader::Type');
tinydoc.outlets.define('CJS::ModuleIndex');
tinydoc.outlets.define('CJS::ModuleBody');
tinydoc.outlets.define('CJS::NamespaceIndex');
tinydoc.outlets.define('CJS::Tag');
tinydoc.outlets.define('CJS::ExampleTags');
tinydoc.outlets.define('CJS::ExampleTag');

tinydoc.use('tinydoc-plugin-js', function CJSPlugin() {
  require('./outlets/InspectorOutlet');
  require('./outlets/ModuleOutlet');
  require('./outlets/ModuleHeaderOutlet');
  require('./outlets/ModuleIndexOutlet');
  require('./outlets/ModuleBodyOutlet');
  require('./outlets/ClassBrowserOutlet');
  require('./outlets/NamespaceIndexOutlet');
});
