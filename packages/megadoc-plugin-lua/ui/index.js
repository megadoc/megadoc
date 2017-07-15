const BrowserOutlet = require('./outlets/BrowserOutlet');
const ModuleOutlet = require('./outlets/ModuleOutlet');
const IndexOutlet = require('./outlets/IndexOutlet');
const AllModulesOutlet = require('./outlets/AllModulesOutlet');

module.exports = {
  name: 'megadoc-plugin-lua',
  outlets: [
    'Lua::Module',
    'Lua::Browser',
    'Lua::AllModules',
    'Lua::Index',
  ],

  outletOccupants: [
    {
      name: 'Lua::AllModules',
      component: AllModulesOutlet
    },
    {
      name: 'Lua::Browser',
      component: BrowserOutlet
    },

    {
      name: 'Lua::Module',
      component: ModuleOutlet
    },
    {
      name: 'Lua::Index',
      component: IndexOutlet
    },
  ]
};