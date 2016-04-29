const React = require('react');
const AllModules = require('./screens/AllModules');
const Browser = require('./components/Browser');
const { shape, } = React.PropTypes;

tinydoc.use(function(api) {
  tinydoc.getRuntimeConfigs('lua').forEach(function(config) {
    const { routeName } = config;

    api.addRoutes([
      {
        name: `${routeName}.module`,
        path: `${routeName}/:moduleId`,
        handler: require('./screens/Module')
      },
      {
        name: `${routeName}.module.entity`,
        parent: `${routeName}.module`,
        path: ':entityId',
        handler: require('./screens/Module')
      }
    ]);

    api.outlets.add('SinglePageLayout::ContentPanel', {
      key: `${routeName}--modules`,
      component: React.createClass({
        render() {
          return <AllModules routeName={routeName} database={config.database} />
        }
      })
    });

    api.outlets.add('SinglePageLayout::Sidebar', {
      key: `${routeName}--browser`,
      component: React.createClass({
        propTypes: {
          params: shape,
        },

        render() {
          return (
            <div>
              {config.sidebarTitle && (
                <header className="sidebar__header">
                  {config.sidebarTitle}
                </header>
              )}
              <Browser
                params={this.props.params}
                routeName={routeName}
                database={config.database}
              />
            </div>
          );
        }
      })
    });

  });
});