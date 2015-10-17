const createNavigationOutlet = require('./outlets/Navigation');
const createSinglePageLayoutOutlet = require('./outlets/SinglePageLayout');
const React = require('react');
const Root = require('./screens/Root');
const Database = require('core/Database');
const OutletManager = require('core/OutletManager');
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
  const { routeName } = config;

  Database.createDatabase(routeName, config);

  api.addRoutes([
    {
      name: routeName,
      path: config.path || routeName,
      handler: React.createClass({
        render() {
          return (
            <Root
              config={config}
              routeName={routeName}
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
      parent: routeName,
      ignoreScrollBehavior: true,
    },

    {
      name: `${routeName}.article.section`,
      parent: `${routeName}.article`,
      path: ':sectionId',
      ignoreScrollBehavior: true,
    }
  ]);

  if (config.title) {
    OutletManager.add('navigation', {
      key: config.routeName,
      component: createNavigationOutlet(config)
    });
  }

  createSinglePageLayoutOutlet(routeName, config);
}