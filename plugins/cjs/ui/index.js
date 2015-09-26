const LinkResolver = require('core/LinkResolver');
const Database = require('core/Database');
const Storage = require('core/Storage');
const K = require('constants');
const resolveLink = require('utils/resolveLink');
const createNavigationOutlet = require('./outlets/Navigation');
const OutletManager = require('core/OutletManager');

Storage.register(K.CFG_CLASS_BROWSER_SHOW_PRIVATE, false);

OutletManager.define('CJS::ModuleHeader::Type', {
  firstMatching: true
});

OutletManager.define('CJS::Tag');
OutletManager.define('CJS::ExampleTags');

tinydoc.use(function CJSPlugin(api) {
  const configs = tinydoc.getRuntimeConfigs('cjs');

  configs.forEach(function(config) {
    let database = Database.createDatabase(config);
    const { routeName } = config;

    api.registerRoutes([
      {
        name: routeName,
        path: '/' + routeName,
        handler: require('./screens/Root')(routeName)
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
        parent: routeName
      }
    ]);

    api.registerOutletElement(
      'navigation',
      createNavigationOutlet(routeName, config.navigationLabel)
    );
  });

  api.on('started', function() {
    LinkResolver.use(resolveLink);
  });
});