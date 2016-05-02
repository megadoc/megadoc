var React = require('react');
var ReactRouter = require('react-router');
var Router = require('core/Router');
var config = require('config');
var createTinydoc = require('core/tinydoc');
var Storage = require('core/Storage');
var { Route, NotFoundRoute, Redirect } = ReactRouter;
var K = require('constants');

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
      <Route name="404" handler={require('./screens/NotFound')} />

      <NotFoundRoute name="not-found" handler={require('./screens/NotFound')} />

      {registrar.getRouteMap()}
    </Route>
  ];

  const location = config.$static ? new ReactRouter.StaticLocation('/') : ReactRouter.HashLocation;
  const router = ReactRouter.create({
    location,
    routes
  });
  const container = document.querySelector('#__app__');

  Router.setInstance(router);

  if (config.$static) {
    config.$static.readyCallback({
      render(href, done) {
        location.path = href;

        router.run(function(Handler, state) {
          done(React.renderToString(<Handler {...state} />));
        });
      }
    });

  }
  else {
    if (window.location.pathname.match(/([^\/]+)\.html$/) && RegExp.$1 !== 'index') {
      const documentPath = window.location.pathname
        .replace(config.assetRoot + '/' + config.outputDir, '')
        .replace(/\.html$/, '')
      ;

      window.location.hash = '#' + documentPath;
    }

    router.run(function(Handler, state) {
      React.render(<Handler {...state} />, container);
    });
  }
});

module.exports = tinydoc;