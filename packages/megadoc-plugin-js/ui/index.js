const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_SHOW_PRIVATE, false);

megadoc.outlets.define('CJS::Landing');
megadoc.outlets.define('CJS::ClassBrowser');
megadoc.outlets.define('CJS::Module');
megadoc.outlets.define('CJS::ModuleHeader');
megadoc.outlets.define('CJS::ModuleHeader::Type');
megadoc.outlets.define('CJS::ModuleIndex');
megadoc.outlets.define('CJS::ModuleBody');
megadoc.outlets.define('CJS::NamespaceIndex');
megadoc.outlets.define('CJS::Tag');
megadoc.outlets.define('CJS::ExampleTags');
megadoc.outlets.define('CJS::ExampleTag');

megadoc.use('megadoc-plugin-js', function CJSPlugin() {
  require('./outlets/InspectorOutlet');
  require('./outlets/ModuleOutlet');
  require('./outlets/ModuleHeaderOutlet');
  require('./outlets/ModuleIndexOutlet');
  require('./outlets/ModuleBodyOutlet');
  require('./outlets/ClassBrowserOutlet');
  require('./outlets/NamespaceIndexOutlet');
});
