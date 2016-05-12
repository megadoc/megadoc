tinydoc.outlets.define('Lua::Module');
tinydoc.outlets.define('Lua::Browser');
tinydoc.outlets.define('Lua::AllModules');

tinydoc.use('tinydoc-plugin-lua', function LuaPlugin() {
  require('./outlets/BrowserOutlet');
  require('./outlets/ModuleOutlet');
  require('./outlets/AllModulesOutlet');
});