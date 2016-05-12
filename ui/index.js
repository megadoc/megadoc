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
tinydoc.outlets.define('Layout::Banner');
tinydoc.outlets.define('Layout::Content');
tinydoc.outlets.define('Layout::Sidebar');
tinydoc.outlets.define('Layout::SidebarHeader');
tinydoc.outlets.define('Layout::Footer');
tinydoc.outlets.define('Inspector');

require('./outlets/SidebarHeaderOutlet')(tinydoc);

tinydoc.start = function(options = {}) {
  const currentDocument = tinydoc.corpus.get(options.startingDocumentUID);

  config.mountPath = MountPath(currentDocument);

  tinydoc.onReady(function(registrar) {
    console.log('Ok, firing up.');
    console.log('Mount path = "%s".', config.mountPath);

    const routes = RouteMap(config, registrar);
    const location = Location(config);
    const router = ReactRouter.create({ location, routes });

    Router.setInstance(router);

    if (config.$static) {
      config.$static.readyCallback({
        render(href, done) {
          // location.path = href.indexOf('/index') === 0 ? '/' : href;
          location.path = href;

          router.run(function(Handler, state) {
            if (process.env.DEBUG) {
              console.log('[DEBUG] Rendered using:', state.routes[state.routes.length-1].name);
            }

            // if (state.routes.length && state.routes[state.routes.length-1].name === 'not-found') {
            //   return done(404);
            // }

            done(null, React.renderToString(<Handler {...state} config={config} />));
          });
        },

        dumpRoutes: function() {
          return dumpRoute(router.routes[0]);
        }
      });

    }
    else {
      router.run(function(Handler, state) {
        React.render(<Handler {...state} config={config} />, document.querySelector('#__app__'));
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
      <Route name="settings" path="/settings" handler={require('./screens/Settings')} />
      <Route name="404" path="/404" handler={require('components/NotFound')} />

      <NotFoundRoute name="not-found" handler={require('./screens/Root')} />
      {registrar.getRouteMap()}
    </Route>
  );
}

function MountPath(currentDocument) {
  if (currentDocument) {
    return location.pathname.replace(currentDocument.meta.href, '');
  }
  else {
    return '';
  }
}