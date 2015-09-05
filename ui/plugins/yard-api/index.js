const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_EXPAND_ALL, false);

tinydoc.use(function YARDAPIPlugin(reporter) {
  reporter.registerRoutes([
    {
      name: 'api',
      path: 'api',
      handler: require('./screens/Root')
    },

    {
      name: 'api.landing',
      default: true,
      handler: require('./screens/Landing'),
      parent: 'api'
    },

    {
      name: 'api.resource',
      handler: require('./screens/APIResource'),
      parent: 'api',
      path: 'resources/:resourceId'
    },

  ]);

  reporter.registerOutletElement('navigation', require('./outlets/Navigation'));
});