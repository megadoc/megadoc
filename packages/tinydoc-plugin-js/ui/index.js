const Database = require('core/Database');
const Storage = require('core/Storage');
const K = require('constants');
const OutletManager = require('core/OutletManager');
const PreviewHandler = require('./PreviewHandler');

Storage.register(K.CFG_CLASS_BROWSER_SHOW_PRIVATE, false);

OutletManager.define('CJS::Landing', { firstMatching: true });
OutletManager.define('CJS::ModuleBody');
OutletManager.define('CJS::ModuleHeader::Type', { firstMatching: true });
OutletManager.define('CJS::Tag');
OutletManager.define('CJS::ExampleTags');
OutletManager.define('CJS::ExampleTag', { firstMatching: true });

tinydoc.use('tinydoc-plugin-js', function CJSPlugin(api, configs) {
  configs.forEach(function(config) {
    const { routeName } = config;

    const database = Database.createDatabase(config);

    api.addRoutes([
      {
        name: routeName,
        path: '/' + routeName,
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

    api.registerPreviewHandler(PreviewHandler(config, database));

    require('./outlets/MultiPageLayout')(api, config);
    require('./outlets/SinglePageLayout')(api, config);
  });
});