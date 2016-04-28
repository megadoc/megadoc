const React = require('react');
const StaticFile = require('./components/StaticFile');
const SymbolIndexer = require('./SymbolIndexer');

tinydoc.use('tinydoc-plugin-static', function StaticPlugin(api, configs) {
  configs.forEach(function(config) {
    SymbolIndexer(api, config);

    const displayName = config.url.trim()
      .replace(/\W+/g, '-')
      .replace(/^\-|\-$/g, '')
    ;

    const component = React.createClass({
      displayName: `Static__${displayName}`,
      render() {
        return <StaticFile {...config} />
      }
    });

    if (config.outlet) {
      tinydoc.outlets.add(config.outlet, {
        key: `static.${config.url}`,
        match: !tinydoc.isPluginEnabled('tinydoc-layout-single-page') && function(context) {
          return context.url === config.url;
        },
        component
      });
    }
    else {
      api.addRoutes([
        {
          name: `static.${displayName}`,
          path: `${config.url}${config.anchorableHeadings ? '*' : ''}`,
          handler: component
        }
      ]);
    }
  });
});