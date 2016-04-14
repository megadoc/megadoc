tinydoc.outlets.define('SinglePageLayout::Wrapper');
tinydoc.outlets.define('SinglePageLayout::Sidebar');
tinydoc.outlets.define('SinglePageLayout::ContentPanel');

tinydoc.use(function SinglePageLayout() {
  tinydoc.outlets.add('Layout', {
    key: 'SinglePageLayout',
    component: require('./components/SinglePageLayout')
  });
});