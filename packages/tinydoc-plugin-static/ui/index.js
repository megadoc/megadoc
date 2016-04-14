const React = require('react');
const Outlet = require('components/Outlet');
const StaticFile = require('./components/StaticFile');
const StandaloneStaticFile = require('./components/StandaloneStaticFile');

tinydoc.use('tinydoc-plugin-static', function(api, configs) {
  configs.forEach(function(config) {
    const displayName = config.url.trim()
      .replace(/\W+/g, '-')
      .replace(/^\-|\-$/g, '')
    ;

    if (config.outlet) {
      Outlet.add(config.outlet, {
        key: `static.${config.url}`,
        match(context) { return context.url === config.url; },
        component: React.createClass({
          displayName: `Static__${displayName}`,
          render() {
            return <StaticFile file={config.file} />
          }
        })
      });
    }
    else {
      api.addRoutes([
        {
          name: `static.${displayName}`,
          path: config.url,
          handler: React.createClass({
            displayName: `Static__${displayName}`,
            render() {
              return <StandaloneStaticFile file={config.file} />
            }
          })
        }
      ]);
    }
  });
});