tinydoc.outlets.define('MultiPageLayout::Banner');
tinydoc.outlets.define('MultiPageLayout::Content');
tinydoc.outlets.define('MultiPageLayout::Sidebar');

tinydoc.use('tinydoc-layout-multi-page', function MultiPageLayout(api, configs) {
  tinydoc.outlets.add('Layout', {
    key: 'MultiPageLayout',
    component: require('./components/MultiPageLayout')(configs[0])
  })
});