const createNavigationOutlet = require('./outlets/Navigation');
const React = require('react');
const Root = require('./screens/Root');
const Database = require('core/Database');
const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_GROUP_BY_FOLDER, true);

tinydoc.use(function MarkdownPlugin(api) {
  const configs = tinydoc.getRuntimeConfigs('markdown');

  configs.forEach(function(config) {
    register(api, config);
  });
});

function register(api, config) {
  const routeName = config.name;
  const database = Database.createDatabase(routeName, config);

  api.registerRoutes([
    {
      name: routeName,
      path: config.path || routeName,
      handler: React.createClass({
        render() {
          return (
            <Root
              config={config}
              routeName={routeName}
              database={database}
              {...this.props}
            />
          );
        }
      })
    },

    {
      name: `${routeName}.landing`,
      default: true,
      handler: require('./screens/Landing'),
      parent: routeName
    },

    {
      name: `${routeName}.article`,
      path: ':articleId',
      handler: require('./screens/Article'),
      parent: routeName
    },

    {
      name: `${routeName}.article.section`,
      parent: `${routeName}.article`,
      path: ':sectionId'
    }
  ]);

  if (config.title) {
    api.registerOutletElement('navigation', createNavigationOutlet(config));
  }
}