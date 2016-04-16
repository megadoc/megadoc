const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_EXPAND_ALL, false);

tinydoc.outlets.define('yard-api::Landing');
tinydoc.use('yard-api', function YARDAPIPlugin(api, configs) {
  const config = configs[0]; // TODO multiple route names
  const baseURL = config.routeName;

  api.addRoutes([
    {
      name: 'yard-api',
      path: baseURL,
    },

    {
      name: 'yard-api.landing',
      default: true,
      handler: require('./screens/Landing'),
      parent: 'yard-api'
    },

    {
      name: 'yard-api.resource',
      handler: require('./screens/APIResource'),
      parent: 'yard-api',
      path: 'resources/:resourceId',
      ignoreScrollBehavior: true,
    },

    {
      name: 'yard-api.resource.object',
      parent: 'yard-api.resource',
      path: 'objects/:objectId',
      ignoreScrollBehavior: true,
    },

    {
      name: 'yard-api.resource.endpoint',
      parent: 'yard-api.resource',
      path: 'endpoints/:endpointId',
      ignoreScrollBehavior: true,
    },
  ]);

  require('./SymbolIndexer')(api, config);
  require('./outlets/MultiPageLayout')(api, config);
});