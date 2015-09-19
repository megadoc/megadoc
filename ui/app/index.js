var React = require('react');
var ReactRouter = require('react-router');
var Router = require('core/Router');
var config = require('config');
var PluginManager = require('core/PluginManager');
var EventEmitter = require('core/EventEmitter');
var $ = require('jquery');
var Storage = require('core/Storage');
var { Route, DefaultRoute, NotFoundRoute } = ReactRouter;
var K = require('constants');

Storage.register(K.CFG_COLOR_SCHEME, K.DEFAULT_SCHEME);
Storage.register(K.CFG_SYNTAX_HIGHLIGHTING, true);

/**
 * @namespace tinydoc
 */
let tinydoc = window.tinydoc = {};

var emitter = new EventEmitter([
  'pluginsLoaded',
  'starting',
  'started'
]);

emitter.on('pluginsLoaded', function start(registrar) {
  var emitStarted = function() {
    emitter.emit('started');
  };

  var publicPath = config.publicPath.length === 0 ? '/' : config.publicPath;

  console.log('Ok, firing up.');
  console.log('Base path is set to "%s".', publicPath);

  emitter.emit('starting');

  $(function() {
    var router = ReactRouter.create({
      location: config.useHashLocation ?
        ReactRouter.HashLocation :
        ReactRouter.HistoryLocation
      ,

      routes: [
        <Route name="root" path={publicPath} handler={require('./screens/Root')}>
          <DefaultRoute
            name="home"
            handler={require('./screens/Home')}
          />

          {registrar.getPluginRouteMap()}

          <Route
            name="settings"
            path="/settings"
            handler={require('./screens/Settings')}
          />

          <Route
            name="404"
            handler={require('./screens/NotFound')}
          />

          <NotFoundRoute
            name="not-found"
            handler={require('./screens/NotFound')}
          />
        </Route>
      ]
    });

    Router.setInstance(router);

    router.run(function(Handler, state) {
      React.render(<Handler onStart={emitStarted} {...state} />, document.body);
    });
  });
});

var pluginMgr = new PluginManager(config.pluginCount, emitter);

/**
 * @method tinydoc.use
 *
 * @param {Function} pluginEntryRunner
 *        The function that will register your plugin.
 *
 * @param {PluginRegistrar} pluginEntryRunner.api
 *        The plugin registration API you can use.
 */
tinydoc.use = pluginMgr.use;
tinydoc.addPluginConfig = pluginMgr.addPluginConfig;
tinydoc.getRuntimeConfigs = function(pluginId) {
  return CONFIG.pluginConfigs[pluginId];
};

tinydoc.pluginMgr = pluginMgr;