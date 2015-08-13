tinydocReact.use(function(reporter) {
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
      name: 'api.class',
      handler: require('./screens/Class'),
      parent: 'api',
      path: 'classes/:classId'
    },

  ]);

  reporter.registerOutletElement('navigation', require('./outlets/Navigation'));
});