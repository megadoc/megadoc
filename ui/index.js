const React = require('react');
const ReactRouter = require('react-router');
const Router = require('core/Router');
const config = require('config');
const createTinydoc = require('core/tinydoc');
const Storage = require('core/Storage');
const { Route, NotFoundRoute, Redirect } = ReactRouter;
const K = require('constants');
const CustomLocation = require('./CustomLocation');
const tinydoc = window.tinydoc = createTinydoc(config);

console.log('tinydoc: version %s', config.version);

Storage.register(K.CFG_COLOR_SCHEME, K.DEFAULT_SCHEME);
Storage.register(K.CFG_SYNTAX_HIGHLIGHTING, true);

tinydoc.publicModules = require('../tmp/publicModules');

// expose this to plugins so that we can move to a non-global version in the
// future
tinydoc.outlets = require('components/Outlet');
tinydoc.outlets.define('LayoutWrapper');
tinydoc.outlets.define('Layout');

tinydoc.start = function() {
  tinydoc.onReady(function(registrar) {
    console.log('Ok, firing up.');

    const routes = RouteMap(config, registrar);
    const location = Location(config);
    const router = HijackedRouter(config, { location, routes });

    Router.setInstance(router);

    if (config.$static) {
      config.$static.readyCallback({
        render(href, done) {
          location.path = href.indexOf('/index') === 0 ? '/' : href;
          // location.path = href;

          router.run(function(Handler, state) {
            if (process.env.DEBUG) {
              console.log('[DEBUG] Rendered using:', state.routes[state.routes.length-1].name);
            }

            // if (state.routes.length && state.routes[state.routes.length-1].name === 'not-found') {
            //   return done(404);
            // }

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
        React.render(<Handler {...state} />, document.querySelector('#__app__'));
      });
    }
  });
};

module.exports = tinydoc;

function dumpRoute(route) {
  return {
    path: route.path,
    name: route.name,
    children: (route.childRoutes || []).map(dumpRoute)
  };
}

function Location(config) {
  if (config.$static) {
    return new ReactRouter.StaticLocation('/');
  }
  else if (config.useHashLocation) {
    return ReactRouter.HashLocation;
  }
  else {
    return CustomLocation;
  }
}

function RouteMap(config, registrar) {
  return (
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
  );
}

function HijackedRouter(config, options) {
  const router = ReactRouter.create(options);
  // const { makePath } = router;

  // if (!config.useHashLocation) {
  //   router.makePath = function stripFileExtensionFromURL() {
  //     const url = makePath.apply(router, arguments);
  //     return DocumentURI.withoutExtension(url);
  //   };
  // }

  return router;
}