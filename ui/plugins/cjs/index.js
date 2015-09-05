const LinkResolver = require('core/LinkResolver');
const config = require('config');
const Storage = require('core/Storage');
const K = require('constants');
const resolveLink = require('utils/resolveLink');

Storage.register(K.CFG_CLASS_BROWSER_SHOW_PRIVATE, false);

tinydoc.use(function CJSPlugin(api) {
  api.registerRoutes([
    {
      name: 'js',
      path: config.path,
      handler: require('./screens/Root')
    },

    {
      name: 'js.landing',
      default: true,
      handler: require('./screens/Landing'),
      parent: 'js'
    },

    {
      name: 'js.module',
      path: 'modules/:moduleId',
      handler: require('./screens/Class'),
      parent: 'js'
    }
  ]);

  api.registerOutletElement('navigation', require('./outlets/Navigation'));

  api.on('started', function() {
    LinkResolver.use(resolveLink);
  });
});