const Outlet = require('components/Outlet');

Outlet.define('MultiPageLayout::Banner');
Outlet.define('MultiPageLayout::Content');
Outlet.define('MultiPageLayout::Sidebar');

tinydoc.use('tinydoc-layout-multi-page', function MultiPageLayout(api, configs) {
  Outlet.add('Layout', {
    key: 'MultiPageLayout',
    component: require('./components/MultiPageLayout')(configs[0])
  })
});