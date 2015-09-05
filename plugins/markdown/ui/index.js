const config = require('config');
const NavigationOutlet = require('./outlets/Navigation');
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
  const routeName = config.name;

  api.registerRoutes([
    {
      name: routeName,
      path: routeName,
      handler: React.createClass({
        render() {
          return <Root {...this.props} />;
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

  api.registerOutletElement('navigation', NavigationOutlet);

  api.on('started', function() {
    LinkResolver.use(function(id, registry) {
      const index = registry[id];

      if (index && index.type === 'markdown') {
        const article = Database.get(index.articleId);

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
});