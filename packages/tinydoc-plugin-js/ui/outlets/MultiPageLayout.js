const React = require('react');
const ClassBrowser = require('components/ClassBrowser');
const Outlet = require('components/Outlet');
const Link = require('components/Link');
const Icon = require('components/Icon');
const { shape, string } = React.PropTypes;

module.exports = function(routeName, config) {
  const { navigationLabel, icon } = config;

  Outlet.add('MultiPageLayout::Banner', {
    key: routeName,

    component: React.createClass({
      displayName: 'CJSNavigation',

      render() {
        return (
          <Link to={routeName}>
            {icon && <Icon className={icon} />} {navigationLabel}
          </Link>
        );
      }
    })
  });

  Outlet.add('MultiPageLayout::Content', {
    key: routeName,

    match(props) { return props.path.match(`^/${routeName}`); },

    component: require('../screens/Root')(routeName),
  });

  Outlet.add('MultiPageLayout::Sidebar', {
    key: routeName,

    match(props) { return props.path.match(`^/${routeName}`); },

    component: React.createClass({
      propTypes: {
        params: shape({
          moduleId: string,
          entity: string,
        })
      },

      render() {
        const { moduleId, entity } = this.props.params;

        return (
          <ClassBrowser
            routeName={routeName}
            activeModuleId={moduleId && decodeURIComponent(moduleId)}
            activeEntityId={entity && decodeURIComponent(entity)}
            withControls={false}
          />
        );
      }
    }),
  });
};