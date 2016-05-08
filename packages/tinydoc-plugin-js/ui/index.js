const Storage = require('core/Storage');
const K = require('constants');
const React = require('react');
const Module = require('components/Module');
// const PreviewHandler = require('./PreviewHandler');

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

function renderDocument(documentNode, namespaceNode) {
  return (
    <Module
      documentNode={documentNode}
      namespaceNode={namespaceNode}
    />
  );
}