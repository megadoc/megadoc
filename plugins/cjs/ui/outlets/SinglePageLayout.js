const React = require('react');
const ClassBrowser = require('components/ClassBrowser');
const OutletManager = require('core/OutletManager');
// const Database = require('core/Database');

module.exports = function(routeName, config) {
  // const database = Database.for(routeName);

  OutletManager.add('SinglePageLayout::ContentPanel', {
    component: require('../screens/AllModules')(routeName),
    key: `${routeName}-all-modules`
  });

  OutletManager.add('SinglePageLayout::Sidebar', {
    key: `${routeName}-class-browser`,
    component: React.createClass({
      render() {
        const { moduleId, entity } = this.props.params;

        return (
          <div>
            <h2>{config.navigationLabel}</h2>

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