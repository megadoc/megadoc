megadoc.outlets.define('Lua::Module');
megadoc.outlets.define('Lua::Browser');
megadoc.outlets.define('Lua::AllModules');

megadoc.use('megadoc-plugin-lua', function LuaPlugin() {
  require('./outlets/BrowserOutlet');
  require('./outlets/ModuleOutlet');
  require('./outlets/AllModulesOutlet');
});