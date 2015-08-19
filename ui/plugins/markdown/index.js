const config = require('config');
const NavigationOutlet = require('./outlets/Navigation');
const React = require('react');
const Root = require('./screens/Root');
const LinkResolver = require('core/LinkResolver');
const Database = require('core/Database');
const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_GROUP_BY_FOLDER, true);

tinydocReact.use(function MarkdownPlugin(api) {
  config.collections.forEach(function(collection) {
    var routeName = collection.name;

    api.registerRoutes([
      {
        name: routeName,
        path: routeName,
        handler: React.createClass({
          render() {
            return <Root collectionName={routeName} {...this.props} />;
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
      }
    ]);

    api.registerOutletElement('navigation',
      React.createClass({
        render() {
          return <NavigationOutlet {...collection} />;
        }
      }),
      collection.name
    );
  });

  api.on('started', function() {
    var links = Database.getLinkableEntities();
    var linkKeys = Object.keys(links);

    LinkResolver.registerResolver(function(id) {
      var entity;

      if (links[id]) {
        entity = links[id];
      }
      else {
        linkKeys.some(function(linkKey) {
          if (linkKey.indexOf(id) > -1) {
            entity = links[linkKey];
            return true;
          }
        });
      }

      return entity;
    });
  });
});