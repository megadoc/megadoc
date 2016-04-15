var React = require('react');
var ReactRouter = require('react-router');
var Router = require('core/Router');
var config = require('config');
var createTinydoc = require('core/tinydoc');
var Storage = require('core/Storage');
var { Route, DefaultRoute, NotFoundRoute } = ReactRouter;
var K = require('constants');
var OutletManager = require('core/OutletManager');

Storage.register(K.CFG_COLOR_SCHEME, K.DEFAULT_SCHEME);
Storage.register(K.CFG_SYNTAX_HIGHLIGHTING, true);

const tinydoc = window.tinydoc = createTinydoc(config);

console.log('tinydoc: version %s', config.version);

tinydoc.publicModules = require('../tmp/publicModules');

// expose this to plugins so that we can move to a non-global version in the
// future
tinydoc.outlets = OutletManager;
tinydoc.outlets.define('LayoutWrapper');
tinydoc.outlets.define('Layout');

tinydoc.onReady(function(registrar) {
  console.log('Ok, firing up.');

  var router = ReactRouter.create({
    location: ReactRouter.HashLocation,

    routes: [
      <Route
        name="root"
        path="/"
        handler={require('./screens/Root')}
        ignoreScrollBehavior={true || config.layout === 'single-page'}
      >
        <DefaultRoute
          name="home"
          handler={require('./screens/Home')}
        />

        {registrar.getRouteMap()}

        <Route
          name="search"
          path="/search"
          handler={require('./screens/Search')}
        />

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
    React.render(<Handler {...state} />, document.querySelector('#__app__'));
  });
});
