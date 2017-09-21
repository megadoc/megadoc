module.exports = function registerOutlets(outlets) {
  const add = ({ names, component }) => {
    names.forEach(name => {
      outlets.add(name, { key: name, component })
    })
  }

  // expose this to plugins so that we can move to a non-global version in the
  // future
  outlets = outlets;
  outlets.define('Meta');
  outlets.define('LayoutWrapper');
  outlets.define('Layout');
  outlets.define('Layout::Banner');
  outlets.define('Layout::Content');
  outlets.define('Layout::Sidebar');
  outlets.define('Layout::NavBar');
  outlets.define('Layout::SidebarHeader'); // deprecated
  outlets.define('Layout::SidebarLink');   // deprecated
  outlets.define('Layout::SidebarSearch'); // deprecated
  outlets.define('Layout::Footer');
  outlets.define('Layout::NotFound');
  outlets.define('Image');
  outlets.define('Inspector');
  outlets.define('Link');
  outlets.define('SidebarHeader');
  outlets.define('SidebarLink');
  outlets.define('SidebarSearch');
  outlets.define('Text');

  outlets.add('Link', {
    key: 'Link',
    component: require('./LinkOutlet')
  });

  add({
    names: [ 'Layout::SidebarHeader', 'SidebarHeader' ],
    component: require('./SidebarHeaderOutlet')
  })

  add({
    names: [ 'Layout::SidebarLink', 'SidebarLink' ],
    component: require('./SidebarLinkOutlet')
  })

  add({
    names: [ 'Layout::SidebarSearch', 'SidebarSearch' ],
    component: require('./SidebarSearchOutlet')
  })

  outlets.add('Image', {
    key: 'Image',
    component: require('./ImageOutlet')
  });

  outlets.add('Text', {
    key: 'Text',
    component: require('./TextOutlet')
  })

}