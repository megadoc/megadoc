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
var OutletManager = require('core/OutletManager');

Storage.register(K.CFG_COLOR_SCHEME, K.DEFAULT_SCHEME);
Storage.register(K.CFG_SYNTAX_HIGHLIGHTING, true);

/**
 * @namespace tinydoc
 */
let tinydoc = window.tinydoc = {
  publicModules: require('../tmp/publicModules')
};

var emitter = new EventEmitter([
  'pluginsLoaded',
  'starting',
  'started'
]);

OutletManager.add('SinglePageLayout::ContentPanel', {
  component: require('./screens/Home'),
  key: 'home'
});


emitter.on('pluginsLoaded', function start(registrar) {
  var emitStarted = function() {
    emitter.emit('started');
  };

  console.log('Ok, firing up.');

  emitter.emit('starting');

  $(function() {
    var router = ReactRouter.create({
      location: ReactRouter.HashLocation,

      routes: [
        <Route name="root" path="/" handler={require('./screens/Root')}>
          <DefaultRoute
            name="home"
            handler={require('./screens/Home')}
            ignoreScrollBehavior
          />

          <Route
            name="readme"
            path="/readme*"
            handler={require('./screens/Home')}
            ignoreScrollBehavior
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

OutletManager.define('navigation');

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
tinydoc.getRuntimeConfigs = function(pluginId) {
  return config.pluginConfigs[pluginId] || [];
};

tinydoc.seal = function() {
  tinydoc.use = function() {
    console.warn(
      "You are attempting to call 'tinydoc.use()' after all plugins were " +
      "loaded. This probably means you forgot to register your " +
      "script as a plugin script."
    );
  }
};

tinydoc.pluginMgr = pluginMgr;