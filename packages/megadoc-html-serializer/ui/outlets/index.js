exports.outlets = [
  'Core::Banner',
  'Core::Content',
  'Core::Footer',
  'Core::Image',
  'Core::Inspector',
  'Core::LayoutWrapper',
  'Core::Link',
  'Core::Meta',
  'Core::NavBar',
  'Core::NotFound',
  'Core::Root',
  'Core::Sidebar',
  'Core::SidebarHeader',
  'Core::SidebarHeaderLink',
  'Core::SidebarLink',
  'Core::SidebarSearch',
  'Core::Text',
  'Core::Widget',
]

exports.outletOccupants = [
  {
    name: 'Core::SidebarHeader',
    component: require('./SidebarHeaderOutlet')
  },

  {
    name: 'Core::SidebarHeaderLink',
    component: require('./SidebarHeaderLinkOutlet')
  },

  {
    name: 'Core::SidebarLink',
    component: require('./SidebarLinkOutlet')
  },

  {
    name: 'Core::SidebarSearch',
    component: require('./SidebarSearchOutlet')
  },

  {
    name: 'Core::Image',
    component: require('./ImageOutlet')
  },

  {
    name: 'Core::Link',
    component: require('./LinkOutlet')
  },

  {
    name: 'Core::Text',
    component: require('./TextOutlet')
  },

  {
    name: 'Core::Widget',
    component: require('./WidgetOutlet')
  },
]
