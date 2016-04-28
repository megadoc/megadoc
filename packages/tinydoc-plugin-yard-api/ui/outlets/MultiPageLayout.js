const React = require('react');
const Database = require('core/Database');
const ClassBrowser = require('components/ClassBrowser');
const RouteHandler = require('components/RouteHandler');
const Icon = require('components/Icon');
const Link = require('components/Link');

module.exports = function(api, config) {
  const baseURL = config.routeName;

  api.outlets.add('MultiPageLayout::Banner', {
    key: 'yard-api__navigation',
    component: React.createClass({
      displayName: 'YARDApiNavigation',

      render() {
        return (
          <Link to="yard-api">
            {config.icon && <Icon className={config.icon} />} {config.navigationLabel || 'API'}
          </Link>
        );
      }
    })
  });

  api.outlets.add('MultiPageLayout::Sidebar', {
    key: 'yard-api__navigation',
    match(props) { return props.path.match(`^/${baseURL}`);  },
    component: React.createClass({
      displayName: 'YARDApiSidebar',

      propTypes: {
        params: React.PropTypes.shape({
          resourceId: React.PropTypes.string
        })
      },

      render() {
        return (
          <ClassBrowser
            activeResourceId={this.props.params.resourceId}
            objects={Database.getAllTags()}
          />
        );
      }
    })
  });

  api.outlets.add('MultiPageLayout::Content', {
    key: 'yard-api',
    match(props) { return props.path.match(`^/${baseURL}`);  },
    component: React.createClass({
      displayName: 'YARDApiContent',

      render() {
        return (
          <RouteHandler baseURL={baseURL} />
        );
      }
    })
  });
};