const Database = require('core/Database');
const LinkResolver = require('core/LinkResolver');
const config = require('config');
const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_SHOW_PRIVATE, false);

tinydocReact.use(function CJSPlugin(api) {
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
    const links = Database.getLinks();

    LinkResolver.registerResolver('JS', function resolveLink(id, context) {
      console.debug('cjs: looking for an entity called', id);

      if (links[id]) {
        return links[id];
      }
      else if (context.moduleId) {
        return links[context.moduleId + id];
      }
    });
  });
});