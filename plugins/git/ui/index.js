var config = require('config');

tinydoc.use(function GitPlugin(api) {
  api.registerRoutes([
    {
      name: 'git',
      path: config.routeName,
      handler: require('./screens/Root')
    }
  ]);

  api.registerOutletElement('navigation', require('./outlets/Navigation'));
});