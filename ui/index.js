var React = require('react');
var ReactRouter = require('react-router');
var Router = require('core/Router');
var config = require('config');
var createTinydoc = require('core/tinydoc');
var Storage = require('core/Storage');
var { Route, NotFoundRoute, Redirect } = ReactRouter;
var K = require('constants');
var DocumentURI = require('core/DocumentURI');

Storage.register(K.CFG_COLOR_SCHEME, K.DEFAULT_SCHEME);
Storage.register(K.CFG_SYNTAX_HIGHLIGHTING, true);

const tinydoc = window.tinydoc = createTinydoc(config);

console.log('tinydoc: version %s', config.version);

tinydoc.publicModules = require('../tmp/publicModules');

// expose this to plugins so that we can move to a non-global version in the
// future
tinydoc.outlets = require('components/Outlet');
tinydoc.outlets.define('LayoutWrapper');
tinydoc.outlets.define('Layout');

tinydoc.onReady(function(registrar) {
  console.log('Ok, firing up.');

  const routes = [
    <Route
      name="root"
      path="/"
      handler={require('./screens/Root')}
      ignoreScrollBehavior
    >
      {config.home && <Redirect from="/" to={config.home} />}

      <Route name="settings" path="/settings" handler={require('./screens/Settings')} />
      <Route name="404" path="/404" handler={require('./screens/NotFound')} />

      <NotFoundRoute name="not-found" handler={require('./screens/NotFound')} />
      {registrar.getRouteMap()}
    </Route>
  ];

  const location = config.$static ? new ReactRouter.StaticLocation('/') : require('./CustomLocation');
  const router = ReactRouter.create({
    location,
    routes
  });

  const container = document.querySelector('#__app__');

  // const { makePath } = router;
  // const { emittedFileExtension } = config;
  // const regexpFileExtension = new RegExp(config.emittedFileExtension + '$');

  // router.makePath = function appendFileExtensionToURLIfNeeded() {
  //   const url = makePath.apply(router, arguments);

  //   if (emittedFileExtension.length && !url.match(regexpFileExtension)) {
  //     return url + config.emittedFileExtension;
  //   }
  //   else {
  //     return url;
  //   }
  // };

  Router.setInstance(router);

  if (config.$static) {
    config.$static.readyCallback({
      render(href, done) {
        location.path = href;

        router.run(function(Handler, state) {
          if (process.env.DEBUG) {
            console.log('[DEBUG] Rendered using:', state.routes[state.routes.length-1].name);
          }

          if (state.routes.length && state.routes[state.routes.length-1].name === 'not-found') {
            return done(404);
          }

          done(null, React.renderToString(<Handler {...state} />));
        });
      },

      dumpRoutes: function() {
        return dumpRoute(router.routes[0]);
      }
    });

  }
  else {
    router.run(function(Handler, state) {
      React.render(<Handler {...state} />, container);
    });
  }
});

module.exports = tinydoc;

function dumpRoute(route) {
  return {
    path: route.path,
    name: route.name,
    children: (route.childRoutes || []).map(dumpRoute)
  };
}