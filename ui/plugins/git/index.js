var config = require('config');

tinydocReact.use(function GitPlugin(api) {
  api.registerRoutes([
    {
      name: 'git',
      path: config.path,
      handler: require('./screens/Root')
    }
  ]);

  api.registerOutletElement('navigation', require('./outlets/Navigation'));
});