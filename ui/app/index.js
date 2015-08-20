var React = require('react');
var Router = require('react-router');
var RouteActions = require('actions/RouteActions');
var config = require('config');
var PluginManager = require('core/PluginManager');
var EventEmitter = require('core/EventEmitter');
var OutletStore = require('stores/OutletStore');
var $ = require('jquery');
var Storage = require('core/Storage');
var { Route, DefaultRoute, NotFoundRoute } = Router;
var K = require('constants');

Storage.register(K.CFG_COLOR_SCHEME, K.DEFAULT_SCHEME);
Storage.register(K.CFG_SYNTAX_HIGHLIGHTING, true);

/**
 * @namespace tinydocReact
 */
window.tinydocReact = {};

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
    var router = Router.create({
      location: config.useHashLocation ? Router.HashLocation : Router.HistoryLocation,
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

    OutletStore.setOutletElements(registrar.getOutletElements());

    router.run(function(Handler, state) {
      React.render(<Handler onStart={emitStarted} {...state} />, document.body);
    });
  });

  if (!config.useHashLocation) {
    $(document.body).on('click', 'a[data-internal="true"]', function(e) {
      var $a = $(e.target);
      e.preventDefault();
      RouteActions.transitionTo($a.attr('href').replace(/^#/, ''));
    });
  }
});

var pluginMgr = new PluginManager(config.pluginScripts.length, emitter);

/**
 * @method tinydocReact.use
 *
 * @param {Function} pluginEntryRunner
 *        The function that will register your plugin.
 *
 * @param {PluginRegistrar} pluginEntryRunner.api
 *        The plugin registration API you can use.
 */
window.tinydocReact.use = pluginMgr.use;
