const React = require('react');
const ClassBrowser = require('components/ClassBrowser');
const OutletManager = require('core/OutletManager');
const Database = require('core/Database');

module.exports = function(routeName) {
  const database = Database.for(routeName);

  OutletManager.add('SinglePageLayout::ContentPanel', {
    component: require('../screens/AllModules')(routeName),
    key: `${routeName}-all-modules`
  });

  OutletManager.add('SinglePageLayout::Sidebar', {
    key: `${routeName}-class-browser`,
    component: React.createClass({
      render() {
        return (
          <ClassBrowser
            routeName={routeName}
            activeModuleId={this.props.params.moduleId}
          />
        );
      }
    }),
  });
};