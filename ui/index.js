var React = require('react');
var ReactRouter = require('react-router');
var Router = require('core/Router');
var config = require('config');
var createTinydoc = require('core/tinydoc');
var Storage = require('core/Storage');
var { Route, DefaultRoute, NotFoundRoute } = ReactRouter;
var K = require('constants');
var OutletManager = require('core/OutletManager');
var SinglePageLayoutOutlet = require('./outlets/SinglePageLayoutOutlet');

Storage.register(K.CFG_COLOR_SCHEME, K.DEFAULT_SCHEME);
Storage.register(K.CFG_SYNTAX_HIGHLIGHTING, true);

OutletManager.define('Navigation');
OutletManager.define('LayoutWrapper');
OutletManager.define('SinglePageLayout::Wrapper');
OutletManager.define('SinglePageLayout::Sidebar');
OutletManager.define('SinglePageLayout::ContentPanel');

SinglePageLayoutOutlet(config);

let tinydoc = window.tinydoc = createTinydoc(config);

tinydoc.publicModules = require('../tmp/publicModules');

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

        <Route
          name="readme"
          path="/readme*"
          handler={require('./screens/Home')}
          ignoreScrollBehavior
        />

        {registrar.getRouteMap()}

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
