var Database = require('core/Database');
var LinkResolver = require('core/LinkResolver');
var config = require('config');

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
      name: 'js.class',
      path: 'classes/:classId',
      handler: require('./screens/Class'),
      parent: 'js'
    }
  ]);

  api.registerOutletElement('navigation', require('./outlets/Navigation'));

  api.on('started', function() {
    LinkResolver.registerResolver((function() {
      var links = Database.getLinks();

      return function resolve(id) {
        var entity;

        if (links[id]) {
          entity = links[id];
        }

        return entity;
      };
    }()));
  });
});