const createNavigationOutlet = require('./outlets/Navigation');
const React = require('react');
const Root = require('./screens/Root');
const LinkResolver = require('core/LinkResolver');
const Database = require('core/Database');
const Storage = require('core/Storage');
const K = require('constants');
const strHumanize = require('tinydoc/lib/utils/strHumanize');
const Router = require('core/Router');

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
      path: '*',
      handler: require('./screens/Article'),
      parent: routeName
    }
  ]);

  if (config.title) {
    api.registerOutletElement('navigation', createNavigationOutlet(config));
  }

  api.on('started', function() {
    LinkResolver.use(function(id, registry) {
      const index = registry[id];

      if (index && index.type === 'markdown') {
        const article = database.get(index.articleId);

        console.assert(!!article,
          `Expected to find a markdown article with id '${index.articleId}'`
        );

        return {
          href: Router.makeHref(`${config.name}.article`, { splat: article.id }),
          title: `${strHumanize(config.title)}: ${article.title}`
        };
      }
    });
  });
}