const Router = require('core/Router');
const Storage = require('core/Storage');
const LinkResolver = require('core/LinkResolver');
const Database = require('core/Database');
const K = require('constants');
const { findWhere } = require('lodash');

Storage.register(K.CFG_CLASS_BROWSER_EXPAND_ALL, false);

tinydoc.use(function YARDAPIPlugin(api) {
  api.registerRoutes([
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

  api.registerOutletElement('navigation', require('./outlets/Navigation'));

  api.on('started', function() {
    LinkResolver.use(require('utils/resolveLink'));
  });
});