var config = require('config');
var NavigationOutlet = require('./outlets/Navigation');
var React = require('react');
var Root = require('./screens/Root');
var LinkResolver = require('core/LinkResolver');
var resolveLinksInMarkdown = require('core/resolveLinksInMarkdown');
var Database = require('core/Database');

tinydocReact.use(function(api) {
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

    config.collections.forEach(function(collection) {
      LinkResolver.registerScanner(
        resolveLinksInMarkdown.bind(null, collection.name)
      );
    });

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