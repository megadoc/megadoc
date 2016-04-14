const React = require('react');
const ClassBrowser = require('components/ClassBrowser');
const { shape, string } = React.PropTypes;

module.exports = function(config) {
  const { routeName } = config;

  return {
    match(props) { return props.path.match(`^/${routeName}`); },
    component: React.createClass({
      displayName: `JSSidebar:${routeName}`,

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
  };
};