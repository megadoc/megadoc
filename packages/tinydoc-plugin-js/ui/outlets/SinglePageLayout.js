const React = require('react');
const ClassBrowser = require('components/ClassBrowser');
const { shape, string } = React.PropTypes;

module.exports = function(api, config) {
  const { routeName, navigationLabel } = config;

  if (!api.outlets.has('SinglePageLayout::ContentPanel')) {
    return;
  }

  api.outlets.add('SinglePageLayout::ContentPanel', {
    component: require('../screens/AllModules')(routeName, config),
    key: `${routeName}-all-modules`
  });

  api.outlets.add('SinglePageLayout::Sidebar', {
    key: `${routeName}-class-browser`,
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
          <div>
            {navigationLabel && (
              <header className="single-page-layout__sidebar-header">
                {navigationLabel}
              </header>
            )}

            <ClassBrowser
              routeName={routeName}
              activeModuleId={moduleId && decodeURIComponent(moduleId)}
              activeEntityId={entity && decodeURIComponent(entity)}
              withControls={false}
            />
          </div>
        );
      }
    }),
  });
};