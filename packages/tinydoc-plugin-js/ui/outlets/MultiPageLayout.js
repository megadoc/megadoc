const React = require('react');
const ClassBrowser = require('components/ClassBrowser');
const Link = require('components/Link');
const Icon = require('components/Icon');
const { shape, string } = React.PropTypes;

module.exports = function(api, config) {
  const { navigationLabel, icon, routeName } = config;

  if (!api.outlets.has('MultiPageLayout::Banner')) {
    return;
  }

  api.outlets.add('MultiPageLayout::Banner', {
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

  api.outlets.add('MultiPageLayout::Content', {
    key: routeName,

    match(props) { return props.path.match(`^/${routeName}`); },

    component: require('../screens/Root')(routeName),
  });

  api.outlets.add('MultiPageLayout::Sidebar', {
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