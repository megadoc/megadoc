const Database = require('core/Database');
const Storage = require('core/Storage');
const K = require('constants');
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
    const { routeName } = config;

    Database.createDatabase(config);

    api.addRoutes([
      {
        name: routeName,
        path: routeName,
        // handler: require('./screens/Root')(routeName)
      },

      {
        default: true,
        name: `${routeName}.landing`,
        handler: require('./screens/Landing'),
        parent: routeName
      },

      {
        name: `${routeName}.module`,
        path: 'modules/:moduleId',
        handler: require('./screens/Module'),
        parent: routeName,
        ignoreScrollBehavior: true
      },
      {
        name: `${routeName}.module.entity`,
        parent: `${routeName}.module`,
        path: ':entity',
        ignoreScrollBehavior: true
      },
    ]);

    // api.inspector.use(config.routeName, PreviewHandler);
    // api.registerPreviewHandler(PreviewHandler(config, database));
    // require('./SymbolIndexer')(api, config);

    require('./outlets/InspectorOutlet')(api, config);
    require('./outlets/MultiPageLayout')(api, config);
    require('./outlets/SinglePageLayout')(api, config);
  });
});