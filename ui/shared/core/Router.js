const config = require('config');
const invariant = require('utils/invariant');


/**
 * Routing APIs for the app.
 */
let Router = exports;
let instance;

Router.setInstance = function(_instance) {
  instance = _instance;
};

if (process.env.NODE_ENV === 'development') {
  Router.getInstance = function() {
    console.warn('You are using a development-only method.');
    return instance;
  };
}

/**
 * Update the query string to reflect the new given key/value pairs. This
 * will trigger a re-transition of the current route.
 *
 * @param  {Object} newQuery
 *         The query parameters.
 */
Router.updateQuery = function(newQuery) {
  invariant(false, "Routing is disabled!");

  var routes = instance.getCurrentRoutes();
  var currentRouteName = routes[routes.length-1].name;
  var query = instance.getCurrentQuery();

  Object.keys(newQuery).forEach(function(key) {
    query[key] = newQuery[key];

    if (query[key] === null) {
      delete query[key];
    }
  });

  instance.replaceWith(currentRouteName, instance.getCurrentParams(), query);
};

Router.transitionTo = function(path, params, query) {
  invariant(false, "Routing is disabled!");

  instance.transitionTo(path, params, query);
};

Router.replaceWith = function(path, params, query) {
  invariant(false, "Routing is disabled!");

  instance.replaceWith(path, params, query);
};

Router.getQueryItem = function(item) {
  invariant(false, "Routing is disabled!");

  if (instance) {
    return instance.getCurrentQuery()[item];
  }
};

Router.makeHref = function(name, params, query) {
  invariant(false, "Routing is disabled!");

  return instance.makeHref(name, params, query);
};

Router.refresh = function() {
  invariant(false, "Routing is disabled!");

  instance.refresh();
};

// force the browser to (re)scroll to the proper location
Router.refreshScroll = function() {
  invariant(false, "Routing is disabled!");

  const originalLocation = window.location.hash;

  if (originalLocation && originalLocation.length > 0) {
    setTimeout(function() {
      window.location.hash = '';
      window.location.hash = originalLocation;
    }, 0);
  }
};

/**
 * @deprecated
 *
 * Hello.
 *
 * @param  {String} options.routeName [description]
 * @param  {Object} options.params    [description]
 *
 * @return {String}                   [description]
 */
Router.generateAnchorId = function({ routeName, params }) {
  invariant(false, "Routing is disabled!");

  console.warn(
    'Deprecated: Router.generateAnchorId() should no longer be used as the ' +
    'URIs are resolved at compile-time.'
  );

  return instance.makeHref(routeName, Object.keys(params).reduce(function(encoded, key) {
    encoded[key] = encodeURIComponent(params[key]);
    return encoded;
  }, {})).replace(/^#/, '');
};

Router.getCurrentPath = function() {
  invariant(false, "Routing is disabled!");

  if (instance) {
    return instance.getCurrentPath();
  }
};

Router.isActive = function(routeName) {
  invariant(false, "Routing is disabled!");

  return instance && instance.isRunning && instance.isActive(routeName);
};

Router.isRunning = function() {
  invariant(false, "Routing is disabled!");

  return instance && instance.isRunning;
};

Router.getParamItem = function(item) {
  invariant(false, "Routing is disabled!");

  if (instance) {
    return instance.getCurrentParams()[item];
  }
};

module.exports = Router;
