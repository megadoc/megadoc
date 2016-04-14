const Outlet = require('components/Outlet');

Outlet.define('MultiPageLayout::Banner');
Outlet.define('MultiPageLayout::Content');
Outlet.define('MultiPageLayout::Sidebar');

tinydoc.use(function() {
  Outlet.add('Layout', {
    key: 'MultiPageLayout',
    component: require('./components/MultiPageLayout')
  })
});