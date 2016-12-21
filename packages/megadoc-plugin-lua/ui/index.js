const BrowserOutlet = require('./outlets/BrowserOutlet');
const ModuleOutlet = require('./outlets/ModuleOutlet');
const AllModulesOutlet = require('./outlets/AllModulesOutlet');

module.exports = {
  name: 'megadoc-plugin-lua',
  outlets: [
    'Lua::Module',
    'Lua::Browser',
    'Lua::AllModules',
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
  ]
};