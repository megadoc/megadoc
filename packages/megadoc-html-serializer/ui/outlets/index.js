module.exports = function registerOutlets(outlets) {
  // expose this to plugins so that we can move to a non-global version in the
  // future
  outlets = outlets;
  outlets.define('Core::Banner');
  outlets.define('Core::Content');
  outlets.define('Core::Footer');
  outlets.define('Core::Image');
  outlets.define('Core::Inspector');
  outlets.define('Core::LayoutWrapper');
  outlets.define('Core::Link');
  outlets.define('Core::Meta');
  outlets.define('Core::NavBar');
  outlets.define('Core::NotFound');
  outlets.define('Core::Sidebar');
  outlets.define('Core::SidebarHeader');
  outlets.define('Core::SidebarHeaderLink');
  outlets.define('Core::SidebarLink');
  outlets.define('Core::SidebarSearch');
  outlets.define('Core::Text');
  outlets.define('Core::Widget');

  outlets.add('Core::SidebarHeader', {
    component: require('./SidebarHeaderOutlet')
  })

  outlets.add('Core::SidebarHeaderLink', {
    component: require('./SidebarHeaderLinkOutlet')
  })

  outlets.add('Core::SidebarLink', {
    component: require('./SidebarLinkOutlet')
  })

  outlets.add('Core::SidebarSearch', {
    component: require('./SidebarSearchOutlet')
  })

  outlets.add('Core::Image', {
    component: require('./ImageOutlet')
  });

  outlets.add('Core::Link', {
    component: require('./LinkOutlet')
  });

  outlets.add('Core::Text', {
    component: require('./TextOutlet')
  })

  outlets.add('Core::Widget', {
    component: require('./WidgetOutlet')
  })
}