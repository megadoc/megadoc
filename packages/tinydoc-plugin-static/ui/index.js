const React = require('react');
const Outlet = require('components/Outlet');
const StaticFile = require('./components/StaticFile');

tinydoc.use('tinydoc-plugin-static', function TinydocStaticPlugin(api, configs) {
  configs.forEach(function(config) {
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
      Outlet.add(config.outlet, {
        key: `static.${config.url}`,
        match(context) { return context.url === config.url; },
        component
      });
    }
    else {
      api.addRoutes([
        {
          name: `static.${displayName}`,
          path: config.url + config.anchorableHeadings ? '*' : '',
          handler: component
        }
      ]);
    }
  });
});