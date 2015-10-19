const config = require('config');
const Outlet = require('components/Outlet');

tinydoc.use(function GitPlugin(api) {
  api.addRoutes([
    {
      name: 'git',
      path: config.routeName,
      handler: require('./screens/Root')
    }
  ]);

  Outlet.add('Navigation', {
    key: 'git__navigation',
    component: require('./outlets/Navigation')
  });
});