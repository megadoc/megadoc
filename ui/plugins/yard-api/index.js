tinydocReact.use(function YARDAPIPlugin(reporter) {
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
      handler: require('./screens/Class'),
      parent: 'api',
      path: '/resources/:resourceId'
    },

  ]);

  reporter.registerOutletElement('navigation', require('./outlets/Navigation'));
});